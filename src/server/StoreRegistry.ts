import { prisma } from '../../prisma/prismaClient'
import CardTraderClient from './clients/CardTrader/CardTraderClient'
import { ENV } from './env'
import ExpansionSorter from './use-cases/catalog/ExpansionSorter'
import GetExpansionsUseCase from './use-cases/catalog/GetExpansionsUseCase'
import ExpansionsStore from './stores/ExpansionsStore'
import { IStore } from './stores/IStore'
import { ExpansionDto } from '@core/network-types/catalog'
import ExpansionsStoreDev from './stores/ExpansionsStoreDev'
import ExpansionPokemonRepo from './repository/ExpansionPokemonRepo'

export class StoreRegistry {
  expansions: IStore<ExpansionDto[]>

  constructor(expansions: IStore<ExpansionDto[]>) {
    this.expansions = expansions
  }

  init = async () => {
    await Store.expansions.refreshStore()
  }
}

const getStore = () => {
  if (ENV.ID === 'production') {
    const expansionsStore = new ExpansionsStore(
      new GetExpansionsUseCase(prisma, new CardTraderClient(), new ExpansionSorter(), new ExpansionPokemonRepo())
    )
    return new StoreRegistry(expansionsStore)
  } else {
    return new StoreRegistry(new ExpansionsStoreDev())
  }
}

const Store = getStore()

export default Store
