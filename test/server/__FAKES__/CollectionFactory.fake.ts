import { ICollectionFactory } from '../../../src/server/domain/CollectionFactory'

class CollectionFactory_FAKE implements ICollectionFactory {
  MAKE = jest.fn()
  MAKE_PAGINATED = jest.fn()

  make = this.MAKE
  makePaginated = this.MAKE_PAGINATED
}

export default CollectionFactory_FAKE
