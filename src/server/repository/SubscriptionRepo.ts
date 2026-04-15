import { Subscription, SubscriptionTier } from '@prisma/client'
import { prisma } from '../../../prisma/prismaClient'

export interface ISubscriptionRepo {
  findByAppleOriginalTransactionId: (id: string) => Promise<Subscription | null>
  activateExisting: (id: number, expiresAt: Date | null) => Promise<Subscription>
  deactivate: (id: number, status: 'EXPIRED' | 'CANCELLED') => Promise<Subscription>
  createFromAppStore: (params: {
    userId: number
    tier: SubscriptionTier
    expiresAt: Date | null
    appleOriginalTransactionId: string
  }) => Promise<Subscription>
  findActiveForUser: (userId: number) => Promise<Subscription | null>
}

class SubscriptionRepo implements ISubscriptionRepo {
  findByAppleOriginalTransactionId = (id: string) =>
    prisma.subscription.findUnique({ where: { appleOriginalTransactionId: id } })

  activateExisting = (id: number, expiresAt: Date | null) =>
    prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE', expiresAt },
    })

  deactivate = (id: number, status: 'EXPIRED' | 'CANCELLED') =>
    prisma.subscription.update({
      where: { id },
      data: { status },
    })

  createFromAppStore = ({
    userId,
    tier,
    expiresAt,
    appleOriginalTransactionId,
  }: {
    userId: number
    tier: SubscriptionTier
    expiresAt: Date | null
    appleOriginalTransactionId: string
  }) =>
    prisma.subscription.create({
      data: {
        userId,
        tier,
        status: 'ACTIVE',
        source: 'IOS_APPSTORE',
        expiresAt,
        appleOriginalTransactionId,
      },
    })

  findActiveForUser = (userId: number) =>
    prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    })
}

export default SubscriptionRepo
