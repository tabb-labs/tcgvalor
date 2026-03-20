import ExpansionsUpdater from './cron-jobs/ExpansionsUpdater'
import OwnedPricesUpdater from './cron-jobs/OwnedPricesUpdater'
import { ICronJob } from './cron-jobs/ICronJob'
import { ENV } from './env'
import Store from './StoreRegistry'
import CardBlueprintMarketValueRepo from './repository/CardBlueprintMarketValueRepo'
import CardBlueprintPokemonRepo from './repository/CardBlueprintPokemonRepo'
import CardTraderClient from './clients/CardTrader/CardTraderClient'
import PricesForExpansionUseCase from './use-cases/price/PricesForExpansionUseCase'

const oneSecondInMilliseconds = 1_000
const oneMinuteInMilliseconds = oneSecondInMilliseconds * 60
const oneHourInMilliseconds = oneMinuteInMilliseconds * 60

export class CronJobRegistry {
  private readonly pricesUpdater: ICronJob
  private readonly expansionUpdater: ICronJob

  constructor(pricesUpdater: ICronJob, expansionsUpdater: ICronJob) {
    this.pricesUpdater = pricesUpdater
    this.expansionUpdater = expansionsUpdater
  }

  initialLoad = () => {
    this.pricesUpdater.refresh()
  }

  start = () => {
    if (ENV.ID === 'production') {
      const fourHours = oneHourInMilliseconds * 4
      this.pricesUpdater.start({ days: 4 }, fourHours)
      this.expansionUpdater.start({ days: 2 }, fourHours)
    } else {
      const thirtySeconds = oneSecondInMilliseconds * 30
      this.pricesUpdater.start({ minutes: 2 }, thirtySeconds)
      this.expansionUpdater.start({ seconds: 45 }, thirtySeconds)
    }
  }
}

const cardTraderClient = new CardTraderClient()
const cardBlueprintMarketValueRepo = new CardBlueprintMarketValueRepo()
const pricesForExpansionUseCase = new PricesForExpansionUseCase(
  cardTraderClient,
  new CardBlueprintPokemonRepo(),
  cardBlueprintMarketValueRepo
)

const pricesUpdater: ICronJob = new OwnedPricesUpdater(cardBlueprintMarketValueRepo, pricesForExpansionUseCase)
const expansionUpdater: ICronJob = new ExpansionsUpdater(Store.expansions)

const CronJobs = new CronJobRegistry(pricesUpdater, expansionUpdater)

export default CronJobs
