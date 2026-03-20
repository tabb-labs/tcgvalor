import Logger from '../../logger'
import { ICardTraderClient } from '../../clients/CardTrader/CardTraderClient'
import { ICardBlueprintPokemonRepo, PokemonCardBlueprint } from '../../repository/CardBlueprintPokemonRepo'
import { ICardBlueprintMarketValueRepo, MarketValueEntry } from '../../repository/CardBlueprintMarketValueRepo'
import { BlueprintValue } from '../../types/BlueprintValue'

export interface IPricesForExpansionUseCase {
  call: (cardTraderExpansionId: number, options?: { skipIfExists?: boolean }) => Promise<void>
}

class PricesForExpansionUseCase implements IPricesForExpansionUseCase {
  private readonly cardTraderClient: ICardTraderClient
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo
  private readonly cardBlueprintMarketValueRepo: ICardBlueprintMarketValueRepo

  constructor(
    cardTraderClient: ICardTraderClient,
    cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo,
    cardBlueprintMarketValueRepo: ICardBlueprintMarketValueRepo
  ) {
    this.cardTraderClient = cardTraderClient
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
    this.cardBlueprintMarketValueRepo = cardBlueprintMarketValueRepo
  }

  call = async (cardTraderExpansionId: number, { skipIfExists = false } = {}): Promise<void> => {
    if (skipIfExists) {
      const hasPrices = await this.cardBlueprintMarketValueRepo.expansionHasPrices(cardTraderExpansionId)
      if (hasPrices) return
    }

    const priceMap = await this.fetchPrices(cardTraderExpansionId)
    const blueprints = await this.cardBlueprintPokemonRepo.listByExpansion(cardTraderExpansionId)
    const values = this.buildUpsertValues(blueprints, priceMap)

    if (values.length === 0) {
      Logger.info(`PricesForExpansionUseCase: no blueprints found for expansion ${cardTraderExpansionId}`)
      return
    }

    await this.cardBlueprintMarketValueRepo.upsertMany(values)
  }

  private fetchPrices = async (cardTraderExpansionId: number): Promise<Map<string, BlueprintValue>> => {
    const blueprintIdToCardValuesMap = await this.cardTraderClient.getPokemonCardValues(cardTraderExpansionId)
    const priceMap = new Map<string, BlueprintValue>()

    blueprintIdToCardValuesMap.forEach((cardValues, blueprintId) => {
      const prices = cardValues.map((v) => v.priceCents)
      priceMap.set(blueprintId, {
        medianCents: Math.round(this.median(prices)),
        listingCount: prices.length,
      })
    })

    return priceMap
  }

  private buildUpsertValues = (
    blueprints: PokemonCardBlueprint[],
    priceMap: Map<string, BlueprintValue>
  ): MarketValueEntry[] => {
    return blueprints.flatMap((blueprint) => {
      const link = blueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      if (!link) return []
      const blueprintValue = priceMap.get(link.externalId)
      if (!blueprintValue) return []
      return [
        {
          cardBlueprintId: blueprint.id,
          medianCents: blueprintValue.medianCents,
          listingCount: blueprintValue.listingCount,
        },
      ]
    })
  }

  private median = (values: number[]): number => {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const half = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2
  }
}

export default PricesForExpansionUseCase
