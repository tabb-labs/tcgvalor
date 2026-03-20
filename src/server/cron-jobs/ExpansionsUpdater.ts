import { ExpansionDto } from '@core/network-types/catalog'
import Logger from '../logger'
import { IStore } from '../stores/IStore'
import { ICronJob } from './ICronJob'
import { ExpiresIn, isExpired } from './isExpired'

class ExpansionsUpdater implements ICronJob {
  private readonly expansionsStore: IStore<ExpansionDto[]>

  constructor(expansionsStore: IStore<ExpansionDto[]>) {
    this.expansionsStore = expansionsStore
  }

  start = (expiresIn: ExpiresIn, interval: number) => {
    setInterval(() => {
      const lastDate = this.expansionsStore.getLastUpdated()
      const expired = isExpired({ expiresIn, lastDate, now: new Date() })
      if (expired) this.refresh()
    }, interval)
  }

  refresh = () => {
    this.expansionsStore
      .refreshStore()
      .then(() => Logger.info('expansion store refreshed'))
      .catch((e) => {
        Logger.info('Error occurred in expansion updater cron job')
        Logger.error(e)
      })
  }
}

export default ExpansionsUpdater
