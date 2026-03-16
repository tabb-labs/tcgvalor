import { SortableExpansion } from '../../../../src/server/use-cases/catalog/ExpansionSorter'
import GetExpansionsUseCase from '../../../../src/server/use-cases/catalog/GetExpansionsUseCase'
import { CardExpansion } from '../../../../src/server/types/CardExpansion'
import CardTraderClient_FAKE from '../../__FAKES__/CardTraderClient.fake'
import ExpansionPokemonRepo_FAKE from '../../__FAKES__/ExpansionPokemonRepo.fake'
import ExpansionSorter_FAKE from '../../__FAKES__/ExpansionSorter.fake'
import {
  CARD_EXPANSION_FOSSIL_MOCK,
  CARD_EXPANSION_MCDONALD_MOCK,
  CARD_EXPANSION_ORIGINAL_MOCK,
  CARD_EXPANSION_OTHER2_MOCK,
  CARD_EXPANSION_PARADOX_RIFT,
} from '../../__MOCKS__/cardExpansion.mock'
import { EXPANSION_ORDER } from '../../__MOCKS__/expansionOrder.mock'
import {
  SORTABLE_EXPANSION_FOSSIL_MOCK,
  SORTABLE_EXPANSION_MCDONALD_MOCK,
  SORTABLE_EXPANSION_ORIGINAL_MOCK,
  SORTABLE_EXPANSION_OTHER2_MOCK,
  SORTABLE_EXPANSION_PARADOX_RIFT_MOCK,
} from '../../__MOCKS__/sortableExpansion.mock'
import { makePrismaClientMock } from '../../__MOCKS__/prismaClient.mock'

const mockPrisma = makePrismaClientMock({ expansionPokemonOrder: { findFirst: jest.fn() } })

describe('Get Expansions UseCase', () => {
  let getExpansionsUseCase: GetExpansionsUseCase
  let cardTraderClient_FAKE: CardTraderClient_FAKE
  let expansionSorter_FAKE: ExpansionSorter_FAKE
  let expansionPokemonRepo_FAKE: ExpansionPokemonRepo_FAKE

  const cardExpansions: CardExpansion[] = [
    CARD_EXPANSION_ORIGINAL_MOCK,
    CARD_EXPANSION_FOSSIL_MOCK,
    CARD_EXPANSION_MCDONALD_MOCK,
    CARD_EXPANSION_OTHER2_MOCK,
    CARD_EXPANSION_PARADOX_RIFT,
  ]

  const sortableExpansions: SortableExpansion[] = [
    SORTABLE_EXPANSION_ORIGINAL_MOCK,
    SORTABLE_EXPANSION_FOSSIL_MOCK,
    SORTABLE_EXPANSION_MCDONALD_MOCK,
    SORTABLE_EXPANSION_OTHER2_MOCK,
    SORTABLE_EXPANSION_PARADOX_RIFT_MOCK,
  ]

  beforeEach(() => {
    cardTraderClient_FAKE = new CardTraderClient_FAKE()
    expansionSorter_FAKE = new ExpansionSorter_FAKE()
    expansionPokemonRepo_FAKE = new ExpansionPokemonRepo_FAKE()
    getExpansionsUseCase = new GetExpansionsUseCase(
      mockPrisma,
      cardTraderClient_FAKE,
      expansionSorter_FAKE,
      expansionPokemonRepo_FAKE
    )
  })

  it("should get pokemon expansions and return card dto's", async () => {
    cardTraderClient_FAKE.GET_POKEMON_EXPANSIONS.mockResolvedValue(cardExpansions)
    expansionSorter_FAKE.SORT.mockReturnValue(sortableExpansions)
    mockPrisma.expansionPokemonOrder.findFirst.mockResolvedValue(EXPANSION_ORDER)

    const result = await getExpansionsUseCase.call()

    expect(result.value.length).toEqual(5)
    expect(result.value[0].name).toEqual(SORTABLE_EXPANSION_ORIGINAL_MOCK.cardExpansion.name)
    expect(result.value[0].expansionId).toEqual(SORTABLE_EXPANSION_ORIGINAL_MOCK.cardExpansion.expansionId)
    expect(result.value[0].symbol).toEqual(SORTABLE_EXPANSION_ORIGINAL_MOCK.expansionEntity!.symbolUrl)

    expect(result.value[3].name).toEqual(SORTABLE_EXPANSION_OTHER2_MOCK.cardExpansion.name)
    expect(result.value[3].expansionId).toEqual(SORTABLE_EXPANSION_OTHER2_MOCK.cardExpansion.expansionId)
    expect(result.value[3].symbol).toBeNull()
  })

  it('should format slug', async () => {
    cardTraderClient_FAKE.GET_POKEMON_EXPANSIONS.mockResolvedValue(cardExpansions)
    expansionSorter_FAKE.SORT.mockReturnValue(sortableExpansions)
    mockPrisma.expansionPokemonOrder.findFirst.mockResolvedValue(EXPANSION_ORDER)

    const result = await getExpansionsUseCase.call()

    expect(result.value[0].slug).toEqual('original')
    expect(result.value[1].slug).toEqual('fossil')
    expect(result.value[2].slug).toEqual('mcdonalds')
    expect(result.value[3].slug).toEqual('other2')
    expect(result.value[4].slug).toEqual('paradox-rift')
  })
})
