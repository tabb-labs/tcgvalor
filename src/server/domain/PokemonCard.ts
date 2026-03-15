import { CardDto } from '@core/network-types/card'
import UserCardStack from './UserCardStack'

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

  toCardDto = (userCardStack?: UserCardStack): CardDto => ({
    blueprintId: this.cardTraderBlueprintId,
    expansionId: this.cardTraderExpansionId,
    name: this.name,
    imageUrlPreview: this.imageUrlPreview,
    imageUrlShow: this.imageUrlShow,
    owned: userCardStack?.filter(this.cardTraderBlueprintId).length ?? 0,
    medianMarketValueCents: this.medianMarketValueCents,
    listingCount: this.listingCount,
  })
}

export default PokemonCard
