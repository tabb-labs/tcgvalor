import { NotificationTypeV2 } from '@apple/app-store-server-library'
import FallbackSignedDataVerifier from './FallbackSignedDataVerifier'

export type AppleNotificationPayload = {
  notificationType: NotificationTypeV2
  originalTransactionId: string
  expiresDate: number | undefined
}

export interface IAppleNotificationVerifier {
  verify: (signedPayload: string) => Promise<AppleNotificationPayload | null>
}

class AppleNotificationVerifier implements IAppleNotificationVerifier {
  private readonly factory: FallbackSignedDataVerifier

  constructor() {
    this.factory = new FallbackSignedDataVerifier()
  }

  verify = async (signedPayload: string): Promise<AppleNotificationPayload | null> => {
    const result = await this.factory.verify(async (v) => {
      const notification = await v.verifyAndDecodeNotification(signedPayload)
      const { notificationType, data } = notification
      if (!notificationType || !data?.signedTransactionInfo) return null
      const transaction = await v.verifyAndDecodeTransaction(data.signedTransactionInfo)
      if (!transaction.originalTransactionId) return null
      return {
        notificationType: notificationType as NotificationTypeV2,
        originalTransactionId: transaction.originalTransactionId,
        expiresDate: transaction.expiresDate,
      }
    })
    return result
  }
}

export default AppleNotificationVerifier
