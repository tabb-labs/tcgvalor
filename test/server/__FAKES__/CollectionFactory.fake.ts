import { ICollectionFactory } from '../../../src/server/domain/CollectionFactory'

class CollectionFactory_FAKE implements ICollectionFactory {
  MAKE_PAGINATED = jest.fn()

  makePaginated = this.MAKE_PAGINATED
}

export default CollectionFactory_FAKE
