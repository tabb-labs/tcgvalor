import { prisma } from '../../../prisma/prismaClient'
import { BlueprintValue } from '../types/BlueprintValue'

export interface ICardBlueprintMarketValueRepo {
  upsertMany: (values: { cardBlueprintId: number; blueprintValue: BlueprintValue }[]) => Promise<void>
  expansionHasPrices: (cardTraderExpansionId: number) => Promise<boolean>
}

class CardBlueprintMarketValueRepo implements ICardBlueprintMarketValueRepo {
  upsertMany = async (values: { cardBlueprintId: number; blueprintValue: BlueprintValue }[]): Promise<void> => {
    const now = new Date()
    await Promise.all(
      values.map(({ cardBlueprintId, blueprintValue }) =>
        prisma.cardBlueprintMarketValue.upsert({
          where: { cardBlueprintId },
          create: {
            cardBlueprintId,
            medianMarketValueCents: blueprintValue.medianCents,
            listingCount: blueprintValue.listingCount,
            fetchedAt: now,
          },
          update: {
            medianMarketValueCents: blueprintValue.medianCents,
            listingCount: blueprintValue.listingCount,
            fetchedAt: now,
          },
        })
      )
    )
  }

  expansionHasPrices = async (cardTraderExpansionId: number): Promise<boolean> => {
    const row = await prisma.cardBlueprintMarketValue.findFirst({
      where: {
        cardBlueprint: {
          expansion: {
            platformLinks: {
              some: { platform: 'CARD_TRADER', externalId: String(cardTraderExpansionId) },
            },
          },
        },
      },
      select: { id: true },
    })
    return row !== null
  }
}

export default CardBlueprintMarketValueRepo
