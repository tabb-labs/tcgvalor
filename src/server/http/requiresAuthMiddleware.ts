import { requiresAuth } from 'express-openid-connect'
import { Request, Response, NextFunction } from 'express'

const isBearerRequest = (req: Request) => req.headers.authorization?.startsWith('Bearer ') ?? false

const oidcRequiresAuth = requiresAuth()

export const oidcOrBearer = (req: Request, res: Response, next: NextFunction) => {
  if (isBearerRequest(req)) {
    return next()
  }
  return oidcRequiresAuth(req, res, next)
}

export const guardCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    res.sendError({ errors: ['User not logged in'], status: 401 })
    return
  }
  next()
}

export const requiresAuthMiddleware = [oidcOrBearer, guardCurrentUser]
