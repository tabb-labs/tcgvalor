import { ICardTraderAdaptor } from '../clients/CardTrader/CardTraderAdaptor'
import { ICardBlueprintPokemonRepo } from '../repository/CardBlueprintPokemonRepo'
import PokemonCard from './PokemonCard'

export interface IPokemonCardFactory {
  makeList: (cardTraderExpansionId: number) => Promise<PokemonCard[]>
}

class PokemonCardFactory implements IPokemonCardFactory {
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo
  private readonly cardTraderAdaptor: ICardTraderAdaptor

  constructor(cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo, cardTraderAdaptor: ICardTraderAdaptor) {
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
    this.cardTraderAdaptor = cardTraderAdaptor
  }

  makeList = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const postgresCards = await this.fromPostgres(cardTraderExpansionId)
    if (postgresCards.length > 0) return postgresCards

    return await this.fromCardTrader(cardTraderExpansionId)
  }

  private fromPostgres = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const blueprints = await this.cardBlueprintPokemonRepo.listByExpansion(cardTraderExpansionId)
    return blueprints.map((b) => {
      const link = b.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      if (!link) throw new Error(`No CARD_TRADER link for blueprint ${b.id}`)
      return new PokemonCard({
        cardTraderBlueprintId: Number(link.externalId),
        cardTraderExpansionId,
        name: b.name,
        collectorNumber: b.collectorNumber,
        pokemonRarity: b.pokemonCardBlueprint?.rarity ?? '',
        imageUrlPreview: b.imagePreviewUrl,
        imageUrlShow: b.imageShowUrl,
      })
    })
  }

  private fromCardTrader = async (cardTraderExpansionId: number): Promise<PokemonCard[]> => {
    const blueprints = await this.cardTraderAdaptor.getPokemonBlueprints(cardTraderExpansionId)
    return blueprints.map(
      (b) =>
        new PokemonCard({
          cardTraderBlueprintId: b.blueprintId,
          cardTraderExpansionId: b.expansionId,
          name: b.name,
          collectorNumber: b.collectorNumber,
          pokemonRarity: b.pokemonRarity,
          imageUrlPreview: b.imageUrlPreview,
          imageUrlShow: b.imageUrlShow,
        })
    )
  }
}

export default PokemonCardFactory
