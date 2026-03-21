import { IUserCardRepo } from '../../../src/server/repository/UserCardRepo'

class UserCardRepo_FAKE implements IUserCardRepo {
  FIND_BY_EXPANSION = jest.fn()
  LIST_ALL = jest.fn()
  LIST_PAGINATED = jest.fn()
  GET_COLLECTION_META = jest.fn()

  listByExpansion = this.FIND_BY_EXPANSION
  listAll = this.LIST_ALL
  listPaginated = this.LIST_PAGINATED
  getCollectionMeta = this.GET_COLLECTION_META
}

export default UserCardRepo_FAKE
