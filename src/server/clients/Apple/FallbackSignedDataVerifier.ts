import {
  SignedDataVerifier,
  Environment,
  VerificationException,
  VerificationStatus,
} from '@apple/app-store-server-library'
import { ENV } from '../../env'
import Logger from '../../logger'

class FallbackSignedDataVerifier {
  private readonly productionVerifier: SignedDataVerifier
  private readonly sandboxVerifier: SignedDataVerifier

  constructor() {
    const rootCerts = ENV.APPLE.ROOT_CERTS_BASE64()
      .split(',')
      .filter(Boolean)
      .map((b64) => Buffer.from(b64, 'base64'))
    const bundleId = ENV.APPLE.BUNDLE_ID()
    const appAppleId = Number(ENV.APPLE.APP_APPLE_ID())

    this.productionVerifier = new SignedDataVerifier(rootCerts, true, Environment.PRODUCTION, bundleId, appAppleId)
    this.sandboxVerifier = new SignedDataVerifier(rootCerts, true, Environment.SANDBOX, bundleId, appAppleId)
  }

  verify = async <T>(decode: (verifier: SignedDataVerifier) => Promise<T | null>): Promise<T | null> => {
    try {
      return await decode(this.productionVerifier)
    } catch (error) {
      if (!(error instanceof VerificationException) || error.status !== VerificationStatus.INVALID_ENVIRONMENT) {
        throw error
      }
    }

    try {
      return await decode(this.sandboxVerifier)
    } catch (error) {
      Logger.error(error)
      return null
    }
  }
}

export default FallbackSignedDataVerifier
