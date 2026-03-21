import { act, renderHook } from '@testing-library/react'
import * as UseRouterModule from '../../../../src/react/router/useRouter'
import { useCollectionParams } from '../../../../src/react/components/collection/useCollectionParams'
import { USE_ROUTER_RETURN } from '../../__MOCKS__/useRouterReturn.mock'

const SET_SEARCH_PARAMS = jest.fn()
const GET_SEARCH_PARAM = jest.fn()

const USE_ROUTER = jest.spyOn(UseRouterModule, 'useRouter')

beforeEach(() => {
  jest.clearAllMocks()
  GET_SEARCH_PARAM.mockReturnValue(null)
  USE_ROUTER.mockReturnValue({
    ...USE_ROUTER_RETURN,
    getSearchParam: GET_SEARCH_PARAM,
    setSearchParams: SET_SEARCH_PARAMS,
  })
})

describe('useCollectionParams', () => {
  it('should use schema defaults when no url params are set', () => {
    const { result } = renderHook(useCollectionParams)

    expect(result.current.params.page).toBe(1)
    expect(result.current.params.limit).toBe(20)
    expect(result.current.params.sortBy).toBe('price')
    expect(result.current.params.sortDir).toBe('desc')
    expect(result.current.params.search).toBeUndefined()
  })

  it('should parse url params', () => {
    GET_SEARCH_PARAM.mockImplementation((key: string) => {
      const map: Record<string, string> = { page: '3', limit: '50', sortBy: 'name', sortDir: 'asc', search: 'pikachu' }
      return map[key] ?? null
    })

    const { result } = renderHook(useCollectionParams)

    expect(result.current.params.page).toBe(3)
    expect(result.current.params.limit).toBe(50)
    expect(result.current.params.sortBy).toBe('name')
    expect(result.current.params.sortDir).toBe('asc')
    expect(result.current.params.search).toBe('pikachu')
    expect(result.current.searchInput).toBe('pikachu')
  })

  it('should update searchInput when onSearchInputChange is called', () => {
    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onSearchInputChange('charizard')
    })

    expect(result.current.searchInput).toBe('charizard')
  })

  it('should call setSearchParams with search and reset page to 1 on onSearch', () => {
    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onSearchInputChange('charizard')
    })
    act(() => {
      result.current.onSearch()
    })

    expect(SET_SEARCH_PARAMS).toHaveBeenCalledWith(expect.objectContaining({ search: 'charizard', page: '1' }))
  })

  it('should omit search param when searchInput is empty on onSearch', () => {
    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onSearch()
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const called = SET_SEARCH_PARAMS.mock.calls[0][0] as Record<string, string>
    expect(called.search).toBeUndefined()
  })

  it('should call setSearchParams with new sort and reset page to 1 on onSortChange', () => {
    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onSortChange('name:asc')
    })

    expect(SET_SEARCH_PARAMS).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDir: 'asc', page: '1' })
    )
  })

  it('should call setSearchParams with new page on onPageChange', () => {
    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onPageChange(5)
    })

    expect(SET_SEARCH_PARAMS).toHaveBeenCalledWith(expect.objectContaining({ page: '5' }))
  })

  it('should preserve limit in setSearchParams calls', () => {
    GET_SEARCH_PARAM.mockImplementation((key: string) => (key === 'limit' ? '50' : null))

    const { result } = renderHook(useCollectionParams)

    act(() => {
      result.current.onPageChange(2)
    })

    expect(SET_SEARCH_PARAMS).toHaveBeenCalledWith(expect.objectContaining({ limit: '50' }))
  })

  it('should expose sortValue as sortBy:sortDir string', () => {
    GET_SEARCH_PARAM.mockImplementation((key: string) => {
      const map: Record<string, string> = { sortBy: 'name', sortDir: 'asc' }
      return map[key] ?? null
    })

    const { result } = renderHook(useCollectionParams)

    expect(result.current.sortValue).toBe('name:asc')
  })
})
