import { IPokemonExpansionFactory } from '../../../src/server/domain/PokemonExpansionFactory'

class PokemonExpansionFactory_FAKE implements IPokemonExpansionFactory {
  MAKE = jest.fn()

  make = this.MAKE
}

export default PokemonExpansionFactory_FAKE
