import { CardDto } from '@core/network-types/card'
import { CollectionMetaDto } from '@core/network-types/collection'
import { UserCardWithBlueprint } from '../repository/UserCardRepo'
import { BlueprintValue } from '../types/BlueprintValue'

type UserCardEntry = { card: UserCardWithBlueprint; expansionId: number }

export interface ICollection {
  cards: () => CardDto[]
  details: () => CollectionMetaDto
}

class Collection implements ICollection {
  private cardCollection: CardDto[]
  private cardDetails: CollectionMetaDto

  constructor(entries: UserCardEntry[], blueprintValues: Map<string, BlueprintValue>) {
    const { cards, details } = this.calculateValues(entries, blueprintValues)
    this.cardCollection = cards
    this.cardDetails = details
  }

  cards = () => this.cardCollection
  details = () => this.cardDetails

  private calculateValues = (entries: UserCardEntry[], blueprintValues: Map<string, BlueprintValue>) => {
    const totalValue = this.getEmptyBlueprintValue()
    let cardsInCollection = 0

    const uniqueBlueprints = this.uniqueByBlueprint(entries)

    const cards = uniqueBlueprints.map(({ card, expansionId }) => {
      const blueprintLink = card.cardBlueprint.platformLinks.find((l) => l.platform === 'CARD_TRADER')
      const blueprintId = Number(blueprintLink?.externalId ?? -1)

      const userCards = entries
        .filter(({ card: c }) => c.cardBlueprintId === card.cardBlueprintId)
        .map(({ card: c }) => ({ id: c.id, condition: c.condition }))
      cardsInCollection += userCards.length

      let blueprintValue = blueprintValues.get(`${blueprintId}`)
      if (blueprintValue) this.addToTotal(totalValue, blueprintValue, userCards.length)
      if (!blueprintValue) blueprintValue = this.getMissingBlueprintValue()

      const cardDto: CardDto = {
        blueprintId,
        expansionId,
        name: card.cardBlueprint.name,
        imageUrlPreview: card.cardBlueprint.imagePreviewUrl,
        imageUrlShow: card.cardBlueprint.imageShowUrl,
        userCards,
        medianMarketValueCents: blueprintValue.medianCents,
        listingCount: blueprintValue.listingCount,
      }

      return cardDto
    })

    const details: CollectionMetaDto = {
      medianMarketValueCents: totalValue.medianCents,
      cardsInCollection,
    }

    return { cards, details }
  }

  private uniqueByBlueprint = (entries: UserCardEntry[]): UserCardEntry[] => {
    const seen = new Set<number>()
    return entries.filter(({ card }) => {
      if (seen.has(card.cardBlueprintId)) return false
      seen.add(card.cardBlueprintId)
      return true
    })
  }

  private addToTotal = (total: BlueprintValue, blueprintValue: BlueprintValue, count: number) => {
    for (let i = 1; i <= count; i++) {
      total.medianCents += blueprintValue.medianCents
    }
  }

  private getEmptyBlueprintValue = (): BlueprintValue => ({ medianCents: 0, listingCount: 0 })
  private getMissingBlueprintValue = (): BlueprintValue => ({ medianCents: -1, listingCount: -1 })
}

export default Collection
