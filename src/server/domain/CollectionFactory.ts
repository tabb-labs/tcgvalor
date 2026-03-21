import { CardBlueprintWithUserCards, IUserCardRepo, UserCardWithBlueprint } from '../repository/UserCardRepo'
import { CollectionQueryParams } from '@core/network-types/collection'
import Collection, { ICollection } from './Collection'
import PokemonCard from './PokemonCard'
import { CardDto } from '@core/network-types/card'
import { CollectionMetaDto, PaginationDto } from '@core/network-types/collection'

export type PaginatedCollectionResult = {
  cards: CardDto[]
  meta: CollectionMetaDto
  pagination: PaginationDto
}

export interface ICollectionFactory {
  make: (userId: number) => Promise<ICollection>
  makePaginated: (userId: number, params: CollectionQueryParams) => Promise<PaginatedCollectionResult>
}

class CollectionFactory implements ICollectionFactory {
  private readonly userCardRepo: IUserCardRepo

  constructor(userCardRepo: IUserCardRepo) {
    this.userCardRepo = userCardRepo
  }

  make = async (userId: number): Promise<ICollection> => {
    const entries = await this.userCardRepo.listAll(userId)
    const pokemonCards = this.buildPokemonCardsFromEntries(entries)
    return new Collection(pokemonCards)
  }

  makePaginated = async (userId: number, params: CollectionQueryParams): Promise<PaginatedCollectionResult> => {
    const [{ blueprints, total }, meta] = await Promise.all([
      this.userCardRepo.listPaginated(userId, params),
      this.userCardRepo.getCollectionMeta(userId),
    ])

    const cards = blueprints.map((blueprint) => this.blueprintToCardDto(blueprint))

    return {
      cards,
      meta,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    }
  }

  private buildPokemonCardsFromEntries = (
    entries: { card: UserCardWithBlueprint; expansionId: number }[]
  ): PokemonCard[] => {
    const grouped = new Map<
      number,
      { card: UserCardWithBlueprint; expansionId: number; userCards: { id: number; condition: string }[] }
    >()

    for (const { card, expansionId } of entries) {
      if (!grouped.has(card.cardBlueprintId)) {
        grouped.set(card.cardBlueprintId, { card, expansionId, userCards: [] })
      }
      grouped.get(card.cardBlueprintId)!.userCards.push({ id: card.id, condition: card.condition })
    }

    return [...grouped.values()].map(({ card, expansionId, userCards }) => {
      const link = card.cardBlueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      const blueprintId = Number(link?.externalId ?? -1)
      const marketValue = card.cardBlueprint.marketValue
      return new PokemonCard({
        cardTraderBlueprintId: blueprintId,
        cardTraderExpansionId: expansionId,
        name: card.cardBlueprint.name,
        collectorNumber: '',
        pokemonRarity: '',
        imageUrlPreview: card.cardBlueprint.imagePreviewUrl,
        imageUrlShow: card.cardBlueprint.imageShowUrl,
        medianMarketValueCents: marketValue?.medianMarketValueCents ?? -1,
        listingCount: marketValue?.listingCount ?? -1,
        userCards,
      })
    })
  }

  private blueprintToCardDto = (blueprint: CardBlueprintWithUserCards): CardDto => {
    const blueprintLink = blueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
    const expansionLink = blueprint.expansion.platformLinks.find((l) => l.platform === 'CARD_TRADER')
    const marketValue = blueprint.marketValue
    return new PokemonCard({
      cardTraderBlueprintId: Number(blueprintLink?.externalId ?? -1),
      cardTraderExpansionId: Number(expansionLink?.externalId ?? -1),
      name: blueprint.name,
      collectorNumber: '',
      pokemonRarity: '',
      imageUrlPreview: blueprint.imagePreviewUrl,
      imageUrlShow: blueprint.imageShowUrl,
      medianMarketValueCents: marketValue?.medianMarketValueCents ?? -1,
      listingCount: marketValue?.listingCount ?? -1,
      userCards: blueprint.userCards.map((uc) => ({ id: uc.id, condition: uc.condition })),
    }).toCardDto()
  }
}

export default CollectionFactory
