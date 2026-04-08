import { z } from 'zod'
import { SubscriptionTier } from '@prisma/client'
import { Result } from '@use-cases/Result'
import { SubscriptionDto } from '@core/network-types/subscription'
import { ISubscriptionRepo } from '../../repository/SubscriptionRepo'

const AppleTransactionPayloadSchema = z.object({
  originalTransactionId: z.string(),
  productId: z.string(),
  expiresDate: z.number().optional(),
})

type AppleTransactionPayload = z.infer<typeof AppleTransactionPayloadSchema>

const PRODUCT_TIER_MAP: Record<string, SubscriptionTier> = {
  'com.tcgvalor.pro.monthly': 'PRO',
}

export function decodeAppleTransactionPayload(jws: string): AppleTransactionPayload | null {
  const parts = jws.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf-8')
    const raw: unknown = JSON.parse(json)
    const parsed = AppleTransactionPayloadSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export interface IVerifyAppStorePurchaseUseCase {
  call: (userId: number, signedTransaction: string) => Promise<Result<SubscriptionDto>>
}

class VerifyAppStorePurchaseUseCase implements IVerifyAppStorePurchaseUseCase {
  private readonly subscriptionRepo: ISubscriptionRepo

  constructor(subscriptionRepo: ISubscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo
  }

  call = async (userId: number, signedTransaction: string): Promise<Result<SubscriptionDto>> => {
    const payload = decodeAppleTransactionPayload(signedTransaction)
    if (!payload) return Result.failure('Invalid transaction format')

    const tier = PRODUCT_TIER_MAP[payload.productId]
    if (!tier) return Result.failure(`Unknown product: ${payload.productId}`)

    const expiresAt = payload.expiresDate ? new Date(payload.expiresDate) : null
    const existing = await this.subscriptionRepo.findByAppleOriginalTransactionId(payload.originalTransactionId)

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
