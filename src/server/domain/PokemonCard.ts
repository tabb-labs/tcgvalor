import { CardDto } from '@core/network-types/card'

class PokemonCard {
  readonly cardTraderBlueprintId: number
  readonly cardTraderExpansionId: number
  readonly expansionName: string
  readonly expansionAbbreviation: string
  readonly collectorNumber: string
  readonly name: string
  readonly pokemonRarity: string
  readonly imageUrlPreview: string
  readonly imageUrlShow: string
  readonly medianMarketValueCents: number
  readonly listingCount: number
  readonly userCards: { id: number; condition: string }[]

  constructor(data: {
    cardTraderBlueprintId: number
    cardTraderExpansionId: number
    expansionName?: string
    expansionAbbreviation?: string
    collectorNumber: string
    name: string
    pokemonRarity: string
    imageUrlPreview: string
    imageUrlShow: string
    medianMarketValueCents: number
    listingCount: number
    userCards?: { id: number; condition: string }[]
  }) {
    this.cardTraderBlueprintId = data.cardTraderBlueprintId
    this.cardTraderExpansionId = data.cardTraderExpansionId
    this.expansionName = data.expansionName ?? ''
    this.expansionAbbreviation = data.expansionAbbreviation ?? ''
    this.collectorNumber = data.collectorNumber
    this.name = data.name
    this.pokemonRarity = data.pokemonRarity
    this.imageUrlPreview = data.imageUrlPreview
    this.imageUrlShow = data.imageUrlShow
    this.medianMarketValueCents = data.medianMarketValueCents
    this.listingCount = data.listingCount
    this.userCards = data.userCards ?? []
  }

  toCardDto = (): CardDto => ({
    blueprintId: this.cardTraderBlueprintId,
    expansionId: this.cardTraderExpansionId,
    expansionName: this.expansionName,
    expansionAbbreviation: this.expansionAbbreviation,
    collectorNumber: this.collectorNumber,
    name: this.name,
    imageUrlPreview: this.imageUrlPreview,
    imageUrlShow: this.imageUrlShow,
    userCards: this.userCards,
    medianMarketValueCents: this.medianMarketValueCents,
    listingCount: this.listingCount,
  })
}

export default PokemonCard
