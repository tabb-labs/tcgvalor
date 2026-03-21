import Logger from '../logger'
import { ICardBlueprintMarketValueRepo } from '../repository/CardBlueprintMarketValueRepo'
import { IPricesForExpansionUseCase } from '../use-cases/price/PricesForExpansionUseCase'
import { ICronJob } from './ICronJob'
import { ExpiresIn, isExpired } from './isExpired'

class OwnedPricesUpdater implements ICronJob {
  private readonly cardBlueprintMarketValueRepo: ICardBlueprintMarketValueRepo
  private readonly pricesForExpansionUseCase: IPricesForExpansionUseCase
  private lastRun: Date | null = null

  constructor(
    cardBlueprintMarketValueRepo: ICardBlueprintMarketValueRepo,
    pricesForExpansionUseCase: IPricesForExpansionUseCase
  ) {
    this.cardBlueprintMarketValueRepo = cardBlueprintMarketValueRepo
    this.pricesForExpansionUseCase = pricesForExpansionUseCase
  }

  start = (expiresIn: ExpiresIn, interval: number) => {
    setInterval(() => {
      const expired = isExpired({ expiresIn, lastDate: this.lastRun, now: new Date() })
      if (expired) this.refresh()
    }, interval)
  }

  refresh = () => {
    this.cardBlueprintMarketValueRepo
      .listOwnedCardTraderExpansionIds()
      .then((expansionIds) => {
        Logger.info(`OwnedPricesUpdater: refreshing prices for ${expansionIds.length} expansions`)
        const batchSize = 5
        const batches = []
        for (let i = 0; i < expansionIds.length; i += batchSize) {
          batches.push(expansionIds.slice(i, i + batchSize))
        }
        return batches.reduce(
          (chain, batch) =>
            chain.then(() =>
              Promise.all(
                batch.map((id) =>
                  this.pricesForExpansionUseCase.call(id).catch((e) => {
                    Logger.error(`OwnedPricesUpdater: failed to refresh prices for expansion ${id}: ${e}`)
                  })
                )
              )
            ),
          Promise.resolve() as Promise<unknown>
        )
      })
      .then(() => {
        this.lastRun = new Date()
        Logger.info('OwnedPricesUpdater: done')
      })
      .catch((e) => Logger.error(`OwnedPricesUpdater: ${e}`))
  }
}

export default OwnedPricesUpdater
