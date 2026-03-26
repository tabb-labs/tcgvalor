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

type UserData = {
  sub: string
  name?: string | null | undefined
  nickname?: string | null | undefined
  picture?: string | null | undefined
  email?: string | null | undefined
}

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

const authenticateWithBearerToken = async (authorizationHeader: string) => {
  const token = authorizationHeader.slice('Bearer '.length)
  const response = await fetch(`${ENV.AUTH_0.ISSUER_BASE_URL()}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  const userInfo = UserInfoSchema.parse(await response.json())
  return { ...userInfo, sub: AUTH0_ID_MAP[userInfo.sub] ?? userInfo.sub }
}

export const currentUserMiddleware = asyncHandler(async (req, _res, next) => {
  const authorizationHeader = req.headers.authorization

  if (authorizationHeader?.startsWith('Bearer ')) {
    try {
      const userInfo = await authenticateWithBearerToken(authorizationHeader)
      if (userInfo) {
        req.currentUser = await findOrCreateUser(userInfo)
        next()
        return
      }
    } catch {
      req.currentUser = null
      next()
      return
    }
  }

  if (!req.oidc.isAuthenticated() || !req.oidc.user) {
    req.currentUser = null
    next()
    return
  }

  const auth0User = parseAuth0User(req.oidc.user)
  req.currentUser = await findOrCreateUser(auth0User)
  next()
})
