import { ICardBlueprintMarketValueRepo } from '../../../src/server/repository/CardBlueprintMarketValueRepo'

class CardBlueprintMarketValueRepo_FAKE implements ICardBlueprintMarketValueRepo {
  UPSERT_MANY = jest.fn().mockResolvedValue(undefined)
  EXPANSION_HAS_PRICES = jest.fn().mockResolvedValue(false)
  FIND_ALL_BY_EXPANSION = jest.fn().mockResolvedValue([])
  FIND_MANY_BY_BLUEPRINT_IDS = jest.fn().mockResolvedValue([])
  LIST_OWNED_CARD_TRADER_EXPANSION_IDS = jest.fn().mockResolvedValue([])
  GET_LATEST_FETCHED_AT = jest.fn().mockResolvedValue(null)

  upsertMany = this.UPSERT_MANY
  expansionHasPrices = this.EXPANSION_HAS_PRICES
  findAllByExpansion = this.FIND_ALL_BY_EXPANSION
  findManyByBlueprintIds = this.FIND_MANY_BY_BLUEPRINT_IDS
  listOwnedCardTraderExpansionIds = this.LIST_OWNED_CARD_TRADER_EXPANSION_IDS
  getLatestFetchedAt = this.GET_LATEST_FETCHED_AT
}

export default CardBlueprintMarketValueRepo_FAKE
