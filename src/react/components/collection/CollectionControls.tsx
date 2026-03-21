import React from 'react'
import styled from 'styled-components'
import { PaginationDto } from '@core/network-types/collection'

export const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`

const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${({ theme }) => theme.staticColor.gray_400};
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1.5px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.staticColor.gray_900};
  background-color: #ffffff;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.staticColor.gray_400};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.staticColor.gold_500};
  }
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
  border: 1.5px solid
    ${({ $active, $disabled, theme }) =>
      $active ? theme.staticColor.gray_900 : $disabled ? theme.staticColor.gray_300 : theme.staticColor.gray_300};
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

const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 1rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.staticColor.gray_400};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.staticColor.gray_900};
  }
`

type CollectionSearchBarProps = {
  value: string
  onInputChange: (value: string) => void
  onSearch: () => void
}

export const CollectionSearchBar = ({ value, onInputChange, onSearch }: CollectionSearchBarProps) => (
  <SearchWrapper>
    <SearchIcon>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </SearchIcon>
    <SearchInput
      placeholder="Search cards or expansions..."
      value={value}
      onChange={(e) => onInputChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
    />
    <SearchButton type="button" onClick={onSearch} aria-label="Search">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SearchButton>
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
