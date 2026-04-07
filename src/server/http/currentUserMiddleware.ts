import { auth as jwtAuth } from 'express-oauth2-jwt-bearer'
import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prismaClient'
import { AUTH0_ID_MAP, parseAuth0User } from '../clients/Auth0/parseAuth0User'
import { asyncHandler } from './asyncHandler'
import Emailer from '../Emailer'
import { ENV } from '../env'
import { z } from 'zod'

const UserInfoSchema = z.object({
  sub: z.string(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
})

type UserData = z.infer<typeof UserInfoSchema>

const createUser = async (profile: UserData) => {
  try {
    const user = await prisma.user.create({
      data: {
        externalId: profile.sub,
        email: profile.email ?? '',
        name: profile.name ?? '',
        nickname: profile.nickname ?? '',
        picture: profile.picture ?? '',
      },
    })
    void Emailer.send({
      to: 'miketabb33@gmail.com',
      subject: 'Account Created',
      text: `${profile.email ?? 'Someone'} has created an account!`,
    })
    return user
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return prisma.user.findUnique({ where: { externalId: profile.sub } })
    }
    throw e
  }
}

const fetchUserInfo = async (token: string): Promise<UserData | null> => {
  const response = await fetch(`${ENV.AUTH_0.ISSUER_BASE_URL()}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) return null
  const result = UserInfoSchema.safeParse(await response.json())
  if (!result.success) return null
  return { ...result.data, sub: AUTH0_ID_MAP[result.data.sub] ?? result.data.sub }
}

const findOrCreateOidcUser = async (profile: UserData) => {
  return (await prisma.user.findUnique({ where: { externalId: profile.sub } })) ?? (await createUser(profile))
}

const findOrCreateBearerUser = async (sub: string, token: string) => {
  const existing = await prisma.user.findUnique({ where: { externalId: sub } })
  if (existing) return existing
  const profile = (await fetchUserInfo(token)) ?? { sub }
  return createUser(profile)
}

const jwtValidator = jwtAuth({
  issuerBaseURL: ENV.AUTH_0.ISSUER_BASE_URL(),
  audience: ENV.AUTH_0.AUDIENCE,
})

const getBearerSub = (req: Request, res: Response): Promise<string | null> =>
  new Promise((resolve) => {
    jwtValidator(req, res, (err) => {
      if (err) {
        resolve(null)
        return
      }
      const sub = req.auth?.payload.sub
      resolve(sub ? AUTH0_ID_MAP[sub] ?? sub : null)
    })
  })

const getOidcUser = (req: Request): UserData | null => {
  if (!req.oidc.isAuthenticated() || !req.oidc.user) return null
  return parseAuth0User(req.oidc.user)
}

export const currentUserMiddleware = asyncHandler(async (req, res, next) => {
  const isBearerTokenRequest = req.headers.authorization?.startsWith('Bearer ')
  if (isBearerTokenRequest) {
    const sub = await getBearerSub(req, res)
    if (!sub) {
      res.status(401).json({ errors: ['Invalid token'] })
      return
    }
    const token = req.headers.authorization!.slice('Bearer '.length)
    req.currentUser = await findOrCreateBearerUser(sub, token)
    next()
  } else {
    const profile = getOidcUser(req)
    req.currentUser = profile ? await findOrCreateOidcUser(profile) : null
    next()
  }
})
