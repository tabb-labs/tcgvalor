import { IExpansionPokemonRepo } from '../repository/ExpansionPokemonRepo'
import PokemonExpansion from './PokemonExpansion'

export interface IPokemonExpansionFactory {
  make: (cardTraderExpansionId: number) => Promise<PokemonExpansion | null>
}

class PokemonExpansionFactory implements IPokemonExpansionFactory {
  private readonly expansionPokemonRepo: IExpansionPokemonRepo

  constructor(expansionPokemonRepo: IExpansionPokemonRepo) {
    this.expansionPokemonRepo = expansionPokemonRepo
  }

  make = async (cardTraderExpansionId: number): Promise<PokemonExpansion | null> => {
    const entity = await this.expansionPokemonRepo.find(cardTraderExpansionId)
    if (!entity) return null
    return new PokemonExpansion({
      cardTraderExpansionId: entity.cardTraderExpansionId,
      name: entity.name,
      expansionNumberInSeries: entity.expansionNumberInSeries,
      series: entity.series,
      numberOfCards: entity.numberOfCards,
      numberOfSecretCards: entity.numberOfSecretCards,
      releaseDate: entity.releaseDate,
      logoUrl: entity.logoUrl,
      symbolUrl: entity.symbolUrl,
      bulbapediaUrl: entity.bulbapediaUrl,
    })
  }
}

export default PokemonExpansionFactory
