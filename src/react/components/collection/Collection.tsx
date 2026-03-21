import React, { useState } from 'react'
import CardList, { CardListProps } from '../card-list/CardList'
import { useUserCards } from '../../network/collectionClient'
import CollectionDetails from './CollectionDetails'
import { useProfile } from '../../providers/ProfileProvider'
import CollectionNotLoggedIn from './CollectionNotLoggedIn'
import CollectionNoItems from './CollectionNoItems'
import Spinner from '../base/Spinner'
import { CenterContent } from '../base/layout/CenterContent'
import InternalTextLink from '../base/text-link/InternalTextLink'
import { PATH_VALUES } from '../../router/pathValues'
import { useRouter } from '../../router/useRouter'
import { CollectionQueryParamsSchema } from '@core/network-types/collection'
import styled from 'styled-components'

const Links = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 3rem;
`

const Controls = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`

const SearchInput = styled.input`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.staticColor.gray_900};
  background-color: #ffffff;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.staticColor.gold_500};
  }
`

const SortSelect = styled.select`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.staticColor.gray_900};
  background-color: #ffffff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.staticColor.gold_500};
  }
`

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
`

const PageButton = styled.button<{ disabled?: boolean }>`
  padding: 0.4rem 1rem;
  border: 1px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.2rem;
  background-color: #ffffff;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`

const PageInfo = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.staticColor.gray_600};
`

const SORT_OPTIONS = [
  { label: 'Price: High to Low', sortBy: 'price', sortDir: 'desc' },
  { label: 'Price: Low to High', sortBy: 'price', sortDir: 'asc' },
  { label: 'Name: A to Z', sortBy: 'name', sortDir: 'asc' },
  { label: 'Name: Z to A', sortBy: 'name', sortDir: 'desc' },
] as const

const Collection = () => {
  const {
    meta,
    cardListProps,
    shareLinkPath,
    showCollection,
    showNotLoggedIn,
    showNoCollection,
    showLoading,
    copyShareLinkToClipboard,
    pagination,
    nameInput,
    expansionInput,
    sortValue,
    onNameSearch,
    onExpansionSearch,
    onSortChange,
    onPageChange,
  } = useInCollection()

  return (
    <>
      {showNotLoggedIn && (
        <CenterContent>
          <CollectionNotLoggedIn />
        </CenterContent>
      )}

      {showLoading && (
        <CenterContent>
          <Spinner />
        </CenterContent>
      )}

      {(showCollection || showNoCollection) && (
        <>
          {meta && <CollectionDetails collectionMeta={meta} nameTag="Your" />}
          <Links>
            <InternalTextLink pathValue={shareLinkPath} label="View Share Page" />
            <InternalTextLink onClick={() => void copyShareLinkToClipboard()} label="Copy Share Link" />
          </Links>
          <Controls>
            <SearchInput
              placeholder="Search by name..."
              value={nameInput}
              onChange={(e) => onNameSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onNameSearch(nameInput)}
            />
            <SearchInput
              placeholder="Search by expansion..."
              value={expansionInput}
              onChange={(e) => onExpansionSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onExpansionSearch(expansionInput)}
            />
            <SortSelect value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.label} value={`${opt.sortBy}:${opt.sortDir}`}>
                  {opt.label}
                </option>
              ))}
            </SortSelect>
          </Controls>

          {showNoCollection && (
            <CenterContent>
              <CollectionNoItems />
            </CenterContent>
          )}

          {showCollection && <CardList {...cardListProps} />}

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PageButton disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
                Prev
              </PageButton>
              <PageInfo>
                Page {pagination.page} of {pagination.totalPages}
              </PageInfo>
              <PageButton
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </>
  )
}

export const useInCollection = () => {
  const { isLoggedIn, isLoading: isLoadingProfile, profile } = useProfile()
  const { getSearchParam, setSearchParams } = useRouter()

  const parsedParams = CollectionQueryParamsSchema.parse({
    page: getSearchParam('page') ?? undefined,
    limit: getSearchParam('limit') ?? undefined,
    name: getSearchParam('name') ?? undefined,
    expansion: getSearchParam('expansion') ?? undefined,
    sortBy: getSearchParam('sortBy') ?? undefined,
    sortDir: getSearchParam('sortDir') ?? undefined,
  })

  const [nameInput, setNameInput] = useState(parsedParams.name ?? '')
  const [expansionInput, setExpansionInput] = useState(parsedParams.expansion ?? '')

  const { data: collectionDto, refresh, isLoading: isLoadingCollection } = useUserCards(isLoggedIn, parsedParams)

  const buildParams = (overrides: Partial<typeof parsedParams>) => {
    const next = { ...parsedParams, ...overrides }
    const record: Record<string, string> = {
      page: String(next.page),
      sortBy: next.sortBy,
      sortDir: next.sortDir,
    }
    if (next.name) record.name = next.name
    if (next.expansion) record.expansion = next.expansion
    return record
  }

  const onNameSearch = (value: string) => {
    setNameInput(value)
    setSearchParams(buildParams({ name: value || undefined, page: 1 }))
  }

  const onExpansionSearch = (value: string) => {
    setExpansionInput(value)
    setSearchParams(buildParams({ expansion: value || undefined, page: 1 }))
  }

  const onSortChange = (value: string) => {
    const [sortBy, sortDir] = value.split(':') as ['name' | 'price', 'asc' | 'desc']
    setSearchParams(buildParams({ sortBy, sortDir, page: 1 }))
  }

  const onPageChange = (page: number) => {
    setSearchParams(buildParams({ page }))
  }

  const sortValue = `${parsedParams.sortBy}:${parsedParams.sortDir}`

  const cardListProps: CardListProps = {
    cardsDto: collectionDto?.cards ?? [],
    refreshCards: refresh,
  }

  const shareLinkPath = PATH_VALUES.collection(profile?.id)

  const copyShareLinkToClipboard = async () => {
    await navigator.clipboard.writeText(`${location.origin}${shareLinkPath}`)
  }

  const isLoading = isLoadingProfile || isLoadingCollection
  const hasCards = (collectionDto?.cards.length ?? 0) > 0

  return {
    cardListProps,
    meta: collectionDto?.meta,
    pagination: collectionDto?.pagination,
    shareLinkPath,
    nameInput,
    expansionInput,
    sortValue,
    onNameSearch,
    onExpansionSearch,
    onSortChange,
    onPageChange,
    showNotLoggedIn: !isLoading && !isLoggedIn,
    showNoCollection: !isLoading && !hasCards && isLoggedIn,
    showCollection: !isLoading && hasCards && isLoggedIn,
    showLoading: isLoading,
    copyShareLinkToClipboard,
  }
}

export default Collection
