import { SubscriptionTier } from '@prisma/client'
import { Result } from '@use-cases/Result'
import { SubscriptionDto } from '@core/network-types/subscription'
import { ISubscriptionRepo } from '../../repository/SubscriptionRepo'
import { IAppleTransactionVerifier } from '../../clients/Apple/AppleTransactionVerifier'

const PRODUCT_TIER_MAP: Record<string, SubscriptionTier> = {
  'com.tcgvalor.pro.monthly': 'PRO',
}

class VerifyAppStorePurchaseUseCase {
  private readonly subscriptionRepo: ISubscriptionRepo
  private readonly appleVerifier: IAppleTransactionVerifier

  constructor(subscriptionRepo: ISubscriptionRepo, appleVerifier: IAppleTransactionVerifier) {
    this.subscriptionRepo = subscriptionRepo
    this.appleVerifier = appleVerifier
  }

  call = async (userId: number, signedTransaction: string): Promise<Result<SubscriptionDto>> => {
    const payload = await this.appleVerifier.verify(signedTransaction)
    if (!payload) return Result.failure('Invalid transaction')

    const tier = PRODUCT_TIER_MAP[payload.productId]
    if (!tier) return Result.failure(`Unknown product: ${payload.productId}`)

    const expiresAt = payload.expiresDate ? new Date(payload.expiresDate) : null
    const existing = await this.subscriptionRepo.findByAppleOriginalTransactionId(payload.originalTransactionId)

    if (existing && existing.userId !== userId) {
      return Result.failure('Transaction does not belong to this user')
    }

    const subscription = existing
      ? await this.subscriptionRepo.activateExisting(existing.id, expiresAt)
      : await this.subscriptionRepo.createFromAppStore({
          userId,
          tier,
          expiresAt,
          appleOriginalTransactionId: payload.originalTransactionId,
        })

    return Result.success({
      tier: subscription.tier,
      status: subscription.status,
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
    })
  }
}

export default VerifyAppStorePurchaseUseCase
