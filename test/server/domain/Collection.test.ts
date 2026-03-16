import Collection from '../../../src/server/domain/Collection'
import { makePokemonCardMock } from '../__MOCKS__/pokemonCard.mock'

describe('Collection', () => {
  const card = (
    blueprintId: number,
    userCards: { id: number; condition: string }[] = [],
    medianMarketValueCents = -1
  ) => makePokemonCardMock({ blueprintId, expansionId: blueprintId + 1, userCards, medianMarketValueCents })

  it('should return card details', () => {
    const pokemonCard = makePokemonCardMock({
      blueprintId: 1234,
      expansionId: 2345,
      name: 'anyName',
      imageUrlPreview: 'anyPreviewUrl',
      imageUrlShow: 'anyShowUrl',
      medianMarketValueCents: 1534,
      listingCount: 25,
      userCards: [{ id: 1, condition: 'NM' }],
    })

    const collection = new Collection([pokemonCard])
    const cards = collection.cards()

    expect(cards.length).toEqual(1)
    expect(cards[0].blueprintId).toEqual(1234)
    expect(cards[0].expansionId).toEqual(2345)
    expect(cards[0].name).toEqual('anyName')
    expect(cards[0].imageUrlPreview).toEqual('anyPreviewUrl')
    expect(cards[0].imageUrlShow).toEqual('anyShowUrl')
    expect(cards[0].userCards.length).toEqual(1)
    expect(cards[0].medianMarketValueCents).toEqual(1534)
    expect(cards[0].listingCount).toEqual(25)
  })

  it('should return default values when blueprint cannot be found', () => {
    const collection = new Collection([card(3)])
    expect(collection.cards()[0].medianMarketValueCents).toEqual(-1)
  })

  it('should return many items', () => {
    const cards = [card(10), card(20), card(30), card(40), card(50)]
    expect(new Collection(cards).cards().length).toEqual(5)
  })

  it('should return owned amounts', () => {
    const cards = [
      card(10, [
        { id: 1, condition: 'NM' },
        { id: 2, condition: 'NM' },
        { id: 3, condition: 'NM' },
        { id: 4, condition: 'NM' },
      ]),
      card(20, [
        { id: 5, condition: 'NM' },
        { id: 6, condition: 'NM' },
      ]),
      card(30, [{ id: 7, condition: 'NM' }]),
    ]
    const result = new Collection(cards).cards()

    expect(result.length).toEqual(3)
    expect(result[0].userCards.length).toEqual(4)
    expect(result[1].userCards.length).toEqual(2)
    expect(result[2].userCards.length).toEqual(1)
  })

  it('should total up blueprint values for my cards', () => {
    const cards = [
      card(1001, [{ id: 1, condition: 'NM' }], 4),
      card(1002, [{ id: 2, condition: 'NM' }], 40),
      card(1003, [{ id: 3, condition: 'NM' }], 400),
      card(1004, [{ id: 4, condition: 'NM' }], 4000),
    ]
    expect(new Collection(cards).details().medianMarketValueCents).toEqual(4444)
  })

  it('should total up blueprint values for a single card with multiple copies', () => {
    const cards = [
      card(
        1001,
        [
          { id: 1, condition: 'NM' },
          { id: 2, condition: 'NM' },
          { id: 3, condition: 'NM' },
        ],
        4
      ),
    ]
    expect(new Collection(cards).details().medianMarketValueCents).toEqual(12)
  })

  it('should total up blueprint values for many cards with multiple copies', () => {
    const cards = [
      card(
        1001,
        [
          { id: 1, condition: 'NM' },
          { id: 2, condition: 'NM' },
          { id: 3, condition: 'NM' },
        ],
        4
      ),
      card(
        1002,
        [
          { id: 4, condition: 'NM' },
          { id: 5, condition: 'NM' },
        ],
        40
      ),
    ]
    expect(new Collection(cards).details().medianMarketValueCents).toEqual(92)
  })

  it('should total up card count', () => {
    const cards = [
      card(1001, [
        { id: 1, condition: 'NM' },
        { id: 2, condition: 'NM' },
        { id: 3, condition: 'NM' },
      ]),
      card(1002, [
        { id: 4, condition: 'NM' },
        { id: 5, condition: 'NM' },
      ]),
    ]
    expect(new Collection(cards).details().cardsInCollection).toEqual(5)
  })
})
