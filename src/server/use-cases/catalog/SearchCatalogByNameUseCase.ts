import { CardDto } from '@core/network-types/card'
import { ICardBlueprintPokemonRepo } from '../../repository/CardBlueprintPokemonRepo'
import PokemonCard from '../../domain/PokemonCard'

class SearchCatalogByNameUseCase {
  private readonly cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo

  constructor(cardBlueprintPokemonRepo: ICardBlueprintPokemonRepo) {
    this.cardBlueprintPokemonRepo = cardBlueprintPokemonRepo
  }

  call = async (name: string, userId?: number): Promise<CardDto[]> => {
    const blueprints = await this.cardBlueprintPokemonRepo.searchByName(name, userId)

    return blueprints.map((b) => {
      const blueprintLink = b.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      const expansionLink = b.expansion.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      return new PokemonCard({
        cardTraderBlueprintId: Number(blueprintLink?.externalId ?? -1),
        cardTraderExpansionId: Number(expansionLink?.externalId ?? -1),
        expansionName: b.expansion.name,
        expansionAbbreviation: b.expansion.pokemonExpansion?.abbreviation ?? '',
        collectorNumber: b.collectorNumber,
        name: b.name,
        pokemonRarity: '',
        imageUrlPreview: b.imagePreviewUrl,
        imageUrlShow: b.imageShowUrl,
        medianMarketValueCents: b.marketValue?.medianMarketValueCents ?? -1,
        listingCount: b.marketValue?.listingCount ?? -1,
        userCards: b.userCards.map((uc) => ({ id: uc.id, condition: uc.condition })),
      }).toCardDto()
    })
  }
}

export default SearchCatalogByNameUseCase
