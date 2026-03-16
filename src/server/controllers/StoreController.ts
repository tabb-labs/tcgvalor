/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Router } from 'express'
import { StoreStatusDto } from '@core/network-types/store'
import Store from '../StoreRegistry'
import { ENV } from '../env'

const StoreController = Router()

StoreController.get('/status', (_, res) => {
  const storeStatus: StoreStatusDto = {
    expansionsLastUpdatedDateString: Store.expansions.getLastUpdated()?.toISOString() ?? null,
    pricesLastUpdatedDateString: Store.blueprintValues.getLastUpdated()?.toISOString() ?? null,
  }
  res.sendData({ data: storeStatus })
})

StoreController.post('/marketplace/refresh', (req, res) => {
  if (req.body.adminToken !== ENV.ADMIN_TOKEN()) {
    res.status(401).send()
    return
  }
  void Store.blueprintValues.refreshStore()
  res.sendData({ data: 'marketplace refresh initiated' })
})

StoreController.post('/expansions/refresh', (req, res) => {
  if (req.body.adminToken !== ENV.ADMIN_TOKEN()) {
    res.sendError({ errors: [], status: 401 })
    return
  }
  void Store.expansions.refreshStore()
  res.sendData({ data: 'expansions refresh initiated' })
})

export default StoreController
