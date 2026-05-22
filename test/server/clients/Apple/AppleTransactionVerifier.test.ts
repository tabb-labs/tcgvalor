jest.mock('@apple/app-store-server-library', () => {
  class VerificationException extends Error {
    status: number
    constructor(status: number) {
      super()
      this.status = status
    }
  }
  return {
    SignedDataVerifier: jest.fn().mockImplementation(() => ({ verifyAndDecodeTransaction: mockVerifyAndDecode })),
    Environment: { PRODUCTION: 'PRODUCTION', SANDBOX: 'SANDBOX' },
    VerificationException,
    VerificationStatus: { INVALID_ENVIRONMENT: 4 },
  }
})

jest.mock('../../../../src/server/env', () => ({
  ENV: {
    ID: 'development',
    APPLE: {
      BUNDLE_ID: () => 'com.tcgvalor',
      APP_APPLE_ID: () => '123456789',
      ROOT_CERTS_BASE64: () => '',
    },
  },
}))

import AppleTransactionVerifier from '../../../../src/server/clients/Apple/AppleTransactionVerifier'
import { VerificationException, VerificationStatus } from '@apple/app-store-server-library'

const mockVerifyAndDecode = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('AppleTransactionVerifier', () => {
  const verifier = new AppleTransactionVerifier()

  describe('verify', () => {
    it('returns the mapped payload on a valid transaction', async () => {
      mockVerifyAndDecode.mockResolvedValue({
        originalTransactionId: 'txn_123',
        productId: 'com.tcgvalor.pro.monthly',
        expiresDate: 1748736000000,
      })

      const result = await verifier.verify('any.jws.token')

      expect(result).toEqual({
        originalTransactionId: 'txn_123',
        productId: 'com.tcgvalor.pro.monthly',
        expiresDate: 1748736000000,
      })
    })

    it('returns the payload when expiresDate is absent', async () => {
      mockVerifyAndDecode.mockResolvedValue({
        originalTransactionId: 'txn_123',
        productId: 'com.tcgvalor.pro.monthly',
      })

      const result = await verifier.verify('any.jws.token')

      expect(result).toEqual({
        originalTransactionId: 'txn_123',
        productId: 'com.tcgvalor.pro.monthly',
        expiresDate: undefined,
      })
    })

    it('falls back to sandbox and returns the payload when production throws INVALID_ENVIRONMENT', async () => {
      mockVerifyAndDecode
        .mockRejectedValueOnce(new VerificationException(VerificationStatus.INVALID_ENVIRONMENT))
        .mockResolvedValueOnce({
          originalTransactionId: 'txn_sandbox',
          productId: 'com.tcgvalor.pro.monthly',
          expiresDate: undefined,
        })

      const result = await verifier.verify('sandbox.jws.token')

      expect(result).toEqual({
        originalTransactionId: 'txn_sandbox',
        productId: 'com.tcgvalor.pro.monthly',
        expiresDate: undefined,
      })
    })

    it('re-throws when the library throws a non-environment error (invalid signature, bad cert, etc.)', async () => {
      mockVerifyAndDecode.mockRejectedValue(new Error('Verification failed'))

      await expect(verifier.verify('forged.jws.token')).rejects.toThrow('Verification failed')
    })

    it('returns null when originalTransactionId is missing', async () => {
      mockVerifyAndDecode.mockResolvedValue({ productId: 'com.tcgvalor.pro.monthly' })

      const result = await verifier.verify('any.jws.token')

      expect(result).toBeNull()
    })

    it('returns null when productId is missing', async () => {
      mockVerifyAndDecode.mockResolvedValue({ originalTransactionId: 'txn_123' })

      const result = await verifier.verify('any.jws.token')

      expect(result).toBeNull()
    })
  })
})
