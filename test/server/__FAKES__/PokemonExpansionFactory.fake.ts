import { IPokemonExpansionFactory } from '../../../src/server/domain/PokemonExpansionFactory'

class PokemonExpansionFactory_FAKE implements IPokemonExpansionFactory {
  FROM_POSTGRES = jest.fn()
  FROM_CARD_TRADER = jest.fn()

  fromPostgres = this.FROM_POSTGRES
  fromCardTrader = this.FROM_CARD_TRADER
}

export default PokemonExpansionFactory_FAKE
