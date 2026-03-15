import { prisma } from '../../prisma/prismaClient'
import CardTraderClient from './clients/CardTrader/CardTraderClient'
import { ENV } from './env'
import GetBlueprintValueUseCase from './use-cases/price/GetBlueprintValueUseCase'
import ExpansionSorter from './use-cases/catalog/ExpansionSorter'
import GetExpansionsUseCase from './use-cases/catalog/GetExpansionsUseCase'
import BlueprintValueStore from './stores/BlueprintValueStore'
import ExpansionsStore from './stores/ExpansionsStore'
import { IStore } from './stores/IStore'
import { BlueprintValue } from './types/BlueprintValue'
import { ExpansionDto } from '@core/network-types/catalog'
import ExpansionsStoreDev from './stores/ExpansionsStoreDev'
import BlueprintValueStoreDev from './stores/BlueprintValueStoreDev'
import ExpansionPokemonRepo from './repository/ExpansionPokemonRepo'

export class StoreRegistry {
  expansions: IStore<ExpansionDto[]>
  blueprintValues: IStore<Map<string, BlueprintValue>>

  constructor(expansions: IStore<ExpansionDto[]>, blueprintValues: IStore<Map<string, BlueprintValue>>) {
    this.expansions = expansions
    this.blueprintValues = blueprintValues
  }

  init = async () => {
    await Store.expansions.refreshStore()
    await Store.blueprintValues.refreshStore()
  }
}

const getStore = () => {
  if (ENV.ID === 'production') {
    const expansionsStore = new ExpansionsStore(
      new GetExpansionsUseCase(prisma, new CardTraderClient(), new ExpansionSorter(), new ExpansionPokemonRepo())
    )

    const blueprintValueStore = new BlueprintValueStore(
      new GetBlueprintValueUseCase(new CardTraderClient()),
      expansionsStore
    )

    return new StoreRegistry(expansionsStore, blueprintValueStore)
  } else {
    return new StoreRegistry(new ExpansionsStoreDev(), new BlueprintValueStoreDev())
  }
}

const Store = getStore()

export default Store
