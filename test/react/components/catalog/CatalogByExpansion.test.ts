/* eslint-disable @typescript-eslint/await-thenable */
import { act, renderHook } from '@testing-library/react'
import { useInCatalogByExpansion } from '../../../../src/react/components/catalog/CatalogByExpansion'
import * as AutocompleteModule from '../../../../src/react/components/base/form/Autocomplete'
import * as catalogClientModule from '../../../../src/react/network/catalogClient'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'
import * as UseRouterClient from '../../../../src/react/router/useRouter'
import * as ExpansionProviderClient from '../../../../src/react/providers/ExpansionProvider'
import { EXPANSION_DTO_1, EXPANSION_DTO_2 } from '../../../core/__MOCKS__/catalog.mock'
import { UseApiReturn } from '../../../../src/react/network/useApi'
import { ExpansionDto } from '@core/network-types/catalog'

const FETCH_CATALOG = jest.spyOn(catalogClientModule, 'fetchCatalog')
const USE_EXPANSIONS_DATA = jest.spyOn(catalogClientModule, 'useExpansionsData')
const USE_EXPANSION = jest.spyOn(ExpansionProviderClient, 'useExpansion')

const EXPANSIONS = [EXPANSION_DTO_1, EXPANSION_DTO_2]

USE_EXPANSION.mockReturnValue({
  expansions: EXPANSIONS,
  isLoading: false,
})

const USE_EXPANSION_DATA_RETURN: UseApiReturn<ExpansionDto[]> = {
  data: [],
  isLoading: false,
  errors: null,
  refresh: () => {},
}

USE_EXPANSIONS_DATA.mockReturnValue(USE_EXPANSION_DATA_RETURN)

const NAVIGATE_TO = jest.fn()
const GET_PARAM = jest.fn()

const USE_ROUTER = jest.spyOn(UseRouterClient, 'useRouter')

USE_ROUTER.mockReturnValue({
  navigateTo: NAVIGATE_TO,
  getParam: GET_PARAM,
  getSearchParam: () => null,
  setSearchParams: () => {},
  hostname: '',
  pathname: '',
})

const USE_WITH_AUTOCOMPLETE = jest.spyOn(AutocompleteModule, 'useWithAutocomplete')

const USE_WITH_AUTOCOMPLETE_RETURN: AutocompleteModule.UseWithAutocompleteReturn<object> = {
  selectedOption: null,
  bind: {} as unknown as AutocompleteModule.AutocompleteProps<object>,
  setOptions: () => {},
  setInputValue: () => {},
}

USE_WITH_AUTOCOMPLETE.mockReturnValue(USE_WITH_AUTOCOMPLETE_RETURN)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useInCatalogByExpansion', () => {
  it('should init as empty array', () => {
    const { result } = renderHook(useInCatalogByExpansion)
    expect(result.current.cardsDto).toEqual([])
  })

  it('should fetch set and set state when slug exists', async () => {
    GET_PARAM.mockReturnValue(EXPANSION_DTO_1.slug)

    FETCH_CATALOG.mockResolvedValue({
      data: { cards: [CARD_DTO], details: null },
      errors: null,
      isSuccessful: true,
    })

    const { result } = renderHook(useInCatalogByExpansion)

    await act(async () => await result.current.fetchExpansionDetailsAndCardsEffect.effect())

    expect(FETCH_CATALOG).toHaveBeenCalledWith(EXPANSION_DTO_1.expansionId)
    expect(result.current.cardsDto).toEqual([CARD_DTO])
    expect(result.current.fetchExpansionDetailsAndCardsEffect.deps).toEqual([EXPANSION_DTO_1.slug, EXPANSIONS])
  })

  it('should NOT fetch set and set state when slug does not exist', async () => {
    GET_PARAM.mockReturnValue(null)

    const { result } = renderHook(useInCatalogByExpansion)

    await act(async () => await result.current.fetchExpansionDetailsAndCardsEffect.effect())

    expect(FETCH_CATALOG).not.toHaveBeenCalled()
  })

  it('should show no expansion selected when an expansion is not selected', () => {
    const { result } = renderHook(useInCatalogByExpansion)

    expect(result.current.showLoading).toBe(false)
    expect(result.current.showNoCardsYet).toBe(false)
    expect(result.current.showNoExpansionsSelected).toBe(true)
  })

  it('should show no cards yet when the selected expansion fetch to get more cards returns nothing', async () => {
    GET_PARAM.mockReturnValue(EXPANSION_DTO_1.slug)

    FETCH_CATALOG.mockResolvedValue({
      data: { cards: [], details: null },
      errors: null,
      isSuccessful: true,
    })

    const { result } = renderHook(useInCatalogByExpansion)

    await act(async () => {
      await result.current.fetchExpansionDetailsAndCardsEffect.effect()
      await Promise.resolve()
    })

    expect(result.current.showLoading).toBe(false)
    expect(result.current.showNoCardsYet).toBe(true)
    expect(result.current.showNoExpansionsSelected).toBe(false)
  })
})
