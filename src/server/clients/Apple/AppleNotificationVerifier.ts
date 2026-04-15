import { SignedDataVerifier, Environment, NotificationTypeV2 } from '@apple/app-store-server-library'
import { ENV } from '../../env'
import Logger from '../../logger'

export type AppleNotificationPayload = {
  notificationType: NotificationTypeV2
  originalTransactionId: string
  expiresDate: number | undefined
}

export interface IAppleNotificationVerifier {
  verify: (signedPayload: string) => Promise<AppleNotificationPayload | null>
}

class AppleNotificationVerifier implements IAppleNotificationVerifier {
  private readonly verifier: SignedDataVerifier

  constructor() {
    const rootCerts = ENV.APPLE.ROOT_CERTS_BASE64()
      .split(',')
      .filter(Boolean)
      .map((b64) => Buffer.from(b64, 'base64'))

    const env = ENV.ID === 'production' ? Environment.PRODUCTION : Environment.SANDBOX
    this.verifier = new SignedDataVerifier(
      rootCerts,
      true,
      env,
      ENV.APPLE.BUNDLE_ID(),
      Number(ENV.APPLE.APP_APPLE_ID())
    )
  }

  verify = async (signedPayload: string): Promise<AppleNotificationPayload | null> => {
    try {
      const notification = await this.verifier.verifyAndDecodeNotification(signedPayload)
      const { notificationType, data } = notification

      if (!notificationType || !data?.signedTransactionInfo) return null

      const transaction = await this.verifier.verifyAndDecodeTransaction(data.signedTransactionInfo)
      if (!transaction.originalTransactionId) return null

      return {
        notificationType: notificationType as NotificationTypeV2,
        originalTransactionId: transaction.originalTransactionId,
        expiresDate: transaction.expiresDate,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      Logger.error(`AppleNotificationVerifier: ${message}`)
      return null
    }
  }
}

export default AppleNotificationVerifier
