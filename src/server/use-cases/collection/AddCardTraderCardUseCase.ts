import { CardCondition, PrismaClient } from '@prisma/client'
import { ICardTraderClient } from '../../clients/CardTrader/CardTraderClient'
import { IExpansionPokemonRepo } from '../../repository/ExpansionPokemonRepo'
import { ICardBlueprintPokemonRepo } from '../../repository/CardBlueprintPokemonRepo'
import { CardBlueprint } from '../../types/CardBlueprint'
import Logger from '../../logger'
import { Result } from '@use-cases/Result'

export interface IAddCardTraderCardUseCase {
  call: (
    userId: number,
    cardTraderBlueprintId: number,
    cardTraderExpansionId: number,
    condition: CardCondition
  ) => Promise<Result<boolean>>
}

class AddCardTraderCardUseCase implements IAddCardTraderCardUseCase {
  private readonly prisma: PrismaClient
  private readonly cardTraderClient: ICardTraderClient
  private readonly expansionPokemonRepo: IExpansionPokemonRepo
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo

  constructor(
    prisma: PrismaClient,
    cardTraderClient: ICardTraderClient,
    expansionPokemonRepo: IExpansionPokemonRepo,
    cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo
  ) {
    this.prisma = prisma
    this.cardTraderClient = cardTraderClient
    this.expansionPokemonRepo = expansionPokemonRepo
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
  }

  call = async (
    userId: number,
    cardTraderBlueprintId: number,
    cardTraderExpansionId: number,
    condition: CardCondition
  ) => {
    const expansionId = await this.ensureExpansionExists(cardTraderExpansionId)
    const cardBlueprintId = await this.ensureBlueprintExists(expansionId, cardTraderExpansionId, cardTraderBlueprintId)

    await this.prisma.userCard.create({
      data: {
        userId,
        cardBlueprintId,
        condition,
      },
    })
    return Result.success(true)
  }

  private ensureExpansionExists = async (cardTraderExpansionId: number): Promise<number> => {
    const existing = await this.expansionPokemonRepo.find(cardTraderExpansionId)

    if (existing) return existing.id

    const expansionName = await this.fetchExpansionName(cardTraderExpansionId)

    return await this.expansionPokemonRepo.create({
      cardTraderExpansionId,
      name: expansionName,
      abbreviation: '',
      series: '',
      expansionType: '',
      expansionNumberInSeries: 0,
      numberOfCards: 0,
      numberOfSecretCards: 0,
      releaseDate: new Date(0),
      symbolUrl: null,
      logoUrl: null,
      bulbapediaUrl: '',
    })
  }

  private fetchExpansionName = async (cardTraderExpansionId: number): Promise<string> => {
    const expansions = await this.cardTraderClient.getPokemonExpansions()
    const match = expansions.find((e) => e.expansionId === cardTraderExpansionId)
    return match?.name ?? ''
  }

  private ensureBlueprintExists = async (
    expansionId: number,
    cardTraderExpansionId: number,
    cardTraderBlueprintId: number
  ): Promise<number> => {
    const existing = await this.cardBlueprintPokemonRepo.find(cardTraderBlueprintId)
    if (existing) return existing.id

    const allBlueprints = await this.cardTraderClient.getPokemonBlueprints(cardTraderExpansionId)
    const target = allBlueprints.find((b) => b.blueprintId === cardTraderBlueprintId)

    if (!target) {
      const err = new Error(`Blueprint ${cardTraderBlueprintId} not found in expansion ${cardTraderExpansionId}`)
      Logger.error(err)
      throw err
    }

    const cardBlueprintId = await this.cardBlueprintPokemonRepo.create({
      expansionId,
      cardTraderBlueprintId: target.blueprintId,
      name: target.name,
      collectorNumber: target.collectorNumber,
      rarity: target.pokemonRarity,
      imageShowUrl: target.imageUrlShow,
      imagePreviewUrl: target.imageUrlPreview,
    })

    this.backfillRemainingBlueprints(expansionId, allBlueprints, cardTraderBlueprintId).catch((e) => {
      Logger.error(new Error(`Failed to backfill blueprints for expansion ${cardTraderExpansionId}: ${e}`))
    })

    return cardBlueprintId
  }

  private backfillRemainingBlueprints = async (
    expansionId: number,
    allBlueprints: CardBlueprint[],
    excludeBlueprintId: number
  ) => {
    const remaining = allBlueprints.filter((b) => b.blueprintId !== excludeBlueprintId)

    for (const blueprint of remaining) {
      const existing = await this.cardBlueprintPokemonRepo.find(blueprint.blueprintId)
      if (existing) continue

      await this.cardBlueprintPokemonRepo.create({
        expansionId,
        cardTraderBlueprintId: blueprint.blueprintId,
        name: blueprint.name,
        collectorNumber: blueprint.collectorNumber,
        rarity: blueprint.pokemonRarity,
        imageShowUrl: blueprint.imageUrlShow,
        imagePreviewUrl: blueprint.imageUrlPreview,
      })
    }
  }
}

export default AddCardTraderCardUseCase
