import { ICardBlueprintPokemonRepo } from '../../../src/server/repository/CardBlueprintPokemonRepo'

class CardBlueprintPokemonRepo_FAKE implements ICardBlueprintPokemonRepo {
  FIND = jest.fn()
  LIST_BY_EXPANSION = jest.fn()
  SEARCH_BY_NAME = jest.fn()
  CREATE = jest.fn()

  find = this.FIND
  listByExpansion = this.LIST_BY_EXPANSION
  searchByName = this.SEARCH_BY_NAME
  create = this.CREATE
}

export default CardBlueprintPokemonRepo_FAKE
