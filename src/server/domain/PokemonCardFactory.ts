import { ICardTraderClient } from '../clients/CardTrader/CardTraderClient'
import { ICardBlueprintPokemonRepo } from '../repository/CardBlueprintPokemonRepo'
import { BlueprintValue } from '../types/BlueprintValue'
import PokemonCard from './PokemonCard'

export interface IPokemonCardFactory {
  makeList: (cardTraderExpansionId: number) => Promise<PokemonCard[]>
}

class PokemonCardFactory implements IPokemonCardFactory {
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo
  private readonly cardTraderClient: ICardTraderClient
  private readonly blueprintValues: Map<string, BlueprintValue>

  constructor(
    cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo,
    cardTraderClient: ICardTraderClient,
    blueprintValues: Map<string, BlueprintValue>
  ) {
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
    this.cardTraderClient = cardTraderClient
    this.blueprintValues = blueprintValues
  }

  makeList = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const postgresCards = await this.fromPostgres(cardTraderExpansionId)
    if (postgresCards.length > 0) return postgresCards

    return this.fromCardTrader(cardTraderExpansionId)
  }

  private fromPostgres = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const blueprints = await this.cardBlueprintPokemonRepo.listByExpansion(cardTraderExpansionId)
    return blueprints.map((b) => {
      const link = b.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      if (!link) throw new Error(`No CARD_TRADER link for blueprint ${b.id}`)
      const blueprintValue = this.blueprintValues.get(link.externalId)
      return new PokemonCard({
        cardTraderBlueprintId: Number(link.externalId),
        cardTraderExpansionId,
        name: b.name,
        collectorNumber: b.collectorNumber,
        pokemonRarity: b.pokemonCardBlueprint?.rarity ?? '',
        imageUrlPreview: b.imagePreviewUrl,
        imageUrlShow: b.imageShowUrl,
        medianMarketValueCents: blueprintValue?.medianCents ?? -1,
        listingCount: blueprintValue?.listingCount ?? -1,
      })
    })
  }

  private fromCardTrader = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const blueprints = await this.cardTraderClient.getPokemonBlueprints(cardTraderExpansionId)
    return blueprints.map((b) => {
      const blueprintValue = this.blueprintValues.get(`${b.blueprintId}`)
      return new PokemonCard({
        cardTraderBlueprintId: b.blueprintId,
        cardTraderExpansionId: b.expansionId,
        name: b.name,
        collectorNumber: b.collectorNumber,
        pokemonRarity: b.pokemonRarity,
        imageUrlPreview: b.imageUrlPreview,
        imageUrlShow: b.imageUrlShow,
        medianMarketValueCents: blueprintValue?.medianCents ?? -1,
        listingCount: blueprintValue?.listingCount ?? -1,
      })
    })
  }
}

export default PokemonCardFactory
