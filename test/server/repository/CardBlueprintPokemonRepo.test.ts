/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prisma } from '../../../prisma/prismaClient'
import CardBlueprintPokemonRepo, {
  CreateCardBlueprintPokemonEntity,
} from '../../../src/server/repository/CardBlueprintPokemonRepo'

jest.mock('../../../prisma/prismaClient', () => ({
  prisma: {
    cardBlueprint: { findFirst: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}))

const FIND_FIRST = prisma.cardBlueprint.findFirst as jest.Mock
const FIND_MANY = prisma.cardBlueprint.findMany as jest.Mock
const TRANSACTION = prisma.$transaction as jest.Mock

describe('CardBlueprintPokemonRepo', () => {
  let repo: CardBlueprintPokemonRepo

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new CardBlueprintPokemonRepo()
  })

  describe('find', () => {
    const CARD_TRADER_BLUEPRINT_ID = 100

    it('should return null when no blueprint is found', async () => {
      FIND_FIRST.mockResolvedValue(null)

      const result = await repo.find(CARD_TRADER_BLUEPRINT_ID)

      expect(result).toBeNull()
    })

    it('should return the raw blueprint when found', async () => {
      const blueprint = {
        id: 10,
        expansionId: 20,
        name: 'Charizard',
        collectorNumber: '4',
        imageShowUrl: 'show-url',
        imagePreviewUrl: 'preview-url',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        platformLinks: [{ platform: 'CARD_TRADER', externalId: String(CARD_TRADER_BLUEPRINT_ID) }],
        pokemonCardBlueprint: { rarity: 'Rare Holo' },
      }
      FIND_FIRST.mockResolvedValue(blueprint)

      const result = await repo.find(CARD_TRADER_BLUEPRINT_ID)

      expect(result).toEqual(blueprint)
    })

    it('should query cardBlueprint with CARD_TRADER platform link and includes', async () => {
      FIND_FIRST.mockResolvedValue(null)

      await repo.find(CARD_TRADER_BLUEPRINT_ID)

      expect(FIND_FIRST).toHaveBeenCalledWith({
        where: {
          platformLinks: {
            some: { platform: 'CARD_TRADER', externalId: String(CARD_TRADER_BLUEPRINT_ID) },
          },
        },
        include: {
          platformLinks: true,
          pokemonCardBlueprint: true,
        },
      })
    })
  })

  describe('listByExpansion', () => {
    const CARD_TRADER_EXPANSION_ID = 500

    it('should return empty array when no blueprints match', async () => {
      FIND_MANY.mockResolvedValue([])

      const result = await repo.listByExpansion(CARD_TRADER_EXPANSION_ID)

      expect(result).toEqual([])
    })

    it('should return blueprints when found', async () => {
      const blueprints = [
        {
          id: 1,
          expansionId: 7,
          name: 'Charizard',
          collectorNumber: '4',
          imageShowUrl: 'show-url',
          imagePreviewUrl: 'preview-url',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          platformLinks: [{ platform: 'CARD_TRADER', externalId: '999' }],
          pokemonCardBlueprint: { rarity: 'Rare Holo' },
        },
      ]
      FIND_MANY.mockResolvedValue(blueprints)

      const result = await repo.listByExpansion(CARD_TRADER_EXPANSION_ID)

      expect(result).toEqual(blueprints)
    })

    it('should query cardBlueprint via expansion platform link with includes', async () => {
      FIND_MANY.mockResolvedValue([])

      await repo.listByExpansion(CARD_TRADER_EXPANSION_ID)

      expect(FIND_MANY).toHaveBeenCalledWith({
        where: {
          expansion: {
            platformLinks: {
              some: { platform: 'CARD_TRADER', externalId: String(CARD_TRADER_EXPANSION_ID) },
            },
          },
        },
        include: {
          platformLinks: true,
          pokemonCardBlueprint: true,
        },
      })
    })
  })

  describe('searchByName', () => {
    it('should return empty array when no blueprints match', async () => {
      FIND_MANY.mockResolvedValue([])
      const result = await repo.searchByName('Pikachu')
      expect(result).toEqual([])
    })

    it('should return matched blueprints', async () => {
      const blueprints = [{ id: 1, name: 'Pikachu' }]
      FIND_MANY.mockResolvedValue(blueprints)
      const result = await repo.searchByName('Pikachu')
      expect(result).toEqual(blueprints)
    })

    it('should query with case-insensitive name contains and correct includes', async () => {
      FIND_MANY.mockResolvedValue([])
      await repo.searchByName('pikachu')
      expect(FIND_MANY).toHaveBeenCalledWith({
        where: { name: { contains: 'pikachu', mode: 'insensitive' } },
        include: {
          platformLinks: true,
          marketValue: true,
          expansion: { include: { platformLinks: true, pokemonExpansion: true } },
          userCards: { where: { userId: -1 } },
        },
        orderBy: { marketValue: { medianMarketValueCents: 'desc' } },
        take: 50,
      })
    })

    it('should filter userCards by userId when provided', async () => {
      FIND_MANY.mockResolvedValue([])
      await repo.searchByName('Pikachu', 99)
      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            userCards: { where: { userId: 99 } },
          }),
        })
      )
    })

    it('should filter userCards by -1 when userId is not provided', async () => {
      FIND_MANY.mockResolvedValue([])
      await repo.searchByName('Pikachu')
      expect(FIND_MANY).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            userCards: { where: { userId: -1 } },
          }),
        })
      )
    })
  })

  describe('create', () => {
    const entity: CreateCardBlueprintPokemonEntity = {
      expansionId: 5,
      cardTraderBlueprintId: 100,
      name: 'Pikachu',
      collectorNumber: '58',
      rarity: 'Common',
      imageShowUrl: 'show-url',
      imagePreviewUrl: 'preview-url',
    }

    const CARD_BLUEPRINT_ID = 42

    const mockTx = {
      cardBlueprint: { create: jest.fn() },
      cardBlueprintPokemon: { create: jest.fn() },
      cardBlueprintPlatformLink: { create: jest.fn() },
      cardBlueprintMarketValue: { create: jest.fn() },
    }

    beforeEach(() => {
      mockTx.cardBlueprint.create.mockResolvedValue({ id: CARD_BLUEPRINT_ID })
      TRANSACTION.mockImplementation((fn: any) => fn(mockTx))
    })

    it('should return the created card blueprint id', async () => {
      const result = await repo.create(entity)

      expect(result).toBe(CARD_BLUEPRINT_ID)
    })

    it('should create a card blueprint with the correct data', async () => {
      await repo.create(entity)

      expect(mockTx.cardBlueprint.create).toHaveBeenCalledWith({
        data: {
          expansionId: entity.expansionId,
          name: entity.name,
          collectorNumber: entity.collectorNumber,
          imageShowUrl: entity.imageShowUrl,
          imagePreviewUrl: entity.imagePreviewUrl,
        },
      })
    })

    it('should create a pokemon blueprint with the new blueprint id and rarity', async () => {
      await repo.create(entity)

      expect(mockTx.cardBlueprintPokemon.create).toHaveBeenCalledWith({
        data: {
          cardBlueprintId: CARD_BLUEPRINT_ID,
          rarity: entity.rarity,
        },
      })
    })

    it('should create a platform link with CARD_TRADER platform and stringified blueprint id', async () => {
      await repo.create(entity)

      expect(mockTx.cardBlueprintPlatformLink.create).toHaveBeenCalledWith({
        data: {
          cardBlueprintId: CARD_BLUEPRINT_ID,
          platform: 'CARD_TRADER',
          externalId: String(entity.cardTraderBlueprintId),
        },
      })
    })
  })
})
