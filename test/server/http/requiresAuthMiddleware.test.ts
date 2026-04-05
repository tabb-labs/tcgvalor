import { Request, Response, NextFunction } from 'express'
import { makeProfileEntityMock } from '../__MOCKS__/profileEntity.mock'

const mockRequiresAuthHandler = jest.fn((_req: Request, _res: Response, next: NextFunction) => next())

jest.mock('express-openid-connect', () => ({
  requiresAuth: jest.fn(() => mockRequiresAuthHandler),
}))

import { oidcOrBearer, guardCurrentUser } from '../../../src/server/http/requiresAuthMiddleware'

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
      it('calls next directly without invoking the OIDC handler', () => {
        const req = { headers: { authorization: 'Bearer some-token' } } as unknown as Request
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuthHandler).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })

    describe('when the request has no Authorization header', () => {
      it('delegates to the OIDC requiresAuth handler', () => {
        const req = { headers: {} } as unknown as Request
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuthHandler).toHaveBeenCalledWith(req, res, next)
      })
    })

    describe('when the request has a non-Bearer Authorization header', () => {
      it('delegates to the OIDC requiresAuth handler', () => {
        const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } } as unknown as Request
        oidcOrBearer(req, res, next)
        expect(mockRequiresAuthHandler).toHaveBeenCalledWith(req, res, next)
      })
    })

    describe('when the request has an invalid Bearer token', () => {
      it('calls next so guardCurrentUser rejects via req.currentUser', () => {
        const req = {
          headers: { authorization: 'Bearer expired-token' },
          currentUser: null,
        } as unknown as Request
        oidcOrBearer(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(mockRequiresAuthHandler).not.toHaveBeenCalled()
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

  describe('invalid Bearer token integration', () => {
    it('returns 401 when currentUserMiddleware sets req.currentUser to null for a bad token', () => {
      const req = {
        headers: { authorization: 'Bearer expired-or-invalid-token' },
        currentUser: null,
      } as unknown as Request

      oidcOrBearer(req, res, next)
      expect(next).toHaveBeenCalled()
      ;(next as jest.Mock).mockClear()
      guardCurrentUser(req, res, jest.fn())
      expect(res.sendError).toHaveBeenCalledWith({ errors: ['User not logged in'], status: 401 })
    })
  })
})
