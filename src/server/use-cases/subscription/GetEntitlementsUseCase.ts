import { EntitlementDto } from '@core/network-types/subscription'
import { ISubscriptionRepo } from '../../repository/SubscriptionRepo'

const FREE_CARD_LIMIT = 100

class GetEntitlementsUseCase {
  private readonly subscriptionRepo: ISubscriptionRepo

  constructor(subscriptionRepo: ISubscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo
  }

  call = async (userId: number): Promise<EntitlementDto> => {
    const subscription = await this.subscriptionRepo.findActiveForUser(userId)

    if (!subscription) {
      return { isActive: false, cardLimit: FREE_CARD_LIMIT }
    }

    return { isActive: true, cardLimit: null }
  }
}

export { FREE_CARD_LIMIT }
export default GetEntitlementsUseCase
