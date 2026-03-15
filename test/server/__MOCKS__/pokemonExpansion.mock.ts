import PokemonExpansion from '../../../src/server/domain/PokemonExpansion'

export const makePokemonExpansionMock = (overrides: Partial<ConstructorParameters<typeof PokemonExpansion>[0]> = {}) =>
  new PokemonExpansion({
    cardTraderExpansionId: 1472,
    name: 'Base Set',
    expansionNumberInSeries: 1,
    series: 'Original Series',
    numberOfCards: 102,
    numberOfSecretCards: 0,
    releaseDate: new Date(1999, 1, 9),
    logoUrl: null,
    symbolUrl: null,
    bulbapediaUrl: 'https://bulbapedia.bulbagarden.net/wiki/Base_Set_(TCG)',
    ...overrides,
  })
