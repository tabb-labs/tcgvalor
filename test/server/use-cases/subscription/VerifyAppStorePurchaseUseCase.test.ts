import VerifyAppStorePurchaseUseCase from '../../../../src/server/use-cases/subscription/VerifyAppStorePurchaseUseCase'
import {
  IAppleTransactionVerifier,
  AppleTransactionPayload,
} from '../../../../src/server/clients/Apple/AppleTransactionVerifier'
import SubscriptionRepo_FAKE from '../../__FAKES__/SubscriptionRepo.fake'

const VALID_PAYLOAD: AppleTransactionPayload = {
  originalTransactionId: 'txn_original_123',
  productId: 'com.tcgvalor.pro.monthly',
  expiresDate: 1748736000000,
}

const makeSubscription = (overrides = {}) => ({
  id: 1,
  userId: 42,
  tier: 'PRO' as const,
  status: 'ACTIVE' as const,
  source: 'IOS_APPSTORE' as const,
  expiresAt: new Date(VALID_PAYLOAD.expiresDate!),
  appleOriginalTransactionId: VALID_PAYLOAD.originalTransactionId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeVerifier = (payload: AppleTransactionPayload | null): IAppleTransactionVerifier => ({
  verify: jest.fn().mockResolvedValue(payload),
})

describe('VerifyAppStorePurchaseUseCase', () => {
  let subscriptionRepo: SubscriptionRepo_FAKE

  const USER_ID = 42

  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionRepo = new SubscriptionRepo_FAKE()
  })

  it('returns failure when the verifier rejects the transaction', async () => {
    const useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo, makeVerifier(null))

    const result = await useCase.call(USER_ID, 'any-jws-string')

    expect(result.isFailure()).toBe(true)
    expect(result.error).toBe('Invalid transaction')
  })

  it('returns failure when the product id is not recognised', async () => {
    const useCase = new VerifyAppStorePurchaseUseCase(
      subscriptionRepo,
      makeVerifier({ ...VALID_PAYLOAD, productId: 'com.tcgvalor.unknown.product' })
    )

    const result = await useCase.call(USER_ID, 'any-jws-string')

    expect(result.isFailure()).toBe(true)
    expect(result.error).toBe('Unknown product: com.tcgvalor.unknown.product')
  })

  it('returns failure when the transaction belongs to a different user', async () => {
    const OTHER_USER_ID = 99
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(
      makeSubscription({ userId: OTHER_USER_ID })
    )
    const useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo, makeVerifier(VALID_PAYLOAD))

    const result = await useCase.call(USER_ID, 'any-jws-string')

    expect(result.isFailure()).toBe(true)
    expect(result.error).toBe('Transaction does not belong to this user')
    expect(subscriptionRepo.ACTIVATE_EXISTING).not.toHaveBeenCalled()
  })

  it('creates a new subscription when none exists for the transaction', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription())
    const useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo, makeVerifier(VALID_PAYLOAD))

    const result = await useCase.call(USER_ID, 'any-jws-string')

    expect(subscriptionRepo.CREATE_FROM_APP_STORE).toHaveBeenCalledWith({
      userId: USER_ID,
      tier: 'PRO',
      expiresAt: new Date(VALID_PAYLOAD.expiresDate!),
      appleOriginalTransactionId: VALID_PAYLOAD.originalTransactionId,
    })
    expect(result.isSuccess()).toBe(true)
  })

  it('activates the existing subscription on renewal', async () => {
    const existing = makeSubscription({ status: 'EXPIRED' })
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(existing)
    subscriptionRepo.ACTIVATE_EXISTING.mockResolvedValue(makeSubscription())
    const useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo, makeVerifier(VALID_PAYLOAD))

    await useCase.call(USER_ID, 'any-jws-string')

    expect(subscriptionRepo.ACTIVATE_EXISTING).toHaveBeenCalledWith(existing.id, new Date(VALID_PAYLOAD.expiresDate!))
    expect(subscriptionRepo.CREATE_FROM_APP_STORE).not.toHaveBeenCalled()
  })

  it('sets expiresAt to null when expiresDate is absent', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription({ expiresAt: null }))
    const useCase = new VerifyAppStorePurchaseUseCase(
      subscriptionRepo,
      makeVerifier({ ...VALID_PAYLOAD, expiresDate: undefined })
    )

    await useCase.call(USER_ID, 'any-jws-string')

    expect(subscriptionRepo.CREATE_FROM_APP_STORE).toHaveBeenCalledWith(expect.objectContaining({ expiresAt: null }))
  })

  it('returns the subscription dto on success', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription())
    const useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo, makeVerifier(VALID_PAYLOAD))

    const result = await useCase.call(USER_ID, 'any-jws-string')

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      tier: 'PRO',
      status: 'ACTIVE',
      expiresAt: new Date(VALID_PAYLOAD.expiresDate!).toISOString(),
    })
  })
})
