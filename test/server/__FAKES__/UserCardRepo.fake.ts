import { IUserCardRepo } from '../../../src/server/repository/UserCardRepo'

class UserCardRepo_FAKE implements IUserCardRepo {
  FIND_BY_EXPANSION = jest.fn()
  LIST_ALL = jest.fn()

  listByExpansion = this.FIND_BY_EXPANSION
  listAll = this.LIST_ALL
}

export default UserCardRepo_FAKE
