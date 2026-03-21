import { useState } from 'react'
import { CollectionQueryParams, CollectionQueryParamsSchema } from '@core/network-types/collection'
import { useRouter } from '../../router/useRouter'

export type CollectionParamsReturn = {
  params: CollectionQueryParams
  searchInput: string
  sortValue: string
  onSearch: (value: string) => void
  onSortChange: (value: string) => void
  onPageChange: (page: number) => void
}

export const useCollectionParams = (): CollectionParamsReturn => {
  const { getSearchParam, setSearchParams } = useRouter()

  const params = CollectionQueryParamsSchema.parse({
    page: getSearchParam('page') ?? undefined,
    limit: getSearchParam('limit') ?? undefined,
    search: getSearchParam('search') ?? undefined,
    sortBy: getSearchParam('sortBy') ?? undefined,
    sortDir: getSearchParam('sortDir') ?? undefined,
  })

  const [searchInput, setSearchInput] = useState(params.search ?? '')

  const buildParams = (overrides: Partial<CollectionQueryParams>): Record<string, string> => {
    const next = { ...params, ...overrides }
    const record: Record<string, string> = {
      page: String(next.page),
      sortBy: next.sortBy,
      sortDir: next.sortDir,
    }
    if (next.search) record.search = next.search
    return record
  }

  const onSearch = (value: string) => {
    setSearchInput(value)
    setSearchParams(buildParams({ search: value || undefined, page: 1 }))
  }

  const onSortChange = (value: string) => {
    const [sortBy, sortDir] = value.split(':') as ['name' | 'price', 'asc' | 'desc']
    setSearchParams(buildParams({ sortBy, sortDir, page: 1 }))
  }

  const onPageChange = (page: number) => {
    setSearchParams(buildParams({ page }))
  }

  return {
    params,
    searchInput,
    sortValue: `${params.sortBy}:${params.sortDir}`,
    onSearch,
    onSortChange,
    onPageChange,
  }
}
