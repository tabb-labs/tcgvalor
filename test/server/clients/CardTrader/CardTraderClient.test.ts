import CardTraderClient from '../../../../src/server/clients/CardTrader/CardTraderClient'
import * as CardTraderClientModule from '../../../../src/server/clients/CardTrader/CardTraderClient'
import { CardTraderBlueprintDto } from '../../../../src/server/clients/CardTrader/parseBlueprints'
import { CardTraderExpansionDto } from '../../../../src/server/clients/CardTrader/parseExpansions'
import { CardTraderMarketplaceProductDto } from '../../../../src/server/clients/CardTrader/parseMarketplaceProducts'
import { ENV } from '../../../../src/server/env'
import { makeBlueprintDto } from './__MOCKS__/CardTraderBlueprintDto.mock'
import { makeMarketplaceProductDto } from './__MOCKS__/CardTraderMarketplaceProductDto.mock'

const GET_EXPANSIONS = jest.spyOn(CardTraderClientModule, 'getExpansions')
const GET_BLUEPRINTS = jest.spyOn(CardTraderClientModule, 'getBlueprints')
const GET_MARKETPLACE_PRODUCTS = jest.spyOn(CardTraderClientModule, 'getMarketplaceProducts')

const POKEMON_GAME_ID = ENV.CARD_TRADER.POKEMON_GAME_ID
const POKEMON_SINGLE_CARD_CATEGORY = ENV.CARD_TRADER.POKEMON_SINGLE_CARD_CATEGORY
const CARD_TRADER_BASE_URL = ENV.CARD_TRADER.CARD_TRADER_BASE_URL

const cardTraderClient = new CardTraderClient()

beforeEach(jest.clearAllMocks)

describe('Card Trader Client', () => {
  describe('Get Pokemon Expansions', () => {
    it('return empty array when given empty array', async () => {
      const expansionDto: CardTraderExpansionDto[] = []
      GET_EXPANSIONS.mockResolvedValue(expansionDto)
      const result = await cardTraderClient.getPokemonExpansions()
      expect(result.length).toEqual(0)
    })
    it('formats pokemon expansion object correctly', async () => {
      const Id = 1234
      const NAME = 'Jungle'
      const expansionDto: CardTraderExpansionDto[] = [{ code: 'Code', id: Id, name: NAME, gameId: POKEMON_GAME_ID }]
      GET_EXPANSIONS.mockResolvedValue(expansionDto)
      const result = await cardTraderClient.getPokemonExpansions()
      expect(result.length).toEqual(1)
      expect(result[0].expansionId).toEqual(Id)
      expect(result[0].name).toEqual(NAME)
    })
    it('filters out none pokemon expansion items', async () => {
      const expansionDto: CardTraderExpansionDto[] = [
        { code: '', id: 0, name: '', gameId: POKEMON_GAME_ID },
        { code: '', id: 0, name: '', gameId: 1 },
        { code: '', id: 0, name: '', gameId: POKEMON_GAME_ID },
        { code: '', id: 0, name: '', gameId: 2 },
        { code: '', id: 0, name: '', gameId: POKEMON_GAME_ID },
        { code: '', id: 0, name: '', gameId: 6 },
      ]
      GET_EXPANSIONS.mockResolvedValue(expansionDto)
      const result = await cardTraderClient.getPokemonExpansions()
      expect(result.length).toEqual(3)
    })
  })

  describe('Get Pokemon Blueprints', () => {
    it('return empty array when given empty array', async () => {
      const blueprintDto: CardTraderBlueprintDto[] = []
      const id = 3
      GET_BLUEPRINTS.mockResolvedValue(blueprintDto)
      const result = await cardTraderClient.getPokemonBlueprints(id)
      expect(result.length).toEqual(0)
      expect(GET_BLUEPRINTS).toHaveBeenCalledWith(id)
    })

    it('formats blueprint object correctly', async () => {
      const id = 25
      const name = 'Any name'
      const version = '1/122'
      const imageUrlPreview = '/uploads/blueprints/image/111148/preview_alakazam-rare-holo-1-102-base-set.jpg'
      const imageUrlShow = '/uploads/blueprints/image/111148/show_alakazam-rare-holo-1-102-base-set.jpg'
      const blueprintDto: CardTraderBlueprintDto[] = [
        makeBlueprintDto({
          id,
          name,
          version,
          image: { show: { url: imageUrlShow }, preview: { url: imageUrlPreview } },
          categoryId: POKEMON_SINGLE_CARD_CATEGORY,
        }),
      ]

      GET_BLUEPRINTS.mockResolvedValue(blueprintDto)
      const result = await cardTraderClient.getPokemonBlueprints(3)
      expect(result[0].blueprintId).toEqual(id)
      expect(result[0].name).toEqual(name)
      expect(result[0].version).toEqual(version)
      expect(result[0].imageUrlPreview).toEqual(`${CARD_TRADER_BASE_URL}${imageUrlPreview}`)
      expect(result[0].imageUrlShow).toEqual(`${CARD_TRADER_BASE_URL}${imageUrlShow}`)
    })

    it('filters out none single pokemon items', async () => {
      const blueprintDto: CardTraderBlueprintDto[] = [
        makeBlueprintDto({ categoryId: 1 }),
        makeBlueprintDto({ categoryId: POKEMON_SINGLE_CARD_CATEGORY }),
        makeBlueprintDto({ categoryId: 3 }),
        makeBlueprintDto({ categoryId: POKEMON_SINGLE_CARD_CATEGORY }),
        makeBlueprintDto({ categoryId: 5 }),
        makeBlueprintDto({ categoryId: POKEMON_SINGLE_CARD_CATEGORY }),
      ]

      GET_BLUEPRINTS.mockResolvedValue(blueprintDto)
      const result = await cardTraderClient.getPokemonBlueprints(3)
      expect(result.length).toEqual(3)
    })
  })

  describe('Get Pokemon Card Values', () => {
    it('should port card trader market place products map to card value map', async () => {
      const product1a = makeMarketplaceProductDto({
        blueprintId: 1,
        price: { cents: 1 },
        propertiesHash: { condition: 'good' },
      })

      const product1b = makeMarketplaceProductDto({
        blueprintId: 1,
        price: { cents: 2 },
        propertiesHash: { condition: 'Mint' },
      })

      const product1c = makeMarketplaceProductDto({
        blueprintId: 1,
        price: { cents: 3 },
      })

      const product2a = makeMarketplaceProductDto({
        blueprintId: 2,
        price: { cents: 4 },
        propertiesHash: { condition: 'Poor' },
      })
      const productsMap = new Map<string, CardTraderMarketplaceProductDto[]>([
        ['1', [product1a, product1b, product1c]],
        ['2', [product2a]],
      ])
      GET_MARKETPLACE_PRODUCTS.mockResolvedValue(productsMap)

      const result = await cardTraderClient.getPokemonCardValues(2)

      expect(result.size).toEqual(2)
      expect(result.get('1')!.length).toEqual(3)

      expect(result.get('1')![1].blueprintId).toEqual(1)
      expect(result.get('1')![1].priceCents).toEqual(2)
      expect(result.get('1')![1].condition).toEqual('Mint')
    })
  })
})
