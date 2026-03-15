import { IPokemonCardFactory } from '../../../src/server/domain/PokemonCardFactory'

class PokemonCardFactory_FAKE implements IPokemonCardFactory {
  MAKE_LIST = jest.fn()

  makeList = this.MAKE_LIST
}

export default PokemonCardFactory_FAKE
