import { makePrismaClientMock } from '../../__MOCKS__/prismaClient.mock'
import GetShareCollectionUseCase from '../../../../src/server/use-cases/collection/GetShareCollectionUseCase'
import CollectionFactory_FAKE from '../../__FAKES__/CollectionFactory.fake'
import { makeProfileEntityMock } from '../../__MOCKS__/profileEntity.mock'
import { COLLECTION_META_DTO, COLLECTION_QUERY_PARAMS, PAGINATION_DTO } from '../../../core/__MOCKS__/collection.mock'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'

const mockPrisma = makePrismaClientMock({ user: { findUnique: jest.fn() } })

describe('Get Share Collection UseCase', () => {
  let getShareCollectionUseCase: GetShareCollectionUseCase
  let collectionFactory_FAKE: CollectionFactory_FAKE

  const USER_ID = 12345

  beforeEach(() => {
    jest.clearAllMocks()
    collectionFactory_FAKE = new CollectionFactory_FAKE()
    getShareCollectionUseCase = new GetShareCollectionUseCase(mockPrisma, collectionFactory_FAKE)

    collectionFactory_FAKE.MAKE_PAGINATED.mockResolvedValue({
      cards: [CARD_DTO],
      meta: COLLECTION_META_DTO,
      pagination: PAGINATION_DTO,
    })
    mockPrisma.user.findUnique.mockResolvedValue(makeProfileEntityMock({}))
  })

  it('should return collection domain values', async () => {
    const result = await getShareCollectionUseCase.call(USER_ID, COLLECTION_QUERY_PARAMS)

    expect(collectionFactory_FAKE.MAKE_PAGINATED).toHaveBeenCalledWith(USER_ID, COLLECTION_QUERY_PARAMS)
    expect(result.isSuccess()).toBe(true)
    expect(result.value.cards).toEqual([CARD_DTO])
    expect(result.value.meta).toEqual(COLLECTION_META_DTO)
    expect(result.value.pagination).toEqual(PAGINATION_DTO)
  })

  it('should return user nickname as display name', async () => {
    const NICKNAME = 'cooltrader'
    mockPrisma.user.findUnique.mockResolvedValue(makeProfileEntityMock({ nickname: NICKNAME }))

    const result = await getShareCollectionUseCase.call(USER_ID, COLLECTION_QUERY_PARAMS)

    expect(result.isSuccess()).toBe(true)
    expect(result.value.name).toEqual(NICKNAME)
  })

  it('should fall back to Trader when nickname is empty', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeProfileEntityMock({ nickname: '' }))

    const result = await getShareCollectionUseCase.call(USER_ID, COLLECTION_QUERY_PARAMS)

    expect(result.isSuccess()).toBe(true)
    expect(result.value.name).toEqual('Trader')
  })

  it('should return failure when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const result = await getShareCollectionUseCase.call(USER_ID, COLLECTION_QUERY_PARAMS)

    expect(result.isFailure()).toBe(true)
    expect(collectionFactory_FAKE.MAKE_PAGINATED).not.toHaveBeenCalled()
  })
})
