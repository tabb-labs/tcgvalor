import { Request, Response, NextFunction } from 'express'
import { currentUserMiddleware } from '../../../src/server/http/currentUserMiddleware'
import { makeProfileEntityMock } from '../__MOCKS__/profileEntity.mock'
import { AUTH_0_USER, AUTH_0_USER_UNPARSED } from '../clients/Auth0/__MOCKS__/auth0User.mock'
import { prisma } from '../../../prisma/prismaClient'
import Emailer from '../../../src/server/Emailer'
import { parseAuth0User } from '../../../src/server/clients/Auth0/parseAuth0User'

jest.mock('../../../prisma/prismaClient', () => ({
  prisma: { user: { findUnique: jest.fn(), create: jest.fn() } },
}))

jest.mock('../../../src/server/clients/Auth0/parseAuth0User', () => {
  const actual = jest.requireActual<typeof import('../../../src/server/clients/Auth0/parseAuth0User')>(
    '../../../src/server/clients/Auth0/parseAuth0User'
  )
  return { parseAuth0User: jest.fn(), AUTH0_ID_MAP: actual.AUTH0_ID_MAP }
})

jest.mock('../../../src/server/env', () => ({
  ENV: { AUTH_0: { ISSUER_BASE_URL: () => 'https://tcgvalor.us.auth0.com' } },
}))

const mockFindUnique = (prisma as unknown as { user: { findUnique: jest.Mock } }).user.findUnique
const mockCreate = (prisma as unknown as { user: { create: jest.Mock } }).user.create
const mockParseAuth0User = jest.mocked(parseAuth0User)

describe('currentUserMiddleware', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let mockEmailerSend: jest.SpyInstance

  const handler = currentUserMiddleware as (req: Request, res: Response, next: NextFunction) => Promise<void>

  beforeEach(() => {
    jest.clearAllMocks()
    mockEmailerSend = jest.spyOn(Emailer, 'send').mockResolvedValue('')
    res = {} as Response
    next = jest.fn()
  })

  describe('when not authenticated', () => {
    beforeEach(() => {
      req = { headers: {}, oidc: { isAuthenticated: () => false, user: null } } as unknown as Request
    })

    it('should set currentUser to null', async () => {
      await handler(req, res, next)
      expect(req.currentUser).toBeNull()
    })

    it('should call next', async () => {
      await handler(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when authenticated and user exists', () => {
    const existingUser = makeProfileEntityMock({ externalId: AUTH_0_USER.sub })

    beforeEach(() => {
      req = { headers: {}, oidc: { isAuthenticated: () => true, user: AUTH_0_USER_UNPARSED } } as unknown as Request
      mockParseAuth0User.mockReturnValue(AUTH_0_USER)
      mockFindUnique.mockResolvedValue(existingUser)
    })

    it('should set currentUser to the found user', async () => {
      await handler(req, res, next)
      expect(req.currentUser).toEqual(existingUser)
    })

    it('should call next', async () => {
      await handler(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('should not send an email', async () => {
      await handler(req, res, next)
      expect(mockEmailerSend).not.toHaveBeenCalled()
    })
  })

  describe('when authenticated and user does not exist', () => {
    const newUser = makeProfileEntityMock({ externalId: AUTH_0_USER.sub })

    beforeEach(() => {
      req = { headers: {}, oidc: { isAuthenticated: () => true, user: AUTH_0_USER_UNPARSED } } as unknown as Request
      mockParseAuth0User.mockReturnValue(AUTH_0_USER)
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(newUser)
    })

    it('should create a new user', async () => {
      await handler(req, res, next)
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          externalId: AUTH_0_USER.sub,
          email: AUTH_0_USER.email,
          name: AUTH_0_USER.name,
          nickname: AUTH_0_USER.nickname,
          picture: AUTH_0_USER.picture,
        },
      })
    })

    it('should set currentUser to the created user', async () => {
      await handler(req, res, next)
      expect(req.currentUser).toEqual(newUser)
    })

    it('should send a new account email', async () => {
      await handler(req, res, next)
      expect(mockEmailerSend).toHaveBeenCalledWith({
        to: 'miketabb33@gmail.com',
        subject: 'Account Created',
        text: `${AUTH_0_USER.email} has created an account!`,
      })
    })

    it('should call next', async () => {
      await handler(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('bearer token authentication', () => {
    const bearerSub = 'auth0|bearer-user-123'
    const bearerUserInfo = {
      sub: bearerSub,
      name: 'Bearer User',
      nickname: 'bearer',
      picture: null,
      email: 'bearer@test.com',
    }
    const existingUser = makeProfileEntityMock({ externalId: bearerSub })

    const mockFetch = (ok: boolean, body?: object) => {
      global.fetch = jest.fn().mockResolvedValue({
        ok,
        json: () => Promise.resolve(body ?? bearerUserInfo),
      })
    }

    beforeEach(() => {
      req = {
        headers: { authorization: 'Bearer valid-token-123' },
        oidc: { isAuthenticated: () => false, user: null },
      } as unknown as Request
    })

    describe('when the token is valid and user exists', () => {
      beforeEach(() => {
        mockFetch(true)
        mockFindUnique.mockResolvedValue(existingUser)
      })

      it('should set currentUser to the found user', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toEqual(existingUser)
      })

      it('should call next', async () => {
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
      })

      it('should not send an email', async () => {
        await handler(req, res, next)
        expect(mockEmailerSend).not.toHaveBeenCalled()
      })
    })

    describe('when the token is valid and user does not exist', () => {
      const newUser = makeProfileEntityMock({ externalId: bearerSub })

      beforeEach(() => {
        mockFetch(true)
        mockFindUnique.mockResolvedValue(null)
        mockCreate.mockResolvedValue(newUser)
      })

      it('should create a new user', async () => {
        await handler(req, res, next)
        expect(mockCreate).toHaveBeenCalledWith({
          data: {
            externalId: bearerSub,
            email: bearerUserInfo.email,
            name: bearerUserInfo.name,
            nickname: bearerUserInfo.nickname,
            picture: '',
          },
        })
      })

      it('should set currentUser to the created user', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toEqual(newUser)
      })

      it('should send a new account email', async () => {
        await handler(req, res, next)
        expect(mockEmailerSend).toHaveBeenCalledWith({
          to: 'miketabb33@gmail.com',
          subject: 'Account Created',
          text: `${bearerUserInfo.email} has created an account!`,
        })
      })
    })

    describe('when the token is valid and the sub is in the ID map', () => {
      const oldSub = 'auth0|699345a6ba48e5b37b010271'
      const mappedSub = 'auth0|66532576f4306b7b1fa27e04'
      const mappedUser = makeProfileEntityMock({ externalId: mappedSub })

      beforeEach(() => {
        mockFetch(true, { ...bearerUserInfo, sub: oldSub })
        mockFindUnique.mockResolvedValue(mappedUser)
      })

      it('should look up the user by the mapped sub', async () => {
        await handler(req, res, next)
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { externalId: mappedSub } })
      })

      it('should set currentUser to the mapped user', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toEqual(mappedUser)
      })
    })

    describe('when Auth0 rejects the token', () => {
      beforeEach(() => {
        mockFetch(false)
        req = {
          headers: { authorization: 'Bearer invalid-token' },
          oidc: { isAuthenticated: () => false, user: null },
        } as unknown as Request
      })

      it('should set currentUser to null', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toBeNull()
      })

      it('should call next', async () => {
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
      })
    })

    describe('when the fetch throws', () => {
      beforeEach(() => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      })

      it('should set currentUser to null', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toBeNull()
      })

      it('should call next', async () => {
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
      })
    })
  })
})
