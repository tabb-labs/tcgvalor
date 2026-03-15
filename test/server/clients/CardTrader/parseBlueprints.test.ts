import { tryToParseBlueprints } from '../../../../src/server/clients/CardTrader/parseBlueprints'
import { DEWGONG_SINGLE_BLUEPRINT_RESPONSE } from './__MOCKS__/CardTraderBlueprintResponse.mock'
import { ENV } from '../../../../src/server/env'

const DEWGONG = DEWGONG_SINGLE_BLUEPRINT_RESPONSE
const BASE_URL = ENV.CARD_TRADER.CARD_TRADER_BASE_URL

describe('Parse Blueprint', () => {
  it('should throw when root is not array', () => {
    expect(() => tryToParseBlueprints('not Array')).toThrow()
  })

  it('should throw when array is missing properties', () => {
    expect(() => tryToParseBlueprints([{}])).toThrow()
  })

  it('should parse', () => {
    const result = tryToParseBlueprints([DEWGONG])
    expect(result[0].id).toEqual(DEWGONG.id)
    expect(result[0].name).toEqual(DEWGONG.name)
    expect(result[0].version).toEqual(DEWGONG.version)
    expect(result[0].gameId).toEqual(DEWGONG.game_id)
    expect(result[0].categoryId).toEqual(DEWGONG.category_id)
    expect(result[0].expansionId).toEqual(DEWGONG.expansion_id)
    expect(result[0].image.show.url).toEqual(`${BASE_URL}${DEWGONG.image.show.url}`)
    expect(result[0].image.preview.url).toEqual(`${BASE_URL}${DEWGONG.image.preview.url}`)
  })

  it('should return empty string when image is missing', () => {
    const response = { ...DEWGONG, image: {} }
    const result = tryToParseBlueprints([response])
    expect(result[0].image.show.url).toEqual('')
    expect(result[0].image.preview.url).toEqual('')
  })
})
