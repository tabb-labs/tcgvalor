import Collection from '../../../src/server/domain/Collection'
import { BlueprintValue } from '../../../src/server/types/BlueprintValue'
import { makeUserCardWithBlueprintMock } from '../__MOCKS__/userCardWithBlueprint.mock'

describe('Collection', () => {
  const MEDIAN_CENTS = 1534
  const BLUEPRINT_VALUES = new Map<string, BlueprintValue>([
    ['1234', { medianCents: MEDIAN_CENTS, listingCount: 25 }],
    ['1001', { medianCents: 4, listingCount: 25 }],
    ['1002', { medianCents: 40, listingCount: 25 }],
    ['1003', { medianCents: 400, listingCount: 25 }],
    ['1004', { medianCents: 4000, listingCount: 25 }],
  ])

  const entry = (blueprintId: number, expansionId: number, cardBlueprintId = blueprintId) => ({
    card: makeUserCardWithBlueprintMock({ blueprintExternalId: blueprintId, cardBlueprintId }),
    expansionId,
  })

  it('should return card details', () => {
    const e = {
      card: makeUserCardWithBlueprintMock({
        blueprintExternalId: 1234,
        cardBlueprintId: 1234,
        name: 'anyName',
        imagePreviewUrl: 'anyPreviewUrl',
        imageShowUrl: 'anyShowUrl',
      }),
      expansionId: 2345,
    }

    const collection = new Collection([e], BLUEPRINT_VALUES)
    const cards = collection.cards()

    expect(cards.length).toEqual(1)
    expect(cards[0].blueprintId).toEqual(1234)
    expect(cards[0].expansionId).toEqual(2345)
    expect(cards[0].name).toEqual('anyName')
    expect(cards[0].imageUrlPreview).toEqual('anyPreviewUrl')
    expect(cards[0].imageUrlShow).toEqual('anyShowUrl')
    expect(cards[0].userCards.length).toEqual(1)
    expect(cards[0].medianMarketValueCents).toEqual(MEDIAN_CENTS)
    expect(cards[0].listingCount).toEqual(25)
  })

  it('should return default values when blueprint cannot be found', () => {
    const collection = new Collection([entry(3, 4)], BLUEPRINT_VALUES)
    expect(collection.cards()[0].medianMarketValueCents).toEqual(-1)
  })

  it('should return many items', () => {
    const entries = [entry(10, 11), entry(20, 21), entry(30, 31), entry(40, 41), entry(50, 51)]
    expect(new Collection(entries, BLUEPRINT_VALUES).cards().length).toEqual(5)
  })

  it('should return owned amounts', () => {
    const entries = [
      entry(10, 11),
      entry(10, 11),
      entry(10, 11),
      entry(10, 11),
      entry(20, 21),
      entry(20, 21),
      entry(30, 31),
    ]
    const cards = new Collection(entries, BLUEPRINT_VALUES).cards()

    expect(cards.length).toEqual(3)
    expect(cards[0].userCards.length).toEqual(4)
    expect(cards[1].userCards.length).toEqual(2)
    expect(cards[2].userCards.length).toEqual(1)
  })

  it('should total up blueprint values for my cards', () => {
    const entries = [entry(1001, 11), entry(1002, 21), entry(1003, 31), entry(1004, 41)]
    expect(new Collection(entries, BLUEPRINT_VALUES).details().medianMarketValueCents).toEqual(4444)
  })

  it('should total up blueprint values for a single card with multiple copies', () => {
    const entries = [entry(1001, 11), entry(1001, 11), entry(1001, 11)]
    expect(new Collection(entries, BLUEPRINT_VALUES).details().medianMarketValueCents).toEqual(12)
  })

  it('should total up blueprint values for many cards with multiple copies', () => {
    const entries = [entry(1001, 11), entry(1001, 11), entry(1001, 11), entry(1002, 11), entry(1002, 11)]
    expect(new Collection(entries, BLUEPRINT_VALUES).details().medianMarketValueCents).toEqual(92)
  })

  it('should total up card count', () => {
    const entries = [entry(1001, 11), entry(1001, 11), entry(1001, 11), entry(1002, 11), entry(1002, 11)]
    expect(new Collection(entries, BLUEPRINT_VALUES).details().cardsInCollection).toEqual(5)
  })
})
