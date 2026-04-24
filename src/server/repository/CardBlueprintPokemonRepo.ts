import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prismaClient'

export type PokemonCardBlueprint = Prisma.CardBlueprintGetPayload<{
  include: { platformLinks: true; pokemonCardBlueprint: true }
}>

export type CardBlueprintWithExpansionAndValue = Prisma.CardBlueprintGetPayload<{
  include: {
    platformLinks: true
    marketValue: true
    expansion: { include: { platformLinks: true; pokemonExpansion: true } }
    userCards: true
  }
}>

export type CreateCardBlueprintPokemonEntity = {
  expansionId: number
  cardTraderBlueprintId: number
  name: string
  collectorNumber: string
  rarity: string
  imageShowUrl: string
  imagePreviewUrl: string
}

export interface ICardBlueprintPokemonRepo {
  find: (cardTraderBlueprintId: number) => Promise<PokemonCardBlueprint | null>
  listByExpansion: (cardTraderExpansionId: number) => Promise<PokemonCardBlueprint[]>
  searchByName: (name: string, userId?: number) => Promise<CardBlueprintWithExpansionAndValue[]>
  create: (entity: CreateCardBlueprintPokemonEntity) => Promise<number>
}

class CardBlueprintPokemonRepo implements ICardBlueprintPokemonRepo {
  find = (cardTraderBlueprintId: number): Promise<PokemonCardBlueprint | null> => {
    return prisma.cardBlueprint.findFirst({
      where: {
        platformLinks: {
          some: { platform: 'CARD_TRADER', externalId: String(cardTraderBlueprintId) },
        },
      },
      include: {
        platformLinks: true,
        pokemonCardBlueprint: true,
      },
    })
  }

  listByExpansion = (cardTraderExpansionId: number): Promise<PokemonCardBlueprint[]> => {
    return prisma.cardBlueprint.findMany({
      where: {
        expansion: {
          platformLinks: {
            some: { platform: 'CARD_TRADER', externalId: String(cardTraderExpansionId) },
          },
        },
      },
      include: {
        platformLinks: true,
        pokemonCardBlueprint: true,
      },
    })
  }

  searchByName = (name: string, userId?: number): Promise<CardBlueprintWithExpansionAndValue[]> => {
    return prisma.cardBlueprint.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      include: {
        platformLinks: true,
        marketValue: true,
        expansion: { include: { platformLinks: true, pokemonExpansion: true } },
        userCards: { where: { userId: userId ?? -1 } },
      },
      orderBy: { marketValue: { medianMarketValueCents: 'desc' } },
      take: 50,
    })
  }

  create = (entity: CreateCardBlueprintPokemonEntity): Promise<number> => {
    return prisma.$transaction(async (tx) => {
      const cardBlueprint = await tx.cardBlueprint.create({
        data: {
          expansionId: entity.expansionId,
          name: entity.name,
          collectorNumber: entity.collectorNumber,
          imageShowUrl: entity.imageShowUrl,
          imagePreviewUrl: entity.imagePreviewUrl,
        },
      })

      await tx.cardBlueprintPokemon.create({
        data: {
          cardBlueprintId: cardBlueprint.id,
          rarity: entity.rarity,
        },
      })

      await tx.cardBlueprintPlatformLink.create({
        data: {
          cardBlueprintId: cardBlueprint.id,
          platform: 'CARD_TRADER',
          externalId: String(entity.cardTraderBlueprintId),
        },
      })

      await tx.cardBlueprintMarketValue.create({
        data: {
          cardBlueprintId: cardBlueprint.id,
          medianMarketValueCents: 0,
          listingCount: 0,
          fetchedAt: new Date(),
        },
      })

      return cardBlueprint.id
    })
  }
}

export default CardBlueprintPokemonRepo
