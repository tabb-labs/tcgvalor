import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { currentUserMiddleware } from '../../../src/server/http/currentUserMiddleware'
import { makeProfileEntityMock } from '../__MOCKS__/profileEntity.mock'
import { AUTH_0_USER, AUTH_0_USER_UNPARSED } from '../clients/Auth0/__MOCKS__/auth0User.mock'
import { prisma } from '../../../prisma/prismaClient'
import Emailer from '../../../src/server/Emailer'
import { parseAuth0User } from '../../../src/server/clients/Auth0/parseAuth0User'

let mockValidateToken: (req: Request, res: Response, next: NextFunction) => void

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => (req: Request, res: Response, next: NextFunction) => mockValidateToken(req, res, next)),
}))

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
  ENV: {
    AUTH_0: {
      ISSUER_BASE_URL: () => 'https://tcgvalor.us.auth0.com',
      AUDIENCE: 'https://api.tcgvalor.com',
    },
  },
}))

const mockFindUnique = (prisma as unknown as { user: { findUnique: jest.Mock } }).user.findUnique
const mockCreate = (prisma as unknown as { user: { create: jest.Mock } }).user.create
const mockParseAuth0User = jest.mocked(parseAuth0User)

describe('currentUserMiddleware', () => {
  let req: Request
  let res: Response
  let next: jest.Mock
  let mockEmailerSend: jest.SpyInstance
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  const handler = currentUserMiddleware as (req: Request, res: Response, next: NextFunction) => Promise<void>

  beforeEach(() => {
    jest.clearAllMocks()
    mockEmailerSend = jest.spyOn(Emailer, 'send').mockResolvedValue('')
    mockStatus = jest.fn().mockReturnThis()
    mockJson = jest.fn()
    res = { status: mockStatus, json: mockJson } as unknown as Response
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

    describe('when create throws a P2002 race condition', () => {
      const racedUser = makeProfileEntityMock({ externalId: AUTH_0_USER.sub })
      const p2002Error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '0.0.0',
      })

      beforeEach(() => {
        mockCreate.mockRejectedValue(p2002Error)
        mockFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(racedUser)
      })

      it('should fall back to findUnique and set currentUser', async () => {
        await handler(req, res, next)
        expect(req.currentUser).toEqual(racedUser)
      })

      it('should call next', async () => {
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
      })
    })

    describe('when create throws a non-P2002 error', () => {
      const dbError = new Error('Connection lost')

      beforeEach(() => {
        mockFindUnique.mockResolvedValue(null)
        mockCreate.mockRejectedValue(dbError)
      })

      it('should propagate the error to next', async () => {
        await handler(req, res, next)
        expect(next).toHaveBeenCalledWith(dbError)
      })
    })
  })

  describe('bearer token authentication', () => {
    const bearerSub = 'auth0|bearer-user-123'
    const existingUser = makeProfileEntityMock({ externalId: bearerSub })

    beforeEach(() => {
      req = {
        headers: { authorization: 'Bearer valid-token-123' },
        oidc: { isAuthenticated: () => false, user: null },
      } as unknown as Request
    })

    describe('when the token is valid and user exists', () => {
      beforeEach(() => {
        mockValidateToken = (req, _res, next) => {
          Object.assign(req, { auth: { payload: { sub: bearerSub } } })
          next()
        }
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
        mockValidateToken = (req, _res, next) => {
          Object.assign(req, { auth: { payload: { sub: bearerSub } } })
          next()
        }
        mockFindUnique.mockResolvedValue(null)
        mockCreate.mockResolvedValue(newUser)
      })

      it('should create a new user with sub only', async () => {
        await handler(req, res, next)
        expect(mockCreate).toHaveBeenCalledWith({
          data: { externalId: bearerSub, email: '', name: '', nickname: '', picture: '' },
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
          text: 'Someone has created an account!',
        })
      })
    })

    describe('when the token is valid and the sub is in the ID map', () => {
      const oldSub = 'auth0|699345a6ba48e5b37b010271'
      const mappedSub = 'auth0|66532576f4306b7b1fa27e04'
      const mappedUser = makeProfileEntityMock({ externalId: mappedSub })

      beforeEach(() => {
        mockValidateToken = (req, _res, next) => {
          Object.assign(req, { auth: { payload: { sub: oldSub } } })
          next()
        }
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

    describe('when the token is invalid', () => {
      beforeEach(() => {
        mockValidateToken = (_req, _res, next) => {
          next(new Error('Unauthorized'))
        }
      })

      it('should respond with 401', async () => {
        await handler(req, res, next)
        expect(mockStatus).toHaveBeenCalledWith(401)
        expect(mockJson).toHaveBeenCalledWith({ errors: ['Invalid token'] })
      })

      it('should not call next', async () => {
        await handler(req, res, next)
        expect(next).not.toHaveBeenCalled()
      })
    })

    describe('when the token is valid but sub is missing from payload', () => {
      beforeEach(() => {
        mockValidateToken = (req, _res, next) => {
          Object.assign(req, { auth: { payload: {} } })
          next()
        }
      })

      it('should respond with 401', async () => {
        await handler(req, res, next)
        expect(mockStatus).toHaveBeenCalledWith(401)
        expect(mockJson).toHaveBeenCalledWith({ errors: ['Invalid token'] })
      })

      it('should not call next', async () => {
        await handler(req, res, next)
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
