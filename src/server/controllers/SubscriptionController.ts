import { Router } from 'express'
import { asyncHandler } from '../http/asyncHandler'
import { requiresAuthMiddleware } from '../http/requiresAuthMiddleware'
import { VerifyAppStoreBodySchema } from '@core/network-types/subscription'
import VerifyAppStorePurchaseUseCase from '../use-cases/subscription/VerifyAppStorePurchaseUseCase'
import SubscriptionRepo from '../repository/SubscriptionRepo'

const SubscriptionController = Router()

SubscriptionController.post(
  '/verify/appstore',
  ...requiresAuthMiddleware,
  asyncHandler(async (req, res) => {
    const parsed = VerifyAppStoreBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((i) => i.message), status: 400 })
      return
    }

    const useCase = new VerifyAppStorePurchaseUseCase(new SubscriptionRepo())
    const result = await useCase.call(req.currentUser!.id, parsed.data.signedTransaction)

    if (result.isSuccess()) {
      res.sendData({ data: result.value })
    } else {
      res.sendError({ errors: [result.error], status: 400 })
    }
  })
)

export default SubscriptionController
