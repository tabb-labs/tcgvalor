import { CardDto } from '@core/network-types/card'
import GetCatalogUseCase from '../../../../src/server/use-cases/catalog/GetCatalogUseCase'
import { BlueprintValue } from '../../../../src/server/types/BlueprintValue'
import PokemonExpansionFactory_FAKE from '../../__FAKES__/PokemonExpansionFactory.fake'
import { makePokemonExpansionMock } from '../../__MOCKS__/pokemonExpansion.mock'
import UserCardRepo_FAKE from '../../__FAKES__/UserCardRepo.fake'
import PokemonCardFactory_FAKE from '../../__FAKES__/PokemonCardFactory.fake'
import { BLUEPRINT_VALUE_MOCK } from '../../__MOCKS__/blueprintValue.mock'
import { makePokemonCardMock } from '../../__MOCKS__/pokemonCard.mock'
import { makeUserCardWithBlueprintMock } from '../../__MOCKS__/userCardWithBlueprint.mock'

describe('Get Catalog UseCase', () => {
  let getCatalogUseCase: GetCatalogUseCase
  let userCardRepo_FAKE: UserCardRepo_FAKE
  let pokemonExpansionFactory_FAKE: PokemonExpansionFactory_FAKE
  let pokemonCardFactory_FAKE: PokemonCardFactory_FAKE

  const BASE_SET_EXPANSION_ID = 1472
  const USER_ID = 10

  const BLUEPRINT_VALUES = new Map<string, BlueprintValue>([['1', { medianCents: 1534, listingCount: 20 }]])

  beforeEach(() => {
    userCardRepo_FAKE = new UserCardRepo_FAKE()
    pokemonExpansionFactory_FAKE = new PokemonExpansionFactory_FAKE()
    pokemonCardFactory_FAKE = new PokemonCardFactory_FAKE()
    getCatalogUseCase = new GetCatalogUseCase(userCardRepo_FAKE, pokemonExpansionFactory_FAKE, pokemonCardFactory_FAKE)

    pokemonCardFactory_FAKE.FROM_POSTGRES.mockResolvedValue([])
    pokemonCardFactory_FAKE.FROM_CARD_TRADER.mockResolvedValue([])
    userCardRepo_FAKE.FIND_BY_EXPANSION.mockResolvedValue([])
    pokemonExpansionFactory_FAKE.FROM_POSTGRES.mockResolvedValue(makePokemonExpansionMock())
  })

  describe('Details', () => {
    it('should return null when expansion id does not exist in expansion store', async () => {
      pokemonExpansionFactory_FAKE.FROM_POSTGRES.mockResolvedValue(null)
      const result = await getCatalogUseCase.call(1, new Map<string, BlueprintValue>(), USER_ID)
      expect(result.value.details).toBeNull()
    })
    it('should return prices as 0 when store has no values', async () => {
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, new Map<string, BlueprintValue>(), USER_ID)
      expect(result.value.details?.priceDetails).toEqual({
        fiftyToOneHundred: 0,
        oneHundredTwoHundred: 0,
        twoHundredPlus: 0,
        zeroToFifty: 0,
      })
    })
    it('should return price count for median price details', async () => {
      pokemonCardFactory_FAKE.FROM_CARD_TRADER.mockResolvedValue([
        makePokemonCardMock({ blueprintId: 1 }),
        makePokemonCardMock({ blueprintId: 2 }),
        makePokemonCardMock({ blueprintId: 3 }),
        makePokemonCardMock({ blueprintId: 4 }),
        makePokemonCardMock({ blueprintId: 5 }),
        makePokemonCardMock({ blueprintId: 6 }),
        makePokemonCardMock({ blueprintId: 7 }),
        makePokemonCardMock({ blueprintId: 8 }),
        makePokemonCardMock({ blueprintId: 9 }),
        makePokemonCardMock({ blueprintId: 10 }),
        makePokemonCardMock({ blueprintId: 11 }),
      ])
      const result = await getCatalogUseCase.call(
        BASE_SET_EXPANSION_ID,
        new Map<string, BlueprintValue>([
          ['1', { ...BLUEPRINT_VALUE_MOCK, medianCents: 1 }],
          ['2', { ...BLUEPRINT_VALUE_MOCK, medianCents: 5 }],
          ['3', { ...BLUEPRINT_VALUE_MOCK, medianCents: 49_99 }],
          ['4', { ...BLUEPRINT_VALUE_MOCK, medianCents: 50_00 }],
          ['5', { ...BLUEPRINT_VALUE_MOCK, medianCents: 75_88 }],
          ['6', { ...BLUEPRINT_VALUE_MOCK, medianCents: 100_00 }],
          ['7', { ...BLUEPRINT_VALUE_MOCK, medianCents: 129_83 }],
          ['8', { ...BLUEPRINT_VALUE_MOCK, medianCents: 188_22 }],
          ['9', { ...BLUEPRINT_VALUE_MOCK, medianCents: 199_99 }],
          ['10', { ...BLUEPRINT_VALUE_MOCK, medianCents: 200_00 }],
          ['11', { ...BLUEPRINT_VALUE_MOCK, medianCents: 10_032_23 }],
        ]),
        USER_ID
      )
      expect(result.value.details?.priceDetails.zeroToFifty).toEqual(3)
      expect(result.value.details?.priceDetails.fiftyToOneHundred).toEqual(2)
      expect(result.value.details?.priceDetails.oneHundredTwoHundred).toEqual(4)
      expect(result.value.details?.priceDetails.twoHundredPlus).toEqual(2)
    })
  })

  describe('Cards', () => {
    it('should return an empty array when no blueprints and user is not logged in', async () => {
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, BLUEPRINT_VALUES)
      expect(pokemonCardFactory_FAKE.FROM_POSTGRES).toHaveBeenCalledWith(BASE_SET_EXPANSION_ID)
      expect(pokemonCardFactory_FAKE.FROM_CARD_TRADER).toHaveBeenCalledWith(BASE_SET_EXPANSION_ID)
      expect(result.value.cards).toEqual([])
    })
    it('should return blueprints from card trader when user is not logged in', async () => {
      const card = makePokemonCardMock({
        blueprintId: 1,
        expansionId: 2,
        name: 'name',
        imageUrlPreview: 'preview',
        imageUrlShow: 'show',
      })
      pokemonCardFactory_FAKE.FROM_CARD_TRADER.mockResolvedValue([card])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, BLUEPRINT_VALUES)
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
    it('should prefer postgres cards over card trader', async () => {
      const postgresCard = makePokemonCardMock({ blueprintId: 1 })
      pokemonCardFactory_FAKE.FROM_POSTGRES.mockResolvedValue([postgresCard])
      await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, BLUEPRINT_VALUES)
      expect(pokemonCardFactory_FAKE.FROM_CARD_TRADER).not.toHaveBeenCalled()
    })
    it('should return blueprints with no prices when prices are not available', async () => {
      pokemonCardFactory_FAKE.FROM_CARD_TRADER.mockResolvedValue([
        makePokemonCardMock({ blueprintId: 1, expansionId: 2 }),
      ])
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, new Map<string, BlueprintValue>())
      expect(result.value.cards[0].medianMarketValueCents).toEqual(-1)
    })
    it('should return blueprints with owned values when user is logged in', async () => {
      pokemonCardFactory_FAKE.FROM_CARD_TRADER.mockResolvedValue([
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
      const result = await getCatalogUseCase.call(BASE_SET_EXPANSION_ID, BLUEPRINT_VALUES, USER_ID)
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
