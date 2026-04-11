export type SubscriptionTier = 'PRO'

export type SubscriptionDto = {
  tier: SubscriptionTier
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  expiresAt: string | null
}

export type EntitlementDto = {
  isActive: boolean
  cardLimit: number | null
}
