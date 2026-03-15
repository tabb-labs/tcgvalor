import { ENV } from '../../env'
import { z } from 'zod'

const CARD_TRADER = ENV.CARD_TRADER

const CardTraderBlueprintSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    version: z.string().nullish(),
    game_id: z.number(),
    category_id: z.number(),
    expansion_id: z.number(),
    fixed_properties: z
      .object({
        collector_number: z.string().optional().default(''),
        pokemon_rarity: z.string().optional().default(''),
      })
      .optional(),
    image: z
      .object({
        show: z.object({ url: z.string() }).optional(),
        preview: z.object({ url: z.string() }).optional(),
      })
      .optional(),
  })
  .transform((parsed) => ({
    id: parsed.id,
    name: parsed.name,
    version: parsed.version ?? null,
    gameId: parsed.game_id,
    categoryId: parsed.category_id,
    expansionId: parsed.expansion_id,
    fixedProperties: {
      collectorNumber: parsed.fixed_properties?.collector_number ?? '',
      pokemonRarity: parsed.fixed_properties?.pokemon_rarity ?? '',
    },
    image: {
      show: { url: parsed.image?.show?.url ? `${CARD_TRADER.CARD_TRADER_BASE_URL}${parsed.image.show.url}` : '' },
      preview: {
        url: parsed.image?.preview?.url ? `${CARD_TRADER.CARD_TRADER_BASE_URL}${parsed.image.preview.url}` : '',
      },
    },
  }))

export type CardTraderBlueprintDto = z.infer<typeof CardTraderBlueprintSchema>

export const tryToParseBlueprints = (data: unknown): CardTraderBlueprintDto[] =>
  z.array(CardTraderBlueprintSchema).parse(data)
