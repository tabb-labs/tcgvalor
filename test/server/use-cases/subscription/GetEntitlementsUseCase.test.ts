import GetEntitlementsUseCase, {
  FREE_CARD_LIMIT,
} from '../../../../src/server/use-cases/subscription/GetEntitlementsUseCase'
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

describe('GetEntitlementsUseCase', () => {
  let subscriptionRepo: SubscriptionRepo_FAKE
  const USER_ID = 42

  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionRepo = new SubscriptionRepo_FAKE()
  })

  it('returns inactive with free card limit when no active subscription exists', async () => {
    subscriptionRepo.FIND_ACTIVE_FOR_USER.mockResolvedValue(null)
    const useCase = new GetEntitlementsUseCase(subscriptionRepo)

    const result = await useCase.call(USER_ID)

    expect(result).toEqual({ isActive: false, cardLimit: FREE_CARD_LIMIT })
  })

  it('returns active with no card limit when an active subscription exists', async () => {
    subscriptionRepo.FIND_ACTIVE_FOR_USER.mockResolvedValue(makeSubscription())
    const useCase = new GetEntitlementsUseCase(subscriptionRepo)

    const result = await useCase.call(USER_ID)

    expect(result).toEqual({ isActive: true, cardLimit: null })
  })

  it('queries the subscription repo with the correct user id', async () => {
    subscriptionRepo.FIND_ACTIVE_FOR_USER.mockResolvedValue(null)
    const useCase = new GetEntitlementsUseCase(subscriptionRepo)

    await useCase.call(USER_ID)

    expect(subscriptionRepo.FIND_ACTIVE_FOR_USER).toHaveBeenCalledWith(USER_ID)
  })
})
