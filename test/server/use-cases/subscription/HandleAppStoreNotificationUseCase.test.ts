import { NotificationTypeV2 } from '@apple/app-store-server-library'
import HandleAppStoreNotificationUseCase from '../../../../src/server/use-cases/subscription/HandleAppStoreNotificationUseCase'
import {
  IAppleNotificationVerifier,
  AppleNotificationPayload,
} from '../../../../src/server/clients/Apple/AppleNotificationVerifier'
import SubscriptionRepo_FAKE from '../../__FAKES__/SubscriptionRepo.fake'

const makeSubscription = (overrides = {}) => ({
  id: 1,
  userId: 42,
  tier: 'PRO' as const,
  status: 'ACTIVE' as const,
  source: 'IOS_APPSTORE' as const,
  expiresAt: null,
  appleOriginalTransactionId: 'txn_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeVerifier = (payload: AppleNotificationPayload | null): IAppleNotificationVerifier => ({
  verify: jest.fn().mockResolvedValue(payload),
})

const makePayload = (notificationType: NotificationTypeV2, overrides = {}): AppleNotificationPayload => ({
  notificationType,
  originalTransactionId: 'txn_123',
  expiresDate: 1748736000000,
  ...overrides,
})

describe('HandleAppStoreNotificationUseCase', () => {
  let subscriptionRepo: SubscriptionRepo_FAKE

  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionRepo = new SubscriptionRepo_FAKE()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(makeSubscription())
  })

  it('does nothing when the verifier returns null', async () => {
    const useCase = new HandleAppStoreNotificationUseCase(makeVerifier(null), subscriptionRepo)

    await useCase.call('signed-payload')

    expect(subscriptionRepo.ACTIVATE_EXISTING).not.toHaveBeenCalled()
    expect(subscriptionRepo.DEACTIVATE).not.toHaveBeenCalled()
  })

  it('does nothing when no subscription exists for the transaction', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.DID_RENEW)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.ACTIVATE_EXISTING).not.toHaveBeenCalled()
    expect(subscriptionRepo.DEACTIVATE).not.toHaveBeenCalled()
  })

  it('activates the subscription with new expiresAt on DID_RENEW', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const payload = makePayload(NotificationTypeV2.DID_RENEW, { expiresDate: 1748736000000 })
    const useCase = new HandleAppStoreNotificationUseCase(makeVerifier(payload), subscriptionRepo)

    await useCase.call('signed-payload')

    expect(subscriptionRepo.ACTIVATE_EXISTING).toHaveBeenCalledWith(subscription.id, new Date(1748736000000))
    expect(subscriptionRepo.DEACTIVATE).not.toHaveBeenCalled()
  })

  it('activates with null expiresAt when expiresDate is absent on DID_RENEW', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const payload = makePayload(NotificationTypeV2.DID_RENEW, { expiresDate: undefined })
    const useCase = new HandleAppStoreNotificationUseCase(makeVerifier(payload), subscriptionRepo)

    await useCase.call('signed-payload')

    expect(subscriptionRepo.ACTIVATE_EXISTING).toHaveBeenCalledWith(subscription.id, null)
  })

  it('deactivates as EXPIRED on EXPIRED', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.EXPIRED)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.DEACTIVATE).toHaveBeenCalledWith(subscription.id, 'EXPIRED')
    expect(subscriptionRepo.ACTIVATE_EXISTING).not.toHaveBeenCalled()
  })

  it('deactivates as EXPIRED on GRACE_PERIOD_EXPIRED', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.GRACE_PERIOD_EXPIRED)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.DEACTIVATE).toHaveBeenCalledWith(subscription.id, 'EXPIRED')
  })

  it('deactivates as CANCELLED on REFUND', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.REFUND)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.DEACTIVATE).toHaveBeenCalledWith(subscription.id, 'CANCELLED')
  })

  it('deactivates as CANCELLED on REVOKE', async () => {
    const subscription = makeSubscription()
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(subscription)
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.REVOKE)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.DEACTIVATE).toHaveBeenCalledWith(subscription.id, 'CANCELLED')
  })

  it('does nothing for unhandled notification types', async () => {
    const useCase = new HandleAppStoreNotificationUseCase(
      makeVerifier(makePayload(NotificationTypeV2.DID_CHANGE_RENEWAL_STATUS)),
      subscriptionRepo
    )

    await useCase.call('signed-payload')

    expect(subscriptionRepo.ACTIVATE_EXISTING).not.toHaveBeenCalled()
    expect(subscriptionRepo.DEACTIVATE).not.toHaveBeenCalled()
  })
})
