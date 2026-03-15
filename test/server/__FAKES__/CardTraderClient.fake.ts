import { ICardTraderClient } from '../../../src/server/clients/CardTrader/CardTraderClient'

class CardTraderClient_FAKE implements ICardTraderClient {
  GET_POKEMON_EXPANSIONS = jest.fn()
  GET_POKEMON_BLUEPRINTS = jest.fn()
  GET_POKEMON_CARD_VALUES = jest.fn()

  getPokemonExpansions = this.GET_POKEMON_EXPANSIONS
  getPokemonBlueprints = this.GET_POKEMON_BLUEPRINTS
  getPokemonCardValues = this.GET_POKEMON_CARD_VALUES
}

export default CardTraderClient_FAKE
