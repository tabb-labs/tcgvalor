import { ExpansionDetailsDto, ExpansionPriceDetailsDto } from '@core/network-types/catalog'
import PokemonCard from './PokemonCard'

class PokemonExpansion {
  readonly cardTraderExpansionId: number
  readonly name: string
  readonly expansionNumberInSeries: number
  readonly series: string
  readonly numberOfCards: number
  readonly numberOfSecretCards: number
  readonly releaseDate: Date
  readonly logoUrl: string | null
  readonly symbolUrl: string | null
  readonly bulbapediaUrl: string

  constructor(data: {
    cardTraderExpansionId: number
    name: string
    expansionNumberInSeries: number
    series: string
    numberOfCards: number
    numberOfSecretCards: number
    releaseDate: Date
    logoUrl: string | null
    symbolUrl: string | null
    bulbapediaUrl: string
  }) {
    this.cardTraderExpansionId = data.cardTraderExpansionId
    this.name = data.name
    this.expansionNumberInSeries = data.expansionNumberInSeries
    this.series = data.series
    this.numberOfCards = data.numberOfCards
    this.numberOfSecretCards = data.numberOfSecretCards
    this.releaseDate = data.releaseDate
    this.logoUrl = data.logoUrl
    this.symbolUrl = data.symbolUrl
    this.bulbapediaUrl = data.bulbapediaUrl
  }

  toExpansionDetailsDto = (cards: PokemonCard[]): ExpansionDetailsDto => ({
    name: this.name,
    expansionNumber: this.expansionNumberInSeries,
    series: this.series,
    cardCount: this.numberOfCards,
    secretCardCount: this.numberOfSecretCards,
    releaseDate: new Date(this.releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    logoUrl: this.logoUrl,
    symbolUrl: this.symbolUrl,
    bulbapediaUrl: this.bulbapediaUrl,
    priceDetails: this.buildPriceDetails(cards),
  })

  private buildPriceDetails = (cards: PokemonCard[]): ExpansionPriceDetailsDto =>
    cards.reduce(
      (acc, { medianMarketValueCents: v }) => {
        if (v >= 1 && v <= 49_99) acc.zeroToFifty++
        else if (v >= 50_00 && v <= 99_99) acc.fiftyToOneHundred++
        else if (v >= 100_00 && v <= 199_99) acc.oneHundredTwoHundred++
        else if (v >= 200_00) acc.twoHundredPlus++
        return acc
      },
      { zeroToFifty: 0, fiftyToOneHundred: 0, oneHundredTwoHundred: 0, twoHundredPlus: 0 }
    )
}

export default PokemonExpansion
