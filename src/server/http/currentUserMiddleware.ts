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

const findOrCreateUser = async (data: UserData) => {
  let user = await prisma.user.findUnique({ where: { externalId: data.sub } })
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          externalId: data.sub,
          email: data.email ?? '',
          name: data.name ?? '',
          nickname: data.nickname ?? '',
          picture: data.picture ?? '',
        },
      })
      void Emailer.send({
        to: 'miketabb33@gmail.com',
        subject: 'Account Created',
        text: `${data.email ?? 'Someone'} has created an account!`,
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        user = await prisma.user.findUnique({ where: { externalId: data.sub } })
      } else {
        throw e
      }
    }
  }
  return user
}

const jwtValidator = jwtAuth({
  issuerBaseURL: ENV.AUTH_0.ISSUER_BASE_URL(),
  audience: ENV.AUTH_0.AUDIENCE,
})

const getBearerUser = (req: Request, res: Response): Promise<UserData | null> =>
  new Promise((resolve) => {
    jwtValidator(req, res, (err) => {
      if (err) {
        resolve(null)
        return
      }
      const sub = req.auth?.payload.sub
      if (!sub) {
        resolve(null)
        return
      }
      resolve({ sub: AUTH0_ID_MAP[sub] ?? sub })
    })
  })

const getOidcUser = (req: Request): UserData | null => {
  if (!req.oidc.isAuthenticated() || !req.oidc.user) return null
  return parseAuth0User(req.oidc.user)
}

export const currentUserMiddleware = asyncHandler(async (req, res, next) => {
  const isBearerTokenRequest = req.headers.authorization?.startsWith('Bearer ')
  if (isBearerTokenRequest) {
    const userData = await getBearerUser(req, res)
    if (!userData) {
      res.status(401).json({ errors: ['Invalid token'] })
      return
    }
    req.currentUser = await findOrCreateUser(userData)
    next()
  } else {
    const userData = getOidcUser(req)
    req.currentUser = userData ? await findOrCreateUser(userData) : null
    next()
  }
})
