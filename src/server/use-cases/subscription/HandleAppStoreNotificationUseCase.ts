import { NotificationTypeV2 } from '@apple/app-store-server-library'
import { IAppleNotificationVerifier } from '../../clients/Apple/AppleNotificationVerifier'
import { ISubscriptionRepo } from '../../repository/SubscriptionRepo'

class HandleAppStoreNotificationUseCase {
  private readonly notificationVerifier: IAppleNotificationVerifier
  private readonly subscriptionRepo: ISubscriptionRepo

  constructor(notificationVerifier: IAppleNotificationVerifier, subscriptionRepo: ISubscriptionRepo) {
    this.notificationVerifier = notificationVerifier
    this.subscriptionRepo = subscriptionRepo
  }

  call = async (signedPayload: string): Promise<void> => {
    const payload = await this.notificationVerifier.verify(signedPayload)
    if (!payload) return

    const subscription = await this.subscriptionRepo.findByAppleOriginalTransactionId(payload.originalTransactionId)
    if (!subscription) return

    switch (payload.notificationType) {
      case NotificationTypeV2.DID_RENEW:
        await this.subscriptionRepo.activateExisting(
          subscription.id,
          payload.expiresDate ? new Date(payload.expiresDate) : null
        )
        break
      case NotificationTypeV2.EXPIRED:
      case NotificationTypeV2.GRACE_PERIOD_EXPIRED:
        await this.subscriptionRepo.deactivate(subscription.id, 'EXPIRED')
        break
      case NotificationTypeV2.REFUND:
      case NotificationTypeV2.REVOKE:
        await this.subscriptionRepo.deactivate(subscription.id, 'CANCELLED')
        break
    }
  }
}

export default HandleAppStoreNotificationUseCase
