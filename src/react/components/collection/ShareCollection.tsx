import React from 'react'
import CardList from '../card-list/CardList'
import { useShareCollection } from '../../network/collectionClient'
import { useRouter } from '../../router/useRouter'
import CollectionDetails from './CollectionDetails'
import { CenterContent } from '../base/layout/CenterContent'
import Spinner from '../base/Spinner'
import ShareCollectionNotFound from './ShareCollectionNotFound'
import { PATH_VALUES } from '../../router/pathValues'
import { useProfile } from '../../providers/ProfileProvider'
import InternalTextLink from '../base/text-link/InternalTextLink'
import { CollectionSearchBar, CollectionPagination, Controls, SortSelect, SORT_OPTIONS } from './CollectionControls'
import { useCollectionParams } from './useCollectionParams'
import { Line } from '../base/Line'
import styled from 'styled-components'

const ControlsContainer = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`

const PaginationContainer = styled.div`
  margin-top: 2.5rem;
  margin-bottom: 4rem;
`

const MetaRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
`

const Links = styled.div`
  display: flex;
  gap: 2rem;
`

const ShareCollection = () => {
  const {
    cards,
    meta,
    pagination,
    name,
    showUserFoundView,
    showNoUserFoundView,
    showLoading,
    showEditLink,
    searchInput,
    sortValue,
    onSearch,
    onSortChange,
    onPageChange,
  } = useInShareCollection()

  return (
    <>
      {showUserFoundView && (
        <>
          <MetaRow>
            {meta && <CollectionDetails collectionMeta={meta} nameTag={`${name}'s`} />}
            {showEditLink && (
              <Links>
                <InternalTextLink pathValue={PATH_VALUES.collection()} label="Edit Your Collection" />
              </Links>
            )}
          </MetaRow>
          <Line />

          <ControlsContainer>
            <Controls>
              <CollectionSearchBar value={searchInput} onChange={onSearch} />
              <SortSelect value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.label} value={`${opt.sortBy}:${opt.sortDir}`}>
                    {opt.label}
                  </option>
                ))}
              </SortSelect>
            </Controls>
          </ControlsContainer>

          <CardList cardsDto={cards} isEditable={false} />

          {pagination && (
            <PaginationContainer>
              <CollectionPagination pagination={pagination} onPageChange={onPageChange} />
            </PaginationContainer>
          )}
        </>
      )}

      {showNoUserFoundView && (
        <CenterContent>
          <ShareCollectionNotFound />
        </CenterContent>
      )}

      {showLoading && (
        <CenterContent>
          <Spinner />
        </CenterContent>
      )}
    </>
  )
}

export const useInShareCollection = () => {
  const { profile } = useProfile()
  const { getParam } = useRouter()
  const userId = getParam('userId') || ''

  const { params, searchInput, sortValue, onSearch, onSortChange, onPageChange } = useCollectionParams()

  const { data: collection, isLoading } = useShareCollection(userId, params)

  const collectionFound = !!collection && collection.cards.length > 0

  return {
    cards: collection?.cards ?? [],
    meta: collection?.meta,
    pagination: collection?.pagination,
    name: collection?.name,
    searchInput,
    sortValue,
    onSearch,
    onSortChange,
    onPageChange,
    showUserFoundView: collectionFound && !isLoading,
    showNoUserFoundView: !collectionFound && !isLoading,
    showLoading: isLoading,
    showEditLink: Number(userId) === profile?.id,
  }
}

export default ShareCollection
