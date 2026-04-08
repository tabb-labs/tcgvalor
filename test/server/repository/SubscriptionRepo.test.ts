/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('../../../prisma/prismaClient', () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

import { prisma } from '../../../prisma/prismaClient'
import SubscriptionRepo from '../../../src/server/repository/SubscriptionRepo'

const FIND_UNIQUE = prisma.subscription.findUnique as jest.Mock
const UPDATE = prisma.subscription.update as jest.Mock
const CREATE = prisma.subscription.create as jest.Mock
const FIND_FIRST = prisma.subscription.findFirst as jest.Mock

describe('SubscriptionRepo', () => {
  let repo: SubscriptionRepo

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new SubscriptionRepo()
  })

  describe('findByAppleOriginalTransactionId', () => {
    it('queries by apple original transaction id', async () => {
      FIND_UNIQUE.mockResolvedValue(null)

      await repo.findByAppleOriginalTransactionId('txn_123')

      expect(FIND_UNIQUE).toHaveBeenCalledWith({
        where: { appleOriginalTransactionId: 'txn_123' },
      })
    })

    it('returns the subscription when found', async () => {
      const sub = { id: 1, tier: 'PRO', status: 'ACTIVE' }
      FIND_UNIQUE.mockResolvedValue(sub)

      const result = await repo.findByAppleOriginalTransactionId('txn_123')

      expect(result).toEqual(sub)
    })

    it('returns null when not found', async () => {
      FIND_UNIQUE.mockResolvedValue(null)

      const result = await repo.findByAppleOriginalTransactionId('txn_123')

      expect(result).toBeNull()
    })
  })

  describe('activateExisting', () => {
    it('updates status to ACTIVE and sets expiresAt', async () => {
      const expiresAt = new Date('2026-05-01')
      UPDATE.mockResolvedValue({ id: 1, status: 'ACTIVE' })

      await repo.activateExisting(1, expiresAt)

      expect(UPDATE).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ACTIVE', expiresAt },
      })
    })

    it('accepts null expiresAt', async () => {
      UPDATE.mockResolvedValue({ id: 1, status: 'ACTIVE' })

      await repo.activateExisting(1, null)

      expect(UPDATE).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ACTIVE', expiresAt: null },
      })
    })
  })

  describe('createFromAppStore', () => {
    it('creates a subscription with the correct data', async () => {
      const expiresAt = new Date('2026-05-01')
      CREATE.mockResolvedValue({ id: 1 })

      await repo.createFromAppStore({
        userId: 42,
        tier: 'PRO',
        expiresAt,
        appleOriginalTransactionId: 'txn_123',
      })

      expect(CREATE).toHaveBeenCalledWith({
        data: {
          userId: 42,
          tier: 'PRO',
          status: 'ACTIVE',
          source: 'IOS_APPSTORE',
          expiresAt,
          appleOriginalTransactionId: 'txn_123',
        },
      })
    })
  })

  describe('findActiveForUser', () => {
    it('queries for the most recent active subscription', async () => {
      FIND_FIRST.mockResolvedValue(null)

      await repo.findActiveForUser(42)

      expect(FIND_FIRST).toHaveBeenCalledWith({
        where: { userId: 42, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('returns the active subscription when found', async () => {
      const sub = { id: 1, tier: 'PRO', status: 'ACTIVE' }
      FIND_FIRST.mockResolvedValue(sub)

      const result = await repo.findActiveForUser(42)

      expect(result).toEqual(sub)
    })

    it('returns null when the user has no active subscription', async () => {
      FIND_FIRST.mockResolvedValue(null)

      const result = await repo.findActiveForUser(42)

      expect(result).toBeNull()
    })
  })
})
