import { SignedDataVerifier, Environment } from '@apple/app-store-server-library'
import { ENV } from '../../env'

export type AppleTransactionPayload = {
  originalTransactionId: string
  productId: string
  expiresDate: number | undefined
}

export interface IAppleTransactionVerifier {
  verify: (jws: string) => Promise<AppleTransactionPayload | null>
}

class AppleTransactionVerifier implements IAppleTransactionVerifier {
  private readonly verifier: SignedDataVerifier

  constructor() {
    const rootCerts = ENV.APPLE.ROOT_CERTS_BASE64()
      .split(',')
      .filter(Boolean)
      .map((b64) => Buffer.from(b64, 'base64'))

    const env = ENV.ID === 'production' ? Environment.PRODUCTION : Environment.SANDBOX
    const bundleId = ENV.APPLE.BUNDLE_ID()
    const appAppleId = Number(ENV.APPLE.APP_APPLE_ID())

    this.verifier = new SignedDataVerifier(rootCerts, true, env, bundleId, appAppleId)
  }

  verify = async (jws: string): Promise<AppleTransactionPayload | null> => {
    try {
      const decoded = await this.verifier.verifyAndDecodeTransaction(jws)
      if (!decoded.originalTransactionId || !decoded.productId) return null
      return {
        originalTransactionId: decoded.originalTransactionId,
        productId: decoded.productId,
        expiresDate: decoded.expiresDate,
      }
    } catch {
      return null
    }
  }
}

export default AppleTransactionVerifier
