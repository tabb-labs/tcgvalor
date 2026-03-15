import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prismaClient'

export type UserCardWithBlueprint = Prisma.UserCardGetPayload<{
  include: { cardBlueprint: { include: { platformLinks: true } } }
}>

export interface IUserCardRepo {
  listByExpansion: (userId: number, expansionId: number) => Promise<UserCardWithBlueprint[]>
  listAll: (userId: number) => Promise<{ card: UserCardWithBlueprint; expansionId: number }[]>
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
          include: { platformLinks: true },
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
}

export default UserCardRepo
