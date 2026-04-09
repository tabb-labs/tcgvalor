export type SubscriptionTier = 'PRO'

export type SubscriptionDto = {
  tier: SubscriptionTier
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  expiresAt: string | null
}
