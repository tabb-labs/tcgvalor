import GetCollectionUseCase from '../../../../src/server/use-cases/collection/GetCollectionUseCase'
import CollectionFactory_FAKE from '../../__FAKES__/CollectionFactory.fake'
import { COLLECTION_META_DTO, COLLECTION_QUERY_PARAMS, PAGINATION_DTO } from '../../../core/__MOCKS__/collection.mock'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'

describe('Get Collection UseCase', () => {
  let getCollectionUseCase: GetCollectionUseCase
  let collectionFactory_FAKE: CollectionFactory_FAKE

  const USER_ID = 12345

  beforeEach(() => {
    jest.clearAllMocks()
    collectionFactory_FAKE = new CollectionFactory_FAKE()
    getCollectionUseCase = new GetCollectionUseCase(collectionFactory_FAKE)
  })

  it('should return paginated collection', async () => {
    const expectedCards = [CARD_DTO]
    collectionFactory_FAKE.MAKE_PAGINATED.mockResolvedValue({
      cards: expectedCards,
      meta: COLLECTION_META_DTO,
      pagination: PAGINATION_DTO,
    })

    const result = await getCollectionUseCase.call(USER_ID, COLLECTION_QUERY_PARAMS)

    expect(collectionFactory_FAKE.MAKE_PAGINATED).toHaveBeenCalledWith(USER_ID, COLLECTION_QUERY_PARAMS)
    expect(result.value.cards).toEqual(expectedCards)
    expect(result.value.meta).toEqual(COLLECTION_META_DTO)
    expect(result.value.pagination).toEqual(PAGINATION_DTO)
  })
})
