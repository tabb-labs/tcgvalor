import { CardBlueprintWithUserCards, IUserCardRepo } from '../repository/UserCardRepo'
import { CollectionQueryParams } from '@core/network-types/collection'
import PokemonCard from './PokemonCard'
import { CardDto } from '@core/network-types/card'
import { CollectionMetaDto, PaginationDto } from '@core/network-types/collection'

export type PaginatedCollectionResult = {
  cards: CardDto[]
  meta: CollectionMetaDto
  pagination: PaginationDto
}

export interface ICollectionFactory {
  makePaginated: (userId: number, params: CollectionQueryParams) => Promise<PaginatedCollectionResult>
}

class CollectionFactory implements ICollectionFactory {
  private readonly userCardRepo: IUserCardRepo

  constructor(userCardRepo: IUserCardRepo) {
    this.userCardRepo = userCardRepo
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

  private blueprintToCardDto = (blueprint: CardBlueprintWithUserCards): CardDto => {
    const blueprintLink = blueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
    const expansionLink = blueprint.expansion.platformLinks.find((l) => l.platform === 'CARD_TRADER')
    const marketValue = blueprint.marketValue
    return new PokemonCard({
      cardTraderBlueprintId: Number(blueprintLink?.externalId ?? -1),
      cardTraderExpansionId: Number(expansionLink?.externalId ?? -1),
      expansionName: blueprint.expansion.name,
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
