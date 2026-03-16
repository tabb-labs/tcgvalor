import { CardTraderBlueprintDto } from '../../../src/server/clients/CardTrader/parseBlueprints'

type MakeCardBlueprintMockArgs = {
  blueprintId?: number
  expansionId?: number
  name?: string
  version?: string
  collectorNumber?: string
  pokemonRarity?: string
  imageUrlShow?: string
  imageUrlPreview?: string
}

export const makeCardBlueprintMock = ({
  blueprintId = 1,
  expansionId = 2,
  name = 'name',
  version = 'version',
  collectorNumber = '',
  pokemonRarity = 'Common',
  imageUrlPreview = 'image url preview',
  imageUrlShow = 'image url show',
}: MakeCardBlueprintMockArgs): CardTraderBlueprintDto => ({
  id: blueprintId,
  expansionId,
  name,
  version,
  gameId: 5,
  categoryId: 73,
  fixedProperties: {
    collectorNumber,
    pokemonRarity,
  },
  image: {
    show: { url: imageUrlShow },
    preview: { url: imageUrlPreview },
  },
})
