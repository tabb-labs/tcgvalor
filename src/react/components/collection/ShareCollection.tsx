import React from 'react'
import CardList from '../card-list/CardList'
import { useShareCollection } from '../../network/collectionClient'
import { useRouter } from '../../router/useRouter'
import CollectionDetails from './CollectionDetails'
import { CenterContent } from '../base/layout/CenterContent'
import Spinner from '../base/Spinner'
import ShareCollectionNotFound from './ShareCollectionNotFound'
import CollectionNoResults from './CollectionNoResults'
import { PATH_VALUES } from '../../router/pathValues'
import { useProfile } from '../../providers/ProfileProvider'
import InternalTextLink from '../base/text-link/InternalTextLink'
import { CollectionSearchBar, CollectionPagination, Controls, SortSelect, SORT_OPTIONS } from './CollectionControls'
import { useCollectionParams, CollectionControls } from './useCollectionParams'
import { Line } from '../base/Line'
import styled from 'styled-components'
import { CollectionMetaDto, PaginationDto } from '@core/network-types/collection'
import { CardDto } from '@core/network-types/card'

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
  const hookReturn = useInShareCollection()
  return <ShareCollectionView {...hookReturn} />
}

type ShareCollectionViewProps = {
  collectionParams: CollectionControls
  cards: CardDto[]
  meta: CollectionMetaDto | undefined
  pagination: PaginationDto | undefined
  name: string | undefined
  showUserFoundView: boolean
  showNoUserFoundView: boolean
  showNoResults: boolean
  showLoading: boolean
  showSearchLoading: boolean
  showEditLink: boolean
}

const ShareCollectionView = ({
  collectionParams,
  cards,
  meta,
  pagination,
  name,
  showUserFoundView,
  showNoUserFoundView,
  showNoResults,
  showLoading,
  showSearchLoading,
  showEditLink,
}: ShareCollectionViewProps) => (
  <>
    {(showUserFoundView || showNoResults || showSearchLoading) && (
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

        {showNoResults && !showSearchLoading && (
          <CenterContent>
            <CollectionNoResults />
          </CenterContent>
        )}

        {showSearchLoading && (
          <CenterContent>
            <Spinner />
          </CenterContent>
        )}

        {showUserFoundView && !showSearchLoading && <CardList cardsDto={cards} isEditable={false} />}

        {pagination && !showSearchLoading && (
          <PaginationContainer>
            <CollectionPagination pagination={pagination} onPageChange={collectionParams.onPageChange} />
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

export const useInShareCollection = () => {
  const { profile } = useProfile()
  const { getParam } = useRouter()
  const shareToken = getParam('shareToken') || ''

  const { params, ...collectionParams } = useCollectionParams()

  const { data: collection, isLoading } = useShareCollection(shareToken, params)

  const hasCards = (collection?.cards.length ?? 0) > 0
  const totalCards = collection?.meta.cardsInCollection ?? 0
  const userExists = !!collection
  const isInitialLoad = isLoading && !collection

  return {
    collectionParams,
    cards: collection?.cards ?? [],
    meta: collection?.meta,
    pagination: collection?.pagination,
    name: collection?.name,
    showUserFoundView: !isLoading && userExists && hasCards,
    showNoUserFoundView: !isInitialLoad && !isLoading && (!userExists || totalCards === 0),
    showNoResults: !isLoading && userExists && totalCards > 0 && !hasCards,
    showLoading: isInitialLoad,
    showSearchLoading: !isInitialLoad && isLoading,
    showEditLink: shareToken === profile?.shareToken,
  }
}

export default ShareCollection
