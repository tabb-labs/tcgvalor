import { CardCondition } from '@prisma/client'
import AddCardTraderCardUseCase from '../../../../src/server/use-cases/collection/AddCardTraderCardUseCase'
import CardTraderClient_FAKE from '../../__FAKES__/CardTraderClient.fake'
import ExpansionPokemonRepo_FAKE from '../../__FAKES__/ExpansionPokemonRepo.fake'
import CardBlueprintPokemonRepo_FAKE from '../../__FAKES__/CardBlueprintPokemonRepo.fake'
import { makePrismaClientMock } from '../../__MOCKS__/prismaClient.mock'
import { EXPANSION_ENTITY_ORIGINAL } from '../../__MOCKS__/expansionEntity.mock'
import { makeCardBlueprintMock } from '../../__MOCKS__/cardBlueprint.mock'

const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

const mockPrisma = makePrismaClientMock({
  userCard: { create: jest.fn() },
})

describe('Add Card Trader Card UseCase', () => {
  let useCase: AddCardTraderCardUseCase
  let cardTraderClient_FAKE: CardTraderClient_FAKE
  let expansionPokemonRepo_FAKE: ExpansionPokemonRepo_FAKE
  let cardBlueprintPokemonRepo_FAKE: CardBlueprintPokemonRepo_FAKE

  const USER_ID = 1
  const CARD_TRADER_BLUEPRINT_ID = 100
  const CARD_TRADER_EXPANSION_ID = 200
  const CONDITION: CardCondition = 'NEAR_MINT'
  const EXPANSION_ID = 42
  const CARD_BLUEPRINT_ID = 99

  beforeEach(() => {
    jest.clearAllMocks()
    cardTraderClient_FAKE = new CardTraderClient_FAKE()
    expansionPokemonRepo_FAKE = new ExpansionPokemonRepo_FAKE()
    cardBlueprintPokemonRepo_FAKE = new CardBlueprintPokemonRepo_FAKE()
    useCase = new AddCardTraderCardUseCase(
      mockPrisma,
      cardTraderClient_FAKE,
      expansionPokemonRepo_FAKE,
      cardBlueprintPokemonRepo_FAKE
    )
  })

  const setupHappyPath = () => {
    expansionPokemonRepo_FAKE.FIND.mockResolvedValue({ ...EXPANSION_ENTITY_ORIGINAL, id: EXPANSION_ID })
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue({ id: CARD_BLUEPRINT_ID })
  }

  it('should create a user card with the correct data', async () => {
    setupHappyPath()

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(mockPrisma.userCard.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        cardBlueprintId: CARD_BLUEPRINT_ID,
        condition: CONDITION,
      },
    })
  })

  it('should not create expansion when it already exists', async () => {
    setupHappyPath()

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(expansionPokemonRepo_FAKE.FIND).toHaveBeenCalledWith(CARD_TRADER_EXPANSION_ID)
    expect(expansionPokemonRepo_FAKE.CREATE).not.toHaveBeenCalled()
  })

  it('should fetch and create expansion when it does not exist', async () => {
    expansionPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    expansionPokemonRepo_FAKE.CREATE.mockResolvedValue(EXPANSION_ID)
    cardTraderClient_FAKE.GET_POKEMON_EXPANSIONS.mockResolvedValue([
      { expansionId: CARD_TRADER_EXPANSION_ID, name: 'Base Set' },
    ])
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([
      makeCardBlueprintMock({ blueprintId: CARD_TRADER_BLUEPRINT_ID }),
    ])
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    cardBlueprintPokemonRepo_FAKE.CREATE.mockResolvedValue(CARD_BLUEPRINT_ID)

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(expansionPokemonRepo_FAKE.CREATE).toHaveBeenCalledWith(
      expect.objectContaining({
        cardTraderExpansionId: CARD_TRADER_EXPANSION_ID,
        name: 'Base Set',
      })
    )
  })

  it('should use empty string for expansion name when not matched in card trader response', async () => {
    expansionPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    expansionPokemonRepo_FAKE.CREATE.mockResolvedValue(EXPANSION_ID)
    cardTraderClient_FAKE.GET_POKEMON_EXPANSIONS.mockResolvedValue([])
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([
      makeCardBlueprintMock({ blueprintId: CARD_TRADER_BLUEPRINT_ID }),
    ])
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    cardBlueprintPokemonRepo_FAKE.CREATE.mockResolvedValue(CARD_BLUEPRINT_ID)

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(expansionPokemonRepo_FAKE.CREATE).toHaveBeenCalledWith(expect.objectContaining({ name: '' }))
  })

  it('should create only the required blueprint when it does not exist', async () => {
    const targetBlueprint = makeCardBlueprintMock({ blueprintId: CARD_TRADER_BLUEPRINT_ID })

    expansionPokemonRepo_FAKE.FIND.mockResolvedValue({ ...EXPANSION_ENTITY_ORIGINAL, id: EXPANSION_ID })
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([targetBlueprint])
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    cardBlueprintPokemonRepo_FAKE.CREATE.mockResolvedValue(CARD_BLUEPRINT_ID)

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(cardBlueprintPokemonRepo_FAKE.CREATE).toHaveBeenCalledWith({
      expansionId: EXPANSION_ID,
      cardTraderBlueprintId: targetBlueprint.blueprintId,
      name: targetBlueprint.name,
      collectorNumber: targetBlueprint.collectorNumber,
      rarity: targetBlueprint.pokemonRarity,
      imageShowUrl: targetBlueprint.imageUrlShow,
      imagePreviewUrl: targetBlueprint.imageUrlPreview,
    })
  })

  it('should not create blueprint when it already exists', async () => {
    setupHappyPath()

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)

    expect(cardBlueprintPokemonRepo_FAKE.CREATE).not.toHaveBeenCalled()
  })

  it('should backfill remaining blueprints after the required one is created', async () => {
    const targetBlueprint = makeCardBlueprintMock({ blueprintId: CARD_TRADER_BLUEPRINT_ID })
    const otherBlueprint = makeCardBlueprintMock({ blueprintId: 999 })

    expansionPokemonRepo_FAKE.FIND.mockResolvedValue({ ...EXPANSION_ENTITY_ORIGINAL, id: EXPANSION_ID })
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([targetBlueprint, otherBlueprint])
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    cardBlueprintPokemonRepo_FAKE.CREATE.mockResolvedValue(CARD_BLUEPRINT_ID)

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)
    await flushPromises()

    expect(cardBlueprintPokemonRepo_FAKE.CREATE).toHaveBeenCalledTimes(2)
    expect(cardBlueprintPokemonRepo_FAKE.CREATE).toHaveBeenCalledWith(
      expect.objectContaining({ cardTraderBlueprintId: otherBlueprint.blueprintId })
    )
  })

  it('should skip already-existing blueprints during backfill', async () => {
    const targetBlueprint = makeCardBlueprintMock({ blueprintId: CARD_TRADER_BLUEPRINT_ID })
    const existingBlueprint = makeCardBlueprintMock({ blueprintId: 999 })

    expansionPokemonRepo_FAKE.FIND.mockResolvedValue({ ...EXPANSION_ENTITY_ORIGINAL, id: EXPANSION_ID })
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([targetBlueprint, existingBlueprint])
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValueOnce(null) // target doesn't exist
      .mockResolvedValue({ id: 999 }) // remaining blueprints already exist
    cardBlueprintPokemonRepo_FAKE.CREATE.mockResolvedValue(CARD_BLUEPRINT_ID)

    await useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)
    await flushPromises()

    expect(cardBlueprintPokemonRepo_FAKE.CREATE).toHaveBeenCalledTimes(1)
  })

  it('should throw when requested blueprint is not found in card trader response', async () => {
    expansionPokemonRepo_FAKE.FIND.mockResolvedValue({ ...EXPANSION_ENTITY_ORIGINAL, id: EXPANSION_ID })
    cardBlueprintPokemonRepo_FAKE.FIND.mockResolvedValue(null)
    cardTraderClient_FAKE.GET_POKEMON_BLUEPRINTS.mockResolvedValue([makeCardBlueprintMock({ blueprintId: 999 })])

    await expect(useCase.call(USER_ID, CARD_TRADER_BLUEPRINT_ID, CARD_TRADER_EXPANSION_ID, CONDITION)).rejects.toThrow(
      `Blueprint ${CARD_TRADER_BLUEPRINT_ID} not found in expansion ${CARD_TRADER_EXPANSION_ID}`
    )
  })
})
