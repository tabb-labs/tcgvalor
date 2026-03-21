import React from 'react'
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
import { CollectionSearchBar, CollectionPagination, Controls, SortSelect, SORT_OPTIONS } from './CollectionControls'
import { useCollectionParams, CollectionControls } from './useCollectionParams'
import { Line } from '../base/Line'
import styled from 'styled-components'
import { CollectionMetaDto, PaginationDto } from '@core/network-types/collection'

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

const Collection = () => {
  const hookReturn = useInCollection()
  return <CollectionView {...hookReturn} />
}

type CollectionViewProps = {
  collectionParams: CollectionControls
  cardListProps: CardListProps
  meta: CollectionMetaDto | undefined
  pagination: PaginationDto | undefined
  shareLinkPath: string
  showNotLoggedIn: boolean
  showNoCollection: boolean
  showCollection: boolean
  showLoading: boolean
  copyShareLinkToClipboard: () => Promise<void>
}

const CollectionView = ({
  collectionParams,
  cardListProps,
  meta,
  pagination,
  shareLinkPath,
  showNotLoggedIn,
  showNoCollection,
  showCollection,
  showLoading,
  copyShareLinkToClipboard,
}: CollectionViewProps) => (
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
        {meta && (
          <MetaRow>
            <CollectionDetails collectionMeta={meta} nameTag="Your" />
            <Links>
              <InternalTextLink pathValue={shareLinkPath} label="View Share Page" />
              <InternalTextLink onClick={() => void copyShareLinkToClipboard()} label="Copy Share Link" />
            </Links>
          </MetaRow>
        )}
        <Line />

        <ControlsContainer>
          <Controls>
            <CollectionSearchBar
              value={collectionParams.searchInput}
              onInputChange={collectionParams.onSearchInputChange}
              onSearch={collectionParams.onSearch}
            />
            <SortSelect
              value={collectionParams.sortValue}
              onChange={(e) => collectionParams.onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.label} value={`${opt.sortBy}:${opt.sortDir}`}>
                  {opt.label}
                </option>
              ))}
            </SortSelect>
          </Controls>
        </ControlsContainer>

        {showNoCollection && (
          <CenterContent>
            <CollectionNoItems />
          </CenterContent>
        )}

        {showCollection && <CardList {...cardListProps} />}

        {pagination && (
          <PaginationContainer>
            <CollectionPagination pagination={pagination} onPageChange={collectionParams.onPageChange} />
          </PaginationContainer>
        )}
      </>
    )}
  </>
)

export const useInCollection = () => {
  const { isLoggedIn, isLoading: isLoadingProfile, profile } = useProfile()
  const { params, ...collectionParams } = useCollectionParams()

  const { data: collectionDto, refresh, isLoading: isLoadingCollection } = useUserCards(isLoggedIn, params)

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
    collectionParams,
    cardListProps,
    meta: collectionDto?.meta,
    pagination: collectionDto?.pagination,
    shareLinkPath,
    showNotLoggedIn: !isLoading && !isLoggedIn,
    showNoCollection: !isLoading && !hasCards && isLoggedIn,
    showCollection: !isLoading && hasCards && isLoggedIn,
    showLoading: isLoading,
    copyShareLinkToClipboard,
  }
}

export default Collection
