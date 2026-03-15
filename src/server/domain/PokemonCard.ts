import { CardDto } from '@core/network-types/card'
import { UserCardWithBlueprint } from '../repository/UserCardRepo'

class PokemonCard {
  readonly cardTraderBlueprintId: number
  readonly cardTraderExpansionId: number
  readonly name: string
  readonly collectorNumber: string
  readonly pokemonRarity: string
  readonly imageUrlPreview: string
  readonly imageUrlShow: string
  readonly medianMarketValueCents: number
  readonly listingCount: number

  constructor(data: {
    cardTraderBlueprintId: number
    cardTraderExpansionId: number
    name: string
    collectorNumber: string
    pokemonRarity: string
    imageUrlPreview: string
    imageUrlShow: string
    medianMarketValueCents: number
    listingCount: number
  }) {
    this.cardTraderBlueprintId = data.cardTraderBlueprintId
    this.cardTraderExpansionId = data.cardTraderExpansionId
    this.name = data.name
    this.collectorNumber = data.collectorNumber
    this.pokemonRarity = data.pokemonRarity
    this.imageUrlPreview = data.imageUrlPreview
    this.imageUrlShow = data.imageUrlShow
    this.medianMarketValueCents = data.medianMarketValueCents
    this.listingCount = data.listingCount
  }

  toCardDto = (userCards: UserCardWithBlueprint[] = []): CardDto => ({
    blueprintId: this.cardTraderBlueprintId,
    expansionId: this.cardTraderExpansionId,
    name: this.name,
    imageUrlPreview: this.imageUrlPreview,
    imageUrlShow: this.imageUrlShow,
    userCards: userCards
      .filter((c) =>
        c.cardBlueprint.platformLinks.some(
          (l) => l.platform === 'CARD_TRADER' && Number(l.externalId) === this.cardTraderBlueprintId
        )
      )
      .map((c) => ({ id: c.id, condition: c.condition })),
    medianMarketValueCents: this.medianMarketValueCents,
    listingCount: this.listingCount,
  })
}

export default PokemonCard
