/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Router } from 'express'
import { StoreStatusDto } from '@core/network-types/store'
import Store from '../StoreRegistry'
import CardBlueprintMarketValueRepo from '../repository/CardBlueprintMarketValueRepo'
import { ENV } from '../env'
import { asyncHandler } from '../http/asyncHandler'

const cardBlueprintMarketValueRepo = new CardBlueprintMarketValueRepo()
const StoreController = Router()

StoreController.get(
  '/status',
  asyncHandler(async (_, res) => {
    const pricesLastUpdatedAt = await cardBlueprintMarketValueRepo.getLatestFetchedAt()
    const storeStatus: StoreStatusDto = {
      expansionsLastUpdatedDateString: Store.expansions.getLastUpdated()?.toISOString() ?? null,
      pricesLastUpdatedDateString: pricesLastUpdatedAt?.toISOString() ?? null,
    }
    res.sendData({ data: storeStatus })
  })
)

StoreController.post('/expansions/refresh', (req, res) => {
  if (req.body.adminToken !== ENV.ADMIN_TOKEN()) {
    res.sendError({ errors: [], status: 401 })
    return
  }
  void Store.expansions.refreshStore()
  res.sendData({ data: 'expansions refresh initiated' })
})

export default StoreController
