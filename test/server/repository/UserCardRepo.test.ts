/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

jest.mock('../../../prisma/prismaClient', () => ({
  prisma: {
    cardBlueprint: { findMany: jest.fn(), count: jest.fn() },
    userCard: { count: jest.fn() },
    $queryRaw: jest.fn(),
  },
}))

import { prisma } from '../../../prisma/prismaClient'
import UserCardRepo from '../../../src/server/repository/UserCardRepo'
import { COLLECTION_QUERY_PARAMS } from '../../core/__MOCKS__/collection.mock'

const FIND_MANY = prisma.cardBlueprint.findMany as jest.Mock
const COUNT_BLUEPRINTS = prisma.cardBlueprint.count as jest.Mock
const COUNT_USER_CARDS = prisma.userCard.count as jest.Mock
const QUERY_RAW = prisma.$queryRaw as jest.Mock

describe('UserCardRepo', () => {
  let repo: UserCardRepo

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new UserCardRepo()
  })

  describe('listPaginated', () => {
    it('should return blueprints and total', async () => {
      FIND_MANY.mockResolvedValue([{ id: 1 }])
      COUNT_BLUEPRINTS.mockResolvedValue(5)

      const result = await repo.listPaginated(1, COLLECTION_QUERY_PARAMS)

      expect(result).toEqual({ blueprints: [{ id: 1 }], total: 5 })
    })

    it('should apply pagination skip and take', async () => {
      FIND_MANY.mockResolvedValue([])
      COUNT_BLUEPRINTS.mockResolvedValue(0)

      const params = { ...COLLECTION_QUERY_PARAMS, page: 2, limit: 10 }
      await repo.listPaginated(1, params)

      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })

    it('should apply search filter as OR on name and expansion name', async () => {
      FIND_MANY.mockResolvedValue([])
      COUNT_BLUEPRINTS.mockResolvedValue(0)

      const params = { ...COLLECTION_QUERY_PARAMS, search: 'pikachu' }
      await repo.listPaginated(1, params)

      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'pikachu', mode: 'insensitive' } },
              { expansion: { name: { contains: 'pikachu', mode: 'insensitive' } } },
            ],
          }),
        })
      )
    })

    it('should not apply search filter when search is undefined', async () => {
      FIND_MANY.mockResolvedValue([])
      COUNT_BLUEPRINTS.mockResolvedValue(0)

      const params = { ...COLLECTION_QUERY_PARAMS, search: undefined }
      await repo.listPaginated(1, params)

      const calledWith = FIND_MANY.mock.calls[0][0]
      expect(calledWith.where).not.toHaveProperty('OR')
    })

    it('should order by price when sortBy is price', async () => {
      FIND_MANY.mockResolvedValue([])
      COUNT_BLUEPRINTS.mockResolvedValue(0)

      const params = { ...COLLECTION_QUERY_PARAMS, sortBy: 'price' as const, sortDir: 'desc' as const }
      await repo.listPaginated(1, params)

      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { marketValue: { medianMarketValueCents: 'desc' } },
        })
      )
    })

    it('should order by name when sortBy is name', async () => {
      FIND_MANY.mockResolvedValue([])
      COUNT_BLUEPRINTS.mockResolvedValue(0)

      const params = { ...COLLECTION_QUERY_PARAMS, sortBy: 'name' as const, sortDir: 'asc' as const }
      await repo.listPaginated(1, params)

      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      )
    })
  })

  describe('getCollectionMeta', () => {
    it('should return cards in collection count and market value', async () => {
      COUNT_USER_CARDS.mockResolvedValue(5)
      QUERY_RAW.mockResolvedValue([{ total: BigInt(10000) }])

      const result = await repo.getCollectionMeta(1)

      expect(result).toEqual({ cardsInCollection: 5, medianMarketValueCents: 10000 })
    })

    it('should handle zero market value', async () => {
      COUNT_USER_CARDS.mockResolvedValue(0)
      QUERY_RAW.mockResolvedValue([{ total: BigInt(0) }])

      const result = await repo.getCollectionMeta(1)

      expect(result.medianMarketValueCents).toBe(0)
    })
  })
})
