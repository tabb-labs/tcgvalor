import VerifyAppStorePurchaseUseCase, {
  decodeAppleTransactionPayload,
} from '../../../../src/server/use-cases/subscription/VerifyAppStorePurchaseUseCase'
import SubscriptionRepo_FAKE from '../../__FAKES__/SubscriptionRepo.fake'

const makeSignedTransaction = (payload: object): string => {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `header.${payloadB64}.signature`
}

const VALID_PAYLOAD = {
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
  expiresAt: new Date(VALID_PAYLOAD.expiresDate),
  appleOriginalTransactionId: VALID_PAYLOAD.originalTransactionId,
  stripeSubscriptionId: null,
  stripeCustomerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('decodeAppleTransactionPayload', () => {
  it('decodes a valid JWS payload', () => {
    const result = decodeAppleTransactionPayload(makeSignedTransaction(VALID_PAYLOAD))

    expect(result).toEqual({
      originalTransactionId: VALID_PAYLOAD.originalTransactionId,
      productId: VALID_PAYLOAD.productId,
      expiresDate: VALID_PAYLOAD.expiresDate,
    })
  })

  it('returns null when JWS does not have 3 parts', () => {
    expect(decodeAppleTransactionPayload('only.two')).toBeNull()
    expect(decodeAppleTransactionPayload('one')).toBeNull()
  })

  it('returns null when payload is not valid JSON', () => {
    expect(decodeAppleTransactionPayload('header.notbase64json!.sig')).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    const result = decodeAppleTransactionPayload(makeSignedTransaction({ someOtherField: 'value' }))
    expect(result).toBeNull()
  })

  it('returns null when originalTransactionId is missing', () => {
    const result = decodeAppleTransactionPayload(makeSignedTransaction({ productId: 'com.tcgvalor.pro.monthly' }))
    expect(result).toBeNull()
  })

  it('decodes payload without expiresDate when not present', () => {
    const payload = { originalTransactionId: 'txn_123', productId: 'com.tcgvalor.pro.monthly' }
    const result = decodeAppleTransactionPayload(makeSignedTransaction(payload))

    expect(result).toEqual({ originalTransactionId: 'txn_123', productId: 'com.tcgvalor.pro.monthly' })
  })
})

describe('VerifyAppStorePurchaseUseCase', () => {
  let useCase: VerifyAppStorePurchaseUseCase
  let subscriptionRepo: SubscriptionRepo_FAKE

  const USER_ID = 42

  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionRepo = new SubscriptionRepo_FAKE()
    useCase = new VerifyAppStorePurchaseUseCase(subscriptionRepo)
  })

  it('returns failure when the signed transaction is invalid', async () => {
    const result = await useCase.call(USER_ID, 'not.a.valid.jws.token')

    expect(result.isFailure()).toBe(true)
    expect(result.error).toBe('Invalid transaction format')
  })

  it('returns failure when the product id is not recognised', async () => {
    const transaction = makeSignedTransaction({
      ...VALID_PAYLOAD,
      productId: 'com.tcgvalor.unknown.product',
    })

    const result = await useCase.call(USER_ID, transaction)

    expect(result.isFailure()).toBe(true)
    expect(result.error).toBe('Unknown product: com.tcgvalor.unknown.product')
  })

  it('creates a new subscription when none exists for the transaction', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription())

    const result = await useCase.call(USER_ID, makeSignedTransaction(VALID_PAYLOAD))

    expect(subscriptionRepo.CREATE_FROM_APP_STORE).toHaveBeenCalledWith({
      userId: USER_ID,
      tier: 'PRO',
      expiresAt: new Date(VALID_PAYLOAD.expiresDate),
      appleOriginalTransactionId: VALID_PAYLOAD.originalTransactionId,
    })
    expect(result.isSuccess()).toBe(true)
  })

  it('activates the existing subscription on renewal', async () => {
    const existing = makeSubscription({ status: 'EXPIRED' })
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(existing)
    subscriptionRepo.ACTIVATE_EXISTING.mockResolvedValue(makeSubscription())

    await useCase.call(USER_ID, makeSignedTransaction(VALID_PAYLOAD))

    expect(subscriptionRepo.ACTIVATE_EXISTING).toHaveBeenCalledWith(existing.id, new Date(VALID_PAYLOAD.expiresDate))
    expect(subscriptionRepo.CREATE_FROM_APP_STORE).not.toHaveBeenCalled()
  })

  it('sets expiresAt to null when expiresDate is absent', async () => {
    const payload = { originalTransactionId: 'txn_123', productId: 'com.tcgvalor.pro.monthly' }
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription({ expiresAt: null }))

    await useCase.call(USER_ID, makeSignedTransaction(payload))

    expect(subscriptionRepo.CREATE_FROM_APP_STORE).toHaveBeenCalledWith(expect.objectContaining({ expiresAt: null }))
  })

  it('returns the subscription dto on success', async () => {
    subscriptionRepo.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID.mockResolvedValue(null)
    subscriptionRepo.CREATE_FROM_APP_STORE.mockResolvedValue(makeSubscription())

    const result = await useCase.call(USER_ID, makeSignedTransaction(VALID_PAYLOAD))

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      tier: 'PRO',
      status: 'ACTIVE',
      expiresAt: new Date(VALID_PAYLOAD.expiresDate).toISOString(),
    })
  })
})
