import { ENV } from '../../env'
import { CardBlueprint } from '../../types/CardBlueprint'
import { CardExpansion } from '../../types/CardExpansion'
import { CardValue } from '../../types/CardValue'
import { tryToParseBlueprints } from './parseBlueprints'
import { tryToParseExpansions } from './parseExpansions'
import { tryToParseMarketplaceProducts } from './parseMarketplaceProducts'
import { EXCLUDED_EXPANSION_IDS } from './excludedExpansionIds'

const CARD_TRADER = ENV.CARD_TRADER

const clientFetch = async <T>(path: string, parser: (data: unknown) => T) => {
  const response = await fetch(`${CARD_TRADER.CARD_TRADER_API_URL}${path}`, {
    headers: { Authorization: CARD_TRADER.CARD_TRADER_API_KEY() },
  })
  const data = (await response.json()) as unknown
  return parser(data)
}

export const getExpansions = () => clientFetch('/expansions', tryToParseExpansions)

export const getBlueprints = (expansionId: number) =>
  clientFetch(`/blueprints/export?expansion_id=${expansionId}`, tryToParseBlueprints)

export const getMarketplaceProducts = (expansionId: number) =>
  clientFetch(`/marketplace/products?expansion_id=${expansionId}`, tryToParseMarketplaceProducts)

export interface ICardTraderClient {
  getPokemonExpansions: () => Promise<CardExpansion[]>
  getPokemonBlueprints: (expansionId: number) => Promise<CardBlueprint[]>
  getPokemonCardValues: (expansionId: number) => Promise<Map<string, CardValue[]>>
}

class CardTraderClient implements ICardTraderClient {
  getPokemonExpansions = async (): Promise<CardExpansion[]> => {
    const expansions = await getExpansions()
    return expansions
      .filter((e) => e.gameId === CARD_TRADER.POKEMON_GAME_ID && !EXCLUDED_EXPANSION_IDS.includes(e.id))
      .map((e) => ({ expansionId: e.id, name: e.name }))
  }

  getPokemonBlueprints = async (expansionId: number): Promise<CardBlueprint[]> => {
    const blueprints = await getBlueprints(expansionId)
    return blueprints
      .filter((b) => b.categoryId === CARD_TRADER.POKEMON_SINGLE_CARD_CATEGORY)
      .map((b) => ({
        blueprintId: b.id,
        expansionId: b.expansionId,
        name: b.name,
        version: b.version || '',
        collectorNumber: b.fixedProperties.collectorNumber,
        pokemonRarity: b.fixedProperties.pokemonRarity,
        imageUrlPreview: `${CARD_TRADER.CARD_TRADER_BASE_URL}${b.image.preview.url}`,
        imageUrlShow: `${CARD_TRADER.CARD_TRADER_BASE_URL}${b.image.show.url}`,
      }))
  }

  getPokemonCardValues = async (expansionId: number): Promise<Map<string, CardValue[]>> => {
    const productsMap = await getMarketplaceProducts(expansionId)
    const result = new Map<string, CardValue[]>()
    productsMap.forEach((value, key) => {
      result.set(
        key,
        value.map((v) => ({
          blueprintId: v.blueprintId,
          priceCents: v.price.cents,
          condition: v.propertiesHash.condition ?? '',
        }))
      )
    })
    return result
  }
}

export default CardTraderClient
