import CollectionFactory from '../../../src/server/domain/CollectionFactory'
import UserCardRepo_FAKE from '../__FAKES__/UserCardRepo.fake'
import { CardBlueprintWithUserCards } from '../../../src/server/repository/UserCardRepo'
import { COLLECTION_META_DTO, COLLECTION_QUERY_PARAMS } from '../../core/__MOCKS__/collection.mock'

const makeBlueprint = (
  overrides: Partial<{ name: string; expansionName: string; imagePreviewUrl: string; imageShowUrl: string }> = {}
): CardBlueprintWithUserCards =>
  ({
    name: overrides.name ?? 'Pikachu',
    imagePreviewUrl: overrides.imagePreviewUrl ?? 'preview-url',
    imageShowUrl: overrides.imageShowUrl ?? 'show-url',
    platformLinks: [{ platform: 'CARD_TRADER', externalId: '100' }],
    expansion: {
      name: overrides.expansionName ?? 'Base Set',
      platformLinks: [{ platform: 'CARD_TRADER', externalId: '200' }],
    },
    marketValue: { medianMarketValueCents: 500, listingCount: 3 },
    userCards: [{ id: 1, condition: 'NM' }],
  }) as unknown as CardBlueprintWithUserCards

describe('CollectionFactory', () => {
  let repo: UserCardRepo_FAKE
  let factory: CollectionFactory

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new UserCardRepo_FAKE()
    factory = new CollectionFactory(repo)
  })

  describe('makePaginated', () => {
    it('should call listPaginated and getCollectionMeta with correct args', async () => {
      const userId = 42
      repo.LIST_PAGINATED.mockResolvedValue({ blueprints: [], total: 0 })
      repo.GET_COLLECTION_META.mockResolvedValue(COLLECTION_META_DTO)

      await factory.makePaginated(userId, COLLECTION_QUERY_PARAMS)

      expect(repo.LIST_PAGINATED).toHaveBeenCalledWith(userId, COLLECTION_QUERY_PARAMS)
      expect(repo.GET_COLLECTION_META).toHaveBeenCalledWith(userId)
    })

    it('should map blueprints to card dtos correctly', async () => {
      const blueprint = makeBlueprint({
        name: 'Charizard',
        imagePreviewUrl: 'charizard-preview',
        imageShowUrl: 'charizard-show',
      })
      repo.LIST_PAGINATED.mockResolvedValue({ blueprints: [blueprint], total: 1 })
      repo.GET_COLLECTION_META.mockResolvedValue(COLLECTION_META_DTO)

      const result = await factory.makePaginated(1, COLLECTION_QUERY_PARAMS)

      expect(result.cards).toHaveLength(1)
      expect(result.cards[0].name).toBe('Charizard')
      expect(result.cards[0].imageUrlPreview).toBe('charizard-preview')
      expect(result.cards[0].imageUrlShow).toBe('charizard-show')
      expect(result.cards[0].expansionName).toBe('Base Set')
    })

    it('should compute pagination correctly', async () => {
      const params = { ...COLLECTION_QUERY_PARAMS, page: 2, limit: 20 }
      repo.LIST_PAGINATED.mockResolvedValue({ blueprints: [makeBlueprint()], total: 45 })
      repo.GET_COLLECTION_META.mockResolvedValue(COLLECTION_META_DTO)

      const result = await factory.makePaginated(1, params)

      expect(result.pagination.total).toBe(45)
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.limit).toBe(20)
      expect(result.pagination.totalPages).toBe(3)
    })

    it('should return empty cards array when no blueprints', async () => {
      repo.LIST_PAGINATED.mockResolvedValue({ blueprints: [], total: 0 })
      repo.GET_COLLECTION_META.mockResolvedValue(COLLECTION_META_DTO)

      const result = await factory.makePaginated(1, COLLECTION_QUERY_PARAMS)

      expect(result.cards).toEqual([])
    })
  })
})
