import Logger from '../logger'
import { IStore } from '../stores/IStore'
import { BlueprintValue } from '../types/BlueprintValue'
import { ICronJob } from './ICronJob'
import { ExpiresIn, isExpired } from './isExpired'

class PricesUpdater implements ICronJob {
  private readonly blueprintValueStore: IStore<Map<string, BlueprintValue>>

  constructor(blueprintValueStore: IStore<Map<string, BlueprintValue>>) {
    this.blueprintValueStore = blueprintValueStore
  }

  start = (expiresIn: ExpiresIn, interval: number) => {
    setInterval(() => {
      const lastDate = this.blueprintValueStore.getLastUpdated()
      const expired = isExpired({ expiresIn, lastDate, now: new Date() })
      if (expired) this.refresh()
    }, interval)
  }

  refresh = () => {
    this.blueprintValueStore
      .refreshStore()
      .then(() => Logger.info('price store refreshed'))
      .catch((e) => {
        Logger.info('Error occurred in price updater cron job')
        Logger.error(e)
      })
  }
}

export default PricesUpdater
