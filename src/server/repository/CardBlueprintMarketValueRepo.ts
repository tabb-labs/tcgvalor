import { prisma } from '../../../prisma/prismaClient'

export type MarketValueEntry = {
  cardBlueprintId: number
  medianCents: number
  listingCount: number
}

export interface ICardBlueprintMarketValueRepo {
  upsertMany: (values: MarketValueEntry[]) => Promise<void>
  expansionHasPrices: (cardTraderExpansionId: number) => Promise<boolean>
  findAllByExpansion: (cardTraderExpansionId: number) => Promise<MarketValueEntry[]>
  listOwnedCardTraderExpansionIds: () => Promise<number[]>
  getLatestFetchedAt: () => Promise<Date | null>
}

class CardBlueprintMarketValueRepo implements ICardBlueprintMarketValueRepo {
  upsertMany = async (values: MarketValueEntry[]): Promise<void> => {
    const now = new Date()
    await Promise.all(
      values.map(({ cardBlueprintId, medianCents, listingCount }) =>
        prisma.cardBlueprintMarketValue.upsert({
          where: { cardBlueprintId },
          create: {
            cardBlueprintId,
            medianMarketValueCents: medianCents,
            listingCount,
            fetchedAt: now,
          },
          update: {
            medianMarketValueCents: medianCents,
            listingCount,
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

  listOwnedCardTraderExpansionIds = async (): Promise<number[]> => {
    const links = await prisma.expansionPlatformLink.findMany({
      where: {
        platform: 'CARD_TRADER',
        expansion: {
          cardBlueprints: {
            some: { userCards: { some: {} } },
          },
        },
      },
      select: { externalId: true },
      distinct: ['externalId'],
    })
    return links.map((l) => Number(l.externalId))
  }

  getLatestFetchedAt = async (): Promise<Date | null> => {
    const row = await prisma.cardBlueprintMarketValue.findFirst({
      orderBy: { fetchedAt: 'desc' },
      select: { fetchedAt: true },
    })
    return row?.fetchedAt ?? null
  }

  findAllByExpansion = async (cardTraderExpansionId: number): Promise<MarketValueEntry[]> => {
    const rows = await prisma.cardBlueprintMarketValue.findMany({
      where: {
        cardBlueprint: {
          expansion: {
            platformLinks: {
              some: { platform: 'CARD_TRADER', externalId: String(cardTraderExpansionId) },
            },
          },
        },
      },
      select: {
        cardBlueprintId: true,
        medianMarketValueCents: true,
        listingCount: true,
      },
    })

    return rows.map((row) => ({
      cardBlueprintId: row.cardBlueprintId,
      medianCents: row.medianMarketValueCents,
      listingCount: row.listingCount,
    }))
  }
}

export default CardBlueprintMarketValueRepo
