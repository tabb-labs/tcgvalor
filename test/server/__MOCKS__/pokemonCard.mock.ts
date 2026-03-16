import PokemonCard from '../../../src/server/domain/PokemonCard'

type MakePokemonCardMockArgs = {
  blueprintId?: number
  expansionId?: number
  name?: string
  collectorNumber?: string
  pokemonRarity?: string
  imageUrlPreview?: string
  imageUrlShow?: string
  medianMarketValueCents?: number
  listingCount?: number
  userCards?: { id: number; condition: string }[]
}

export const makePokemonCardMock = ({
  blueprintId = 1,
  expansionId = 2,
  name = 'name',
  collectorNumber = '',
  pokemonRarity = 'Common',
  imageUrlPreview = 'image url preview',
  imageUrlShow = 'image url show',
  medianMarketValueCents = -1,
  listingCount = -1,
  userCards = [],
}: MakePokemonCardMockArgs = {}): PokemonCard =>
  new PokemonCard({
    cardTraderBlueprintId: blueprintId,
    cardTraderExpansionId: expansionId,
    name,
    collectorNumber,
    pokemonRarity,
    imageUrlPreview,
    imageUrlShow,
    medianMarketValueCents,
    listingCount,
    userCards,
  })
