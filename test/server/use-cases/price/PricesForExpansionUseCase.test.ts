import PricesForExpansionUseCase from '../../../../src/server/use-cases/price/PricesForExpansionUseCase'
import CardTraderClient_FAKE from '../../__FAKES__/CardTraderClient.fake'
import CardBlueprintPokemonRepo_FAKE from '../../__FAKES__/CardBlueprintPokemonRepo.fake'
import CardBlueprintMarketValueRepo_FAKE from '../../__FAKES__/CardBlueprintMarketValueRepo.fake'
import { makeCardValueMock } from '../../__MOCKS__/cardValue.mock'

const EXPANSION_ID = 10
const BLUEPRINT_ID = 1
const BLUEPRINT_EXTERNAL_ID = '100'

const makeBlueprintStub = (id: number, externalId: string) => ({
  id,
  platformLinks: [{ platform: 'CARD_TRADER', externalId }],
})

describe('PricesForExpansionUseCase', () => {
  let useCase: PricesForExpansionUseCase
  let cardTraderClient_FAKE: CardTraderClient_FAKE
  let cardBlueprintPokemonRepo_FAKE: CardBlueprintPokemonRepo_FAKE
  let cardBlueprintMarketValueRepo_FAKE: CardBlueprintMarketValueRepo_FAKE

  beforeEach(() => {
    jest.clearAllMocks()
    cardTraderClient_FAKE = new CardTraderClient_FAKE()
    cardBlueprintPokemonRepo_FAKE = new CardBlueprintPokemonRepo_FAKE()
    cardBlueprintMarketValueRepo_FAKE = new CardBlueprintMarketValueRepo_FAKE()
    useCase = new PricesForExpansionUseCase(
      cardTraderClient_FAKE,
      cardBlueprintPokemonRepo_FAKE,
      cardBlueprintMarketValueRepo_FAKE
    )
  })

  const setupHappyPath = () => {
    const priceMap = new Map([[BLUEPRINT_EXTERNAL_ID, [makeCardValueMock({ priceCents: 500 })]]])
    cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES.mockResolvedValue(priceMap)
    cardBlueprintPokemonRepo_FAKE.LIST_BY_EXPANSION.mockResolvedValue([
      makeBlueprintStub(BLUEPRINT_ID, BLUEPRINT_EXTERNAL_ID),
    ])
  }

  it('should fetch prices and upsert by default', async () => {
    setupHappyPath()

    await useCase.call(EXPANSION_ID)

    expect(cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES).toHaveBeenCalledWith(EXPANSION_ID)
    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).toHaveBeenCalledWith([
      expect.objectContaining({ cardBlueprintId: BLUEPRINT_ID, medianCents: 500, listingCount: 1 }),
    ])
  })

  it('should fetch prices when skipIfExists is false and expansion already has prices', async () => {
    setupHappyPath()
    cardBlueprintMarketValueRepo_FAKE.EXPANSION_HAS_PRICES.mockResolvedValue(true)

    await useCase.call(EXPANSION_ID, { skipIfExists: false })

    expect(cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES).toHaveBeenCalled()
    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).toHaveBeenCalled()
  })

  it('should skip when skipIfExists is true and expansion already has prices', async () => {
    cardBlueprintMarketValueRepo_FAKE.EXPANSION_HAS_PRICES.mockResolvedValue(true)

    await useCase.call(EXPANSION_ID, { skipIfExists: true })

    expect(cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES).not.toHaveBeenCalled()
    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).not.toHaveBeenCalled()
  })

  it('should fetch when skipIfExists is true but expansion has no prices yet', async () => {
    setupHappyPath()
    cardBlueprintMarketValueRepo_FAKE.EXPANSION_HAS_PRICES.mockResolvedValue(false)

    await useCase.call(EXPANSION_ID, { skipIfExists: true })

    expect(cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES).toHaveBeenCalled()
    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).toHaveBeenCalled()
  })

  it('should not upsert when no blueprints are found', async () => {
    const priceMap = new Map([[BLUEPRINT_EXTERNAL_ID, [makeCardValueMock({ priceCents: 500 })]]])
    cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES.mockResolvedValue(priceMap)
    cardBlueprintPokemonRepo_FAKE.LIST_BY_EXPANSION.mockResolvedValue([])

    await useCase.call(EXPANSION_ID)

    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).not.toHaveBeenCalled()
  })

  it('should calculate the median price correctly', async () => {
    const priceMap = new Map([
      [
        BLUEPRINT_EXTERNAL_ID,
        [
          makeCardValueMock({ priceCents: 100 }),
          makeCardValueMock({ priceCents: 300 }),
          makeCardValueMock({ priceCents: 200 }),
        ],
      ],
    ])
    cardTraderClient_FAKE.GET_POKEMON_CARD_VALUES.mockResolvedValue(priceMap)
    cardBlueprintPokemonRepo_FAKE.LIST_BY_EXPANSION.mockResolvedValue([
      makeBlueprintStub(BLUEPRINT_ID, BLUEPRINT_EXTERNAL_ID),
    ])

    await useCase.call(EXPANSION_ID)

    expect(cardBlueprintMarketValueRepo_FAKE.UPSERT_MANY).toHaveBeenCalledWith([
      expect.objectContaining({ medianCents: 200, listingCount: 3 }),
    ])
  })
})
