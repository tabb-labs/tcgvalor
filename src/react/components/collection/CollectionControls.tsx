import React from 'react'
import styled from 'styled-components'
import { PaginationDto } from '@core/network-types/collection'
import SearchBar, { SearchWrapper as SearchWrapperBase } from '../base/SearchBar'

export const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`

const SearchWrapper = styled(SearchWrapperBase)`
  flex: 1;
`

export const SortSelect = styled.select`
  padding: 0.65rem 0.8rem;
  border: 1.5px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.staticColor.gray_900};
  background-color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.staticColor.gold_500};
  }
`

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
`

const PageBtn = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  min-width: 3.6rem;
  height: 3.6rem;
  padding: 0 0.6rem;
  border-radius: 0.5rem;
  font-size: 1.3rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.staticColor.gray_900 : theme.staticColor.gray_300)};
  background-color: ${({ $active, theme }) => ($active ? theme.staticColor.gray_900 : '#ffffff')};
  color: ${({ $active, $disabled, theme }) =>
    $active ? '#ffffff' : $disabled ? theme.staticColor.gray_400 : theme.staticColor.gray_900};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;

  &:hover {
    ${({ $active, $disabled, theme }) =>
      !$active && !$disabled
        ? `border-color: ${theme.staticColor.gray_900}; color: ${theme.staticColor.gray_900};`
        : ''}
  }
`

const Ellipsis = styled.span`
  min-width: 3.6rem;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.staticColor.gray_400};
  user-select: none;
`

export const SORT_OPTIONS = [
  { label: 'Price: High to Low', sortBy: 'price', sortDir: 'desc' },
  { label: 'Price: Low to High', sortBy: 'price', sortDir: 'asc' },
  { label: 'Name: A to Z', sortBy: 'name', sortDir: 'asc' },
  { label: 'Name: Z to A', sortBy: 'name', sortDir: 'desc' },
] as const

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

type CollectionSearchBarProps = {
  value: string
  onInputChange: (value: string) => void
  onSearch: () => void
}

export const CollectionSearchBar = ({ value, onInputChange, onSearch }: CollectionSearchBarProps) => (
  <SearchWrapper>
    <SearchBar
      placeholder="Search cards or expansions..."
      value={value}
      onInputChange={onInputChange}
      onSearch={onSearch}
    />
  </SearchWrapper>
)

type CollectionPaginationProps = {
  pagination: PaginationDto
  onPageChange: (page: number) => void
}

export const CollectionPagination = ({ pagination, onPageChange }: CollectionPaginationProps) => {
  if (pagination.totalPages <= 1) return null
  const pages = getPageNumbers(pagination.page, pagination.totalPages)
  return (
    <PaginationRow>
      <PageBtn
        $disabled={pagination.page <= 1}
        onClick={() => pagination.page > 1 && onPageChange(pagination.page - 1)}
        aria-label="Previous page"
      >
        ←
      </PageBtn>
      {pages.map((p, i) =>
        p === '...' ? (
          <Ellipsis key={`ellipsis-${i}`}>…</Ellipsis>
        ) : (
          <PageBtn key={p} $active={p === pagination.page} onClick={() => onPageChange(p)}>
            {p}
          </PageBtn>
        )
      )}
      <PageBtn
        $disabled={pagination.page >= pagination.totalPages}
        onClick={() => pagination.page < pagination.totalPages && onPageChange(pagination.page + 1)}
        aria-label="Next page"
      >
        →
      </PageBtn>
    </PaginationRow>
  )
}
