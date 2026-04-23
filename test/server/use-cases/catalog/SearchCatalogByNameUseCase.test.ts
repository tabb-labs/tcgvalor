import SearchCatalogByNameUseCase from '../../../../src/server/use-cases/catalog/SearchCatalogByNameUseCase'
import CardBlueprintPokemonRepo_FAKE from '../../__FAKES__/CardBlueprintPokemonRepo.fake'
import { CardBlueprintWithExpansionAndValue } from '../../../../src/server/repository/CardBlueprintPokemonRepo'

const makeBlueprint = (
  overrides: Partial<{
    name: string
    expansionName: string
    expansionAbbreviation: string | null
    collectorNumber: string
    blueprintExternalId: string
    expansionExternalId: string
    medianMarketValueCents: number
    listingCount: number
    marketValue: { medianMarketValueCents: number; listingCount: number } | null
    platformLinks: { platform: string; externalId: string }[]
    userCards: { id: number; condition: string }[]
  }> = {}
): CardBlueprintWithExpansionAndValue =>
  ({
    name: overrides.name ?? 'Charizard',
    collectorNumber: overrides.collectorNumber ?? '004/102',
    imagePreviewUrl: 'preview-url',
    imageShowUrl: 'show-url',
    platformLinks: overrides.platformLinks ?? [
      { platform: 'CARD_TRADER', externalId: overrides.blueprintExternalId ?? '100' },
    ],
    expansion: {
      name: overrides.expansionName ?? 'Base Set',
      platformLinks: [{ platform: 'CARD_TRADER', externalId: overrides.expansionExternalId ?? '200' }],
      pokemonExpansion:
        overrides.expansionAbbreviation !== null ? { abbreviation: overrides.expansionAbbreviation ?? 'BS' } : null,
    },
    marketValue:
      overrides.marketValue !== undefined
        ? overrides.marketValue
        : {
            medianMarketValueCents: overrides.medianMarketValueCents ?? 500,
            listingCount: overrides.listingCount ?? 10,
          },
    userCards: overrides.userCards ?? [],
  }) as unknown as CardBlueprintWithExpansionAndValue

describe('SearchCatalogByNameUseCase', () => {
  let repo: CardBlueprintPokemonRepo_FAKE
  let useCase: SearchCatalogByNameUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new CardBlueprintPokemonRepo_FAKE()
    useCase = new SearchCatalogByNameUseCase(repo)
    repo.SEARCH_BY_NAME.mockResolvedValue([])
  })

  it('should return empty array when no blueprints found', async () => {
    const result = await useCase.call('Pikachu')
    expect(result).toEqual([])
  })

  it('should pass name and userId to repo', async () => {
    await useCase.call('Charizard', 42)
    expect(repo.SEARCH_BY_NAME).toHaveBeenCalledWith('Charizard', 42)
  })

  it('should pass undefined userId to repo when not provided', async () => {
    await useCase.call('Charizard')
    expect(repo.SEARCH_BY_NAME).toHaveBeenCalledWith('Charizard', undefined)
  })

  it('should map blueprint name to CardDto name', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ name: 'Charizard' })])
    const result = await useCase.call('Charizard')
    expect(result[0].name).toBe('Charizard')
  })

  it('should map expansion name to CardDto expansionName', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ expansionName: 'Scarlet & Violet' })])
    const result = await useCase.call('Charizard')
    expect(result[0].expansionName).toBe('Scarlet & Violet')
  })

  it('should extract CARD_TRADER blueprint external id as blueprintId', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ blueprintExternalId: '999' })])
    const result = await useCase.call('Charizard')
    expect(result[0].blueprintId).toBe(999)
  })

  it('should extract CARD_TRADER expansion external id as expansionId', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ expansionExternalId: '777' })])
    const result = await useCase.call('Charizard')
    expect(result[0].expansionId).toBe(777)
  })

  it('should fall back to -1 when blueprint has no CARD_TRADER platform link', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ platformLinks: [] })])
    const result = await useCase.call('Charizard')
    expect(result[0].blueprintId).toBe(-1)
  })

  it('should map market value to CardDto', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ medianMarketValueCents: 1234, listingCount: 42 })])
    const result = await useCase.call('Charizard')
    expect(result[0].medianMarketValueCents).toBe(1234)
    expect(result[0].listingCount).toBe(42)
  })

  it('should fall back to -1 when market value is missing', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ marketValue: null })])
    const result = await useCase.call('Charizard')
    expect(result[0].medianMarketValueCents).toBe(-1)
    expect(result[0].listingCount).toBe(-1)
  })

  it('should map userCards from blueprint', async () => {
    const userCards = [
      { id: 1, condition: 'NM' },
      { id: 2, condition: 'LP' },
    ]
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ userCards })])
    const result = await useCase.call('Charizard')
    expect(result[0].userCards).toEqual(userCards)
  })

  it('should return multiple cards', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ name: 'Charizard' }), makeBlueprint({ name: 'Charmeleon' })])
    const result = await useCase.call('Char')
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Charizard')
    expect(result[1].name).toBe('Charmeleon')
  })

  it('should map pokemonExpansion abbreviation to expansionAbbreviation', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ expansionAbbreviation: 'PFL' })])
    const result = await useCase.call('Pawmot')
    expect(result[0].expansionAbbreviation).toBe('PFL')
  })

  it('should fall back to empty string when pokemonExpansion is null', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ expansionAbbreviation: null })])
    const result = await useCase.call('Charizard')
    expect(result[0].expansionAbbreviation).toBe('')
  })

  it('should map collectorNumber from blueprint', async () => {
    repo.SEARCH_BY_NAME.mockResolvedValue([makeBlueprint({ collectorNumber: '034/094' })])
    const result = await useCase.call('Pawmot')
    expect(result[0].collectorNumber).toBe('034/094')
  })
})
