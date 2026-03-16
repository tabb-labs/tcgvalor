import { IUserCardRepo, UserCardWithBlueprint } from '../repository/UserCardRepo'
import { BlueprintValue } from '../types/BlueprintValue'
import Collection, { ICollection } from './Collection'
import PokemonCard from './PokemonCard'

export interface ICollectionFactory {
  make: (userId: number) => Promise<ICollection>
}

class CollectionFactory implements ICollectionFactory {
  private readonly cardRepo: IUserCardRepo
  private readonly blueprintValues: Map<string, BlueprintValue>

  constructor(cardRepo: IUserCardRepo, blueprintValues: Map<string, BlueprintValue>) {
    this.cardRepo = cardRepo
    this.blueprintValues = blueprintValues
  }

  make = async (userId: number): Promise<ICollection> => {
    const entries = await this.cardRepo.listAll(userId)
    const pokemonCards = this.buildPokemonCards(entries)
    return new Collection(pokemonCards)
  }

  private buildPokemonCards = (entries: { card: UserCardWithBlueprint; expansionId: number }[]): PokemonCard[] => {
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
      const blueprintValue = this.blueprintValues.get(`${blueprintId}`)
      return new PokemonCard({
        cardTraderBlueprintId: blueprintId,
        cardTraderExpansionId: expansionId,
        name: card.cardBlueprint.name,
        collectorNumber: '',
        pokemonRarity: '',
        imageUrlPreview: card.cardBlueprint.imagePreviewUrl,
        imageUrlShow: card.cardBlueprint.imageShowUrl,
        medianMarketValueCents: blueprintValue?.medianCents ?? -1,
        listingCount: blueprintValue?.listingCount ?? -1,
        userCards,
      })
    })
  }
}

export default CollectionFactory
