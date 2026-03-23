/* eslint-disable @typescript-eslint/await-thenable */
import { act, renderHook } from '@testing-library/react'
import { useInCatalogByName } from '../../../../src/react/components/catalog/CatalogByName'
import * as catalogClientModule from '../../../../src/react/network/catalogClient'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'

const FETCH_CATALOG_BY_NAME = jest.spyOn(catalogClientModule, 'fetchCatalogByName')

beforeEach(() => {
  jest.clearAllMocks()
  FETCH_CATALOG_BY_NAME.mockResolvedValue({ data: [], errors: null, isSuccessful: true })
})

describe('useInCatalogByName', () => {
  it('should show zero state before any search is submitted', () => {
    const { result } = renderHook(useInCatalogByName)
    expect(result.current.showNameSearchZeroState).toBe(true)
    expect(result.current.showNameSearchNoResults).toBe(false)
  })

  it('should not fetch when name is less than 2 characters', async () => {
    const { result } = renderHook(useInCatalogByName)
    act(() => result.current.onNameSearchChange('a'))
    await act(async () => {
      result.current.onNameSearch()
      await Promise.resolve()
    })
    expect(FETCH_CATALOG_BY_NAME).not.toHaveBeenCalled()
    expect(result.current.showNameSearchZeroState).toBe(true)
  })

  it('should fetch when name is at least 2 characters', async () => {
    const { result } = renderHook(useInCatalogByName)
    act(() => result.current.onNameSearchChange('pi'))
    await act(async () => {
      result.current.onNameSearch()
      await Promise.resolve()
    })
    expect(FETCH_CATALOG_BY_NAME).toHaveBeenCalledWith('pi')
  })

  it('should populate nameSearchCardsDto with results', async () => {
    FETCH_CATALOG_BY_NAME.mockResolvedValue({ data: [CARD_DTO], errors: null, isSuccessful: true })
    const { result } = renderHook(useInCatalogByName)
    act(() => result.current.onNameSearchChange('pikachu'))
    await act(async () => {
      result.current.onNameSearch()
      await Promise.resolve()
    })
    expect(result.current.nameSearchCardsDto).toEqual([CARD_DTO])
    expect(result.current.showNameSearchZeroState).toBe(false)
    expect(result.current.showNameSearchNoResults).toBe(false)
  })

  it('should show no results state when search returns empty', async () => {
    const { result } = renderHook(useInCatalogByName)
    act(() => result.current.onNameSearchChange('zzz'))
    await act(async () => {
      result.current.onNameSearch()
      await Promise.resolve()
    })
    expect(result.current.showNameSearchNoResults).toBe(true)
    expect(result.current.showNameSearchZeroState).toBe(false)
  })
})
