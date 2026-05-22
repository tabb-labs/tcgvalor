jest.mock('@apple/app-store-server-library', () => {
  class VerificationException extends Error {
    status: number
    constructor(status: number) {
      super()
      this.status = status
    }
  }
  return {
    SignedDataVerifier: jest.fn().mockImplementation(() => ({ verifyAndDecodeTransaction: mockDecode })),
    Environment: { PRODUCTION: 'PRODUCTION', SANDBOX: 'SANDBOX' },
    VerificationException,
    VerificationStatus: { INVALID_ENVIRONMENT: 4 },
  }
})

jest.mock('../../../../src/server/env', () => ({
  ENV: {
    APPLE: {
      BUNDLE_ID: () => 'com.tabblabs.TCGValor',
      APP_APPLE_ID: () => '6768466615',
      ROOT_CERTS_BASE64: () => '',
    },
  },
}))

jest.mock('../../../../src/server/logger', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}))

import FallbackSignedDataVerifier from '../../../../src/server/clients/Apple/FallbackSignedDataVerifier'
import { VerificationException, VerificationStatus } from '@apple/app-store-server-library'
import Logger from '../../../../src/server/logger'

const mockDecode = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('FallbackSignedDataVerifier', () => {
  const verifier = new FallbackSignedDataVerifier()

  describe('verify', () => {
    it('returns the production result when production succeeds', async () => {
      mockDecode.mockResolvedValue({ data: 'production' })

      const result = await verifier.verify((v) => v.verifyAndDecodeTransaction('token'))

      expect(result).toEqual({ data: 'production' })
      expect(mockDecode).toHaveBeenCalledTimes(1)
    })

    it('falls back to sandbox when production throws INVALID_ENVIRONMENT', async () => {
      mockDecode
        .mockRejectedValueOnce(new VerificationException(VerificationStatus.INVALID_ENVIRONMENT))
        .mockResolvedValueOnce({ data: 'sandbox' })

      const result = await verifier.verify((v) => v.verifyAndDecodeTransaction('token'))

      expect(result).toEqual({ data: 'sandbox' })
      expect(mockDecode).toHaveBeenCalledTimes(2)
    })

    it('re-throws when production throws a non-environment error', async () => {
      const error = new Error('bad cert')
      mockDecode.mockRejectedValue(error)

      await expect(verifier.verify((v) => v.verifyAndDecodeTransaction('token'))).rejects.toThrow('bad cert')
      expect(mockDecode).toHaveBeenCalledTimes(1)
    })

    it('logs and returns null when both production and sandbox throw INVALID_ENVIRONMENT', async () => {
      mockDecode
        .mockRejectedValueOnce(new VerificationException(VerificationStatus.INVALID_ENVIRONMENT))
        .mockRejectedValueOnce(new VerificationException(VerificationStatus.INVALID_ENVIRONMENT))

      const result = await verifier.verify((v) => v.verifyAndDecodeTransaction('token'))

      expect(result).toBeNull()
      expect(Logger.error).toHaveBeenCalledTimes(1)
    })

    it('returns null from callback without retrying sandbox', async () => {
      mockDecode.mockResolvedValue(null)

      const result = await verifier.verify((v) => v.verifyAndDecodeTransaction('token'))

      expect(result).toBeNull()
      expect(mockDecode).toHaveBeenCalledTimes(1)
    })
  })
})
