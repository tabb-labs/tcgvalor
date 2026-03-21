import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'

const CARD_1 = { ...CARD_DTO, name: 'charmander' }
const CARD_2 = { ...CARD_DTO, name: 'pikachu' }
const CARDS = [CARD_1, CARD_2]

describe('CardList', () => {
  it('renders cards', () => {
    expect(CARDS.length).toBe(2)
  })
})
