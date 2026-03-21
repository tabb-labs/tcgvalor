import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prismaClient'
import { CollectionMetaDto, CollectionQueryParams } from '@core/network-types/collection'

export type UserCardWithBlueprint = Prisma.UserCardGetPayload<{
  include: { cardBlueprint: { include: { platformLinks: true; marketValue: true } } }
}>

export type CardBlueprintWithUserCards = Prisma.CardBlueprintGetPayload<{
  include: {
    platformLinks: true
    marketValue: true
    expansion: { include: { platformLinks: true } }
    userCards: true
  }
}>

export interface IUserCardRepo {
  listByExpansion: (userId: number, expansionId: number) => Promise<UserCardWithBlueprint[]>
  listAll: (userId: number) => Promise<{ card: UserCardWithBlueprint; expansionId: number }[]>
  listPaginated: (
    userId: number,
    params: CollectionQueryParams
  ) => Promise<{ blueprints: CardBlueprintWithUserCards[]; total: number }>
  getCollectionMeta: (userId: number) => Promise<CollectionMetaDto>
}

class UserCardRepo implements IUserCardRepo {
  listByExpansion = async (userId: number, cardTraderExpansionId: number): Promise<UserCardWithBlueprint[]> => {
    const expansionLink = await prisma.expansionPlatformLink.findFirst({
      where: { platform: 'CARD_TRADER', externalId: String(cardTraderExpansionId) },
      select: { expansionId: true },
    })

    if (!expansionLink) return []

    return prisma.userCard.findMany({
      where: { userId, cardBlueprint: { expansionId: expansionLink.expansionId } },
      include: {
        cardBlueprint: {
          include: { platformLinks: true, marketValue: true },
        },
      },
    })
  }

  listAll = async (userId: number): Promise<{ card: UserCardWithBlueprint; expansionId: number }[]> => {
    const userCards = await prisma.userCard.findMany({
      where: { userId },
      include: {
        cardBlueprint: {
          include: {
            platformLinks: true,
            marketValue: true,
            expansion: { include: { platformLinks: true } },
          },
        },
      },
    })

    return userCards.map((userCard) => {
      const expansionLink = userCard.cardBlueprint.expansion.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      const card: UserCardWithBlueprint = userCard
      return {
        card,
        expansionId: Number(expansionLink?.externalId ?? -1),
      }
    })
  }

  listPaginated = async (
    userId: number,
    params: CollectionQueryParams
  ): Promise<{ blueprints: CardBlueprintWithUserCards[]; total: number }> => {
    const { page, limit, search, sortBy, sortDir } = params

    const where: Prisma.CardBlueprintWhereInput = {
      userCards: { some: { userId } },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { expansion: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }

    const orderBy: Prisma.CardBlueprintOrderByWithRelationInput =
      sortBy === 'name' ? { name: sortDir } : { marketValue: { medianMarketValueCents: sortDir } }

    const [blueprints, total] = await Promise.all([
      prisma.cardBlueprint.findMany({
        where,
        include: {
          platformLinks: true,
          marketValue: true,
          expansion: { include: { platformLinks: true } },
          userCards: { where: { userId } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cardBlueprint.count({ where }),
    ])

    return { blueprints, total }
  }

  getCollectionMeta = async (userId: number): Promise<CollectionMetaDto> => {
    const [cardsInCollection, valueResult] = await Promise.all([
      prisma.userCard.count({ where: { userId } }),
      prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COALESCE(SUM(mv.median_market_value_cents), 0) AS total
        FROM user_card uc
        JOIN card_blueprint_market_value mv ON mv.card_blueprint_id = uc.card_blueprint_id
        WHERE uc.user_id = ${userId}
      `,
    ])

    return {
      cardsInCollection,
      medianMarketValueCents: Number(valueResult[0].total),
    }
  }
}

export default UserCardRepo
