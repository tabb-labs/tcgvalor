import { ISubscriptionRepo } from '../../../src/server/repository/SubscriptionRepo'

class SubscriptionRepo_FAKE implements ISubscriptionRepo {
  FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID = jest.fn()
  ACTIVATE_EXISTING = jest.fn()
  CREATE_FROM_APP_STORE = jest.fn()
  FIND_ACTIVE_FOR_USER = jest.fn()

  findByAppleOriginalTransactionId = this.FIND_BY_APPLE_ORIGINAL_TRANSACTION_ID
  activateExisting = this.ACTIVATE_EXISTING
  createFromAppStore = this.CREATE_FROM_APP_STORE
  findActiveForUser = this.FIND_ACTIVE_FOR_USER
}

export default SubscriptionRepo_FAKE
