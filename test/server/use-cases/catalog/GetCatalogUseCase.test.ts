import { CardDto } from '@core/network-types/card'
import GetCatalogUseCase from '../../../../src/server/use-cases/catalog/GetCatalogUseCase'
import PokemonExpansionFactory_FAKE from '../../__FAKES__/PokemonExpansionFactory.fake'
import { makePokemonExpansionMock } from '../../__MOCKS__/pokemonExpansion.mock'
import UserCardRepo_FAKE from '../../__FAKES__/UserCardRepo.fake'
import PokemonCardFactory_FAKE from '../../__FAKES__/PokemonCardFactory.fake'
import { makePokemonCardMock } from '../../__MOCKS__/pokemonCard.mock'
import { makeUserCardWithBlueprintMock } from '../../__MOCKS__/userCardWithBlueprint.mock'

describe('Get Catalog UseCase', () => {
  let getCatalogUseCase: GetCatalogUseCase
  let userCardRepo_FAKE: UserCardRepo_FAKE
  let pokemonExpansionFactory_FAKE: PokemonExpansionFactory_FAKE
  let pokemonCardFactory_FAKE: PokemonCardFactory_FAKE

  const BASE_SET_EXPANSION_ID = 1472
  const USER_ID = 10

  beforeEach(() => {
    userCardRepo_FAKE = new UserCardRepo_FAKE()
    pokemonExpansionFactory_FAKE = new PokemonExpansionFactory_FAKE()
    pokemonCardFactory_FAKE = new PokemonCardFactory_FAKE()
    getCatalogUseCase = new GetCatalogUseCase(userCardRepo_FAKE, pokemonExpansionFactory_FAKE, pokemonCardFactory_FAKE)

    pokemonCardFactory_FAKE.MAKE_LIST.mockResolvedValue([])
    userCardRepo_FAKE.FIND_BY_EXPANSION.mockResolvedValue([])
    pokemonExpansionFactory_FAKE.MAKE.mockResolvedValue(makePokemonExpansionMock())
  })

  describe('Details', () => {
    it('should return null when expansion does not exist in postgres', async () => {
      pokemonExpansionFactory_FAKE.MAKE.mockResolvedValue(null)
      const result = await getCatalogUseCase.call(1, USER_ID)
      expect(result.value.details).toBeNull()
    })
    it('should return prices as 0 when cards have no values', async () => {
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, USER_ID)
      expect(result.value.details?.priceDetails).toEqual({
        fiftyToOneHundred: 0,
        oneHundredTwoHundred: 0,
        twoHundredPlus: 0,
        zeroToFifty: 0,
      })
    })
    it('should return price count for median price details', async () => {
      pokemonCardFactory_FAKE.MAKE_LIST.mockResolvedValue([
        makePokemonCardMock({ blueprintId: 1, medianMarketValueCents: 1 }),
        makePokemonCardMock({ blueprintId: 2, medianMarketValueCents: 5 }),
        makePokemonCardMock({ blueprintId: 3, medianMarketValueCents: 49_99 }),
        makePokemonCardMock({ blueprintId: 4, medianMarketValueCents: 50_00 }),
        makePokemonCardMock({ blueprintId: 5, medianMarketValueCents: 75_88 }),
        makePokemonCardMock({ blueprintId: 6, medianMarketValueCents: 100_00 }),
        makePokemonCardMock({ blueprintId: 7, medianMarketValueCents: 129_83 }),
        makePokemonCardMock({ blueprintId: 8, medianMarketValueCents: 188_22 }),
        makePokemonCardMock({ blueprintId: 9, medianMarketValueCents: 199_99 }),
        makePokemonCardMock({ blueprintId: 10, medianMarketValueCents: 200_00 }),
        makePokemonCardMock({ blueprintId: 11, medianMarketValueCents: 10_032_23 }),
      ])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, USER_ID)
      expect(result.value.details?.priceDetails.zeroToFifty).toEqual(3)
      expect(result.value.details?.priceDetails.fiftyToOneHundred).toEqual(2)
      expect(result.value.details?.priceDetails.oneHundredTwoHundred).toEqual(4)
      expect(result.value.details?.priceDetails.twoHundredPlus).toEqual(2)
    })
  })

  describe('Cards', () => {
    it('should return an empty array when no cards exist', async () => {
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID)
      expect(pokemonCardFactory_FAKE.MAKE_LIST).toHaveBeenCalledWith(BASE_SET_EXPANSION_ID)
      expect(result.value.cards).toEqual([])
    })
    it('should return cards with their embedded values', async () => {
      const card = makePokemonCardMock({
        blueprintId: 1,
        expansionId: 2,
        name: 'name',
        imageUrlPreview: 'preview',
        imageUrlShow: 'show',
        medianMarketValueCents: 1534,
        listingCount: 20,
      })
      pokemonCardFactory_FAKE.MAKE_LIST.mockResolvedValue([card])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID)
      const expectedResult: CardDto = {
        blueprintId: 1,
        expansionId: 2,
        name: 'name',
        imageUrlPreview: 'preview',
        imageUrlShow: 'show',
        owned: 0,
        medianMarketValueCents: 1534,
        listingCount: 20,
      }
      expect(result.value.cards[0]).toEqual(expectedResult)
    })
    it('should return cards with no prices when prices are not available', async () => {
      pokemonCardFactory_FAKE.MAKE_LIST.mockResolvedValue([makePokemonCardMock({ blueprintId: 1, expansionId: 2 })])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID)
      expect(result.value.cards[0].medianMarketValueCents).toEqual(-1)
    })
    it('should return cards with owned values when user is logged in', async () => {
      pokemonCardFactory_FAKE.MAKE_LIST.mockResolvedValue([
        makePokemonCardMock({ blueprintId: 1 }),
        makePokemonCardMock({ blueprintId: 2 }),
        makePokemonCardMock({ blueprintId: 3 }),
        makePokemonCardMock({ blueprintId: 4 }),
        makePokemonCardMock({ blueprintId: 5 }),
      ])
      userCardRepo_FAKE.FIND_BY_EXPANSION.mockResolvedValue([
        makeUserCardWithBlueprintMock({ blueprintExternalId: 2, cardBlueprintId: 2 }),
        makeUserCardWithBlueprintMock({ blueprintExternalId: 2, cardBlueprintId: 2 }),
        makeUserCardWithBlueprintMock({ blueprintExternalId: 2, cardBlueprintId: 2 }),
        makeUserCardWithBlueprintMock({ blueprintExternalId: 3, cardBlueprintId: 3 }),
        makeUserCardWithBlueprintMock({ blueprintExternalId: 3, cardBlueprintId: 3 }),
        makeUserCardWithBlueprintMock({ blueprintExternalId: 5, cardBlueprintId: 5 }),
      ])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, USER_ID)
      expect(userCardRepo_FAKE.FIND_BY_EXPANSION).toHaveBeenCalledWith(USER_ID, BASE_SET_EXPANSION_ID)
      expect(result.value.cards.length).toEqual(5)
      expect(result.value.cards[0].owned).toEqual(0)
      expect(result.value.cards[1].owned).toEqual(3)
      expect(result.value.cards[2].owned).toEqual(2)
      expect(result.value.cards[3].owned).toEqual(0)
      expect(result.value.cards[4].owned).toEqual(1)
    })
  })
})
