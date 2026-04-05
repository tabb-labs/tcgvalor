import { Request, Response, NextFunction } from 'express'
import { makeProfileEntityMock } from '../__MOCKS__/profileEntity.mock'

const mockRequiresAuthHandler = jest.fn((_req, _res, next: NextFunction) => next())

jest.mock('express-openid-connect', () => ({
  requiresAuth: jest.fn(() => mockRequiresAuthHandler),
}))

import { requiresAuth } from 'express-openid-connect'
import { oidcOrBearer, guardCurrentUser } from '../../../src/server/http/requiresAuthMiddleware'

const mockRequiresAuth = jest.mocked(requiresAuth)

describe('requiresAuthMiddleware', () => {
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequiresAuthHandler.mockImplementation((_req, _res, next) => next())
    res = { sendError: jest.fn() } as unknown as Response
    next = jest.fn()
  })

  describe('oidcOrBearer', () => {
    describe('when the request has a Bearer token', () => {
      const req = { headers: { authorization: 'Bearer some-token' } } as unknown as Request

      it('calls next directly without invoking requiresAuth', () => {
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuth).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })

    describe('when the request has no Authorization header', () => {
      const req = { headers: {} } as unknown as Request

      it('delegates to requiresAuth', () => {
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuth).toHaveBeenCalled()
        expect(mockRequiresAuthHandler).toHaveBeenCalledWith(req, res, next)
      })
    })

    describe('when the request has a non-Bearer Authorization header', () => {
      const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } } as unknown as Request

      it('delegates to requiresAuth', () => {
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuth).toHaveBeenCalled()
        expect(mockRequiresAuthHandler).toHaveBeenCalledWith(req, res, next)
      })
    })
  })

  describe('guardCurrentUser', () => {
    describe('when currentUser is set', () => {
      const req = { currentUser: makeProfileEntityMock({}) } as unknown as Request

      it('calls next', () => {
        guardCurrentUser(req, res, next)
        expect(next).toHaveBeenCalled()
      })

      it('does not send an error', () => {
        guardCurrentUser(req, res, next)
        expect(res.sendError).not.toHaveBeenCalled()
      })
    })

    describe('when currentUser is null', () => {
      const req = { currentUser: null } as unknown as Request

      it('sends a 401 error', () => {
        guardCurrentUser(req, res, next)
        expect(res.sendError).toHaveBeenCalledWith({ errors: ['User not logged in'], status: 401 })
      })

      it('does not call next', () => {
        guardCurrentUser(req, res, next)
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
