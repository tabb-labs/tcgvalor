import { CardDto } from '@core/network-types/card'
import { CollectionMetaDto } from '@core/network-types/collection'
import PokemonCard from './PokemonCard'

export interface ICollection {
  cards: () => CardDto[]
  details: () => CollectionMetaDto
}

class Collection implements ICollection {
  private cardCollection: CardDto[]
  private cardDetails: CollectionMetaDto

  constructor(pokemonCards: PokemonCard[]) {
    this.cardCollection = pokemonCards.map((c) => c.toCardDto())
    this.cardDetails = {
      cardsInCollection: pokemonCards.reduce((sum, c) => sum + c.userCards.length, 0),
      medianMarketValueCents: pokemonCards.reduce((sum, c) => {
        if (c.medianMarketValueCents < 0) return sum
        return sum + c.medianMarketValueCents * c.userCards.length
      }, 0),
    }
  }

  cards = () => this.cardCollection
  details = () => this.cardDetails
}

export default Collection
