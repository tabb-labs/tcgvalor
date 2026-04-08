import { z } from 'zod'

export type SubscriptionTier = 'PRO'

export type SubscriptionDto = {
  tier: SubscriptionTier
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  expiresAt: string | null
}

export const VerifyAppStoreBodySchema = z.object({
  signedTransaction: z.string().min(1),
})
