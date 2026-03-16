import { ICardTraderClient } from '../clients/CardTrader/CardTraderClient'
import { ICardBlueprintPokemonRepo } from '../repository/CardBlueprintPokemonRepo'
import { IUserCardRepo, UserCardWithBlueprint } from '../repository/UserCardRepo'
import { BlueprintValue } from '../types/BlueprintValue'
import PokemonCard from './PokemonCard'

export interface IPokemonCardFactory {
  makeList: (cardTraderExpansionId: number, userId?: number) => Promise<PokemonCard[]>
}

class PokemonCardFactory implements IPokemonCardFactory {
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo
  private readonly cardTraderClient: ICardTraderClient
  private readonly blueprintValues: Map<string, BlueprintValue>
  private readonly userCardRepo: IUserCardRepo

  constructor(
    cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo,
    cardTraderClient: ICardTraderClient,
    blueprintValues: Map<string, BlueprintValue>,
    userCardRepo: IUserCardRepo
  ) {
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
    this.cardTraderClient = cardTraderClient
    this.blueprintValues = blueprintValues
    this.userCardRepo = userCardRepo
  }

  makeList = async (cardTraderExpansionId: number, userId?: number): Promise<PokemonCard[]> => {
    const userCardsByBlueprintId = userId
      ? this.groupByBlueprintId(await this.userCardRepo.listByExpansion(userId, cardTraderExpansionId))
      : new Map<number, { id: number; condition: string }[]>()

    const postgresCards = await this.fromPostgres(cardTraderExpansionId, userCardsByBlueprintId)
    if (postgresCards.length > 0) return postgresCards
    return this.fromCardTrader(cardTraderExpansionId, userCardsByBlueprintId)
  }

  private groupByBlueprintId = (
    userCards: UserCardWithBlueprint[]
  ): Map<number, { id: number; condition: string }[]> => {
    const map = new Map<number, { id: number; condition: string }[]>()
    for (const uc of userCards) {
      const link = uc.cardBlueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      if (!link) continue
      const blueprintId = Number(link.externalId)
      const existing = map.get(blueprintId) ?? []
      map.set(blueprintId, [...existing, { id: uc.id, condition: uc.condition }])
    }
    return map
  }

  private fromPostgres = async (
    cardTraderExpansionId: number,
    userCardsByBlueprintId: Map<number, { id: number; condition: string }[]>
  ): Promise<PokemonCard[]> => {
    const blueprints = await this.cardBlueprintPokemonRepo.listByExpansion(cardTraderExpansionId)
    return blueprints.map((b) => {
      const link = b.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      if (!link) throw new Error(`No CARD_TRADER link for blueprint ${b.id}`)
      const blueprintId = Number(link.externalId)
      const blueprintValue = this.blueprintValues.get(link.externalId)
      return new PokemonCard({
        cardTraderBlueprintId: blueprintId,
        cardTraderExpansionId,
        name: b.name,
        collectorNumber: b.collectorNumber,
        pokemonRarity: b.pokemonCardBlueprint?.rarity ?? '',
        imageUrlPreview: b.imagePreviewUrl,
        imageUrlShow: b.imageShowUrl,
        medianMarketValueCents: blueprintValue?.medianCents ?? -1,
        listingCount: blueprintValue?.listingCount ?? -1,
        userCards: userCardsByBlueprintId.get(blueprintId) ?? [],
      })
    })
  }

  private fromCardTrader = async (
    cardTraderExpansionId: number,
    userCardsByBlueprintId: Map<number, { id: number; condition: string }[]>
  ): Promise<PokemonCard[]> => {
    const blueprints = await this.cardTraderClient.getPokemonBlueprints(cardTraderExpansionId)
    return blueprints.map((b) => {
      const blueprintValue = this.blueprintValues.get(`${b.id}`)
      return new PokemonCard({
        cardTraderBlueprintId: b.id,
        cardTraderExpansionId: b.expansionId,
        name: b.name,
        collectorNumber: b.fixedProperties.collectorNumber,
        pokemonRarity: b.fixedProperties.pokemonRarity,
        imageUrlPreview: b.image.preview.url,
        imageUrlShow: b.image.show.url,
        medianMarketValueCents: blueprintValue?.medianCents ?? -1,
        listingCount: blueprintValue?.listingCount ?? -1,
        userCards: userCardsByBlueprintId.get(b.id) ?? [],
      })
    })
  }
}

export default PokemonCardFactory
