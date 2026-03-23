import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'

type SearchMode = 'expansion' | 'name'

const useCatalogMode = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('expansion')
  return { searchMode, setSearchMode }
}

describe('Catalog mode toggle', () => {
  it('should default to expansion mode', () => {
    const { result } = renderHook(useCatalogMode)
    expect(result.current.searchMode).toBe('expansion')
  })

  it('should switch to name mode', () => {
    const { result } = renderHook(useCatalogMode)
    act(() => result.current.setSearchMode('name'))
    expect(result.current.searchMode).toBe('name')
  })

  it('should switch back to expansion mode', () => {
    const { result } = renderHook(useCatalogMode)
    act(() => result.current.setSearchMode('name'))
    act(() => result.current.setSearchMode('expansion'))
    expect(result.current.searchMode).toBe('expansion')
  })
})
