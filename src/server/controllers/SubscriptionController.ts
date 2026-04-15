import { z } from 'zod'
import { Router } from 'express'
import { asyncHandler } from '../http/asyncHandler'
import { requiresAuthMiddleware } from '../http/requiresAuthMiddleware'
import VerifyAppStorePurchaseUseCase from '../use-cases/subscription/VerifyAppStorePurchaseUseCase'
import GetEntitlementsUseCase from '../use-cases/subscription/GetEntitlementsUseCase'
import HandleAppStoreNotificationUseCase from '../use-cases/subscription/HandleAppStoreNotificationUseCase'
import SubscriptionRepo from '../repository/SubscriptionRepo'
import AppleTransactionVerifier from '../clients/Apple/AppleTransactionVerifier'
import AppleNotificationVerifier from '../clients/Apple/AppleNotificationVerifier'

const VerifyAppStoreBodySchema = z.object({
  signedTransaction: z.string().min(1),
})

const AppStoreNotificationBodySchema = z.object({
  signedPayload: z.string().min(1),
})

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

    const useCase = new VerifyAppStorePurchaseUseCase(new SubscriptionRepo(), new AppleTransactionVerifier())
    const result = await useCase.call(req.currentUser!.id, parsed.data.signedTransaction)

    if (result.isSuccess()) {
      res.sendData({ data: result.value })
    } else {
      res.sendError({ errors: [result.error], status: 400 })
    }
  })
)

SubscriptionController.post(
  '/notifications/appstore',
  asyncHandler(async (req, res) => {
    const parsed = AppStoreNotificationBodySchema.safeParse(req.body)
    if (parsed.success) {
      const useCase = new HandleAppStoreNotificationUseCase(new AppleNotificationVerifier(), new SubscriptionRepo())
      await useCase.call(parsed.data.signedPayload)
    }
    res.status(200).send()
  })
)

SubscriptionController.get(
  '/entitlements',
  ...requiresAuthMiddleware,
  asyncHandler(async (req, res) => {
    const useCase = new GetEntitlementsUseCase(new SubscriptionRepo())
    const result = await useCase.call(req.currentUser!.id)
    res.sendData({ data: result })
  })
)

export default SubscriptionController
