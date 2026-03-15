import { ICardTraderAdaptor } from '../clients/CardTrader/CardTraderAdaptor'
import { IExpansionPokemonRepo } from '../repository/ExpansionPokemonRepo'
import PokemonExpansion from './PokemonExpansion'

export interface IPokemonExpansionFactory {
  fromPostgres: (cardTraderExpansionId: number) => Promise<PokemonExpansion | null>
  fromCardTrader: (cardTraderExpansionId: number) => Promise<PokemonExpansion | null>
}

class PokemonExpansionFactory implements IPokemonExpansionFactory {
  private readonly expansionPokemonRepo: IExpansionPokemonRepo
  private readonly cardTraderAdaptor: ICardTraderAdaptor

  constructor(expansionPokemonRepo: IExpansionPokemonRepo, cardTraderAdaptor: ICardTraderAdaptor) {
    this.expansionPokemonRepo = expansionPokemonRepo
    this.cardTraderAdaptor = cardTraderAdaptor
  }

  fromPostgres = async (cardTraderExpansionId: number): Promise<PokemonExpansion | null> => {
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

  fromCardTrader = async (cardTraderExpansionId: number): Promise<PokemonExpansion | null> => {
    const expansions = await this.cardTraderAdaptor.getPokemonExpansions()
    const match = expansions.find((e) => e.expansionId === cardTraderExpansionId)
    if (!match) return null
    return new PokemonExpansion({
      cardTraderExpansionId: match.expansionId,
      name: match.name,
      expansionNumberInSeries: 0,
      series: '',
      numberOfCards: 0,
      numberOfSecretCards: 0,
      releaseDate: new Date(0),
      logoUrl: null,
      symbolUrl: null,
      bulbapediaUrl: '',
    })
  }
}

export default PokemonExpansionFactory
