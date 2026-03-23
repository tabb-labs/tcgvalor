import styled from 'styled-components'
import SearchBar, { SearchWrapper as SearchWrapperBase } from '../base/SearchBar'
import { fetchCatalogByName } from '../../network/catalogClient'
import React, { useState } from 'react'
import { CardDto } from '@core/network-types/card'
import CardList from '../card-list/CardList'
import { useToastContext } from '../../providers/ToastProvider'
import Spinner from '../base/Spinner'
import { CenterContent } from '../base/layout/CenterContent'
import CatalogNoNameSearch from './CatalogNoNameSearch'
import CollectionNoResults from '../collection/CollectionNoResults'
import { StickyScrollNavBar, ScrollToTopButton } from '../sticky-scroll'

const NameSearchWrapper = styled(SearchWrapperBase)`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`

const CatalogByName = () => {
  const {
    nameSearch,
    onNameSearchChange,
    onNameSearch,
    nameSearchCardsDto,
    showNameSearchLoading,
    showNameSearchZeroState,
    showNameSearchNoResults,
  } = useInCatalogByName()

  return (
    <>
      <NameSearchWrapper>
        <SearchBar
          placeholder="Search by card name..."
          value={nameSearch}
          onInputChange={onNameSearchChange}
          onSearch={onNameSearch}
        />
      </NameSearchWrapper>

      {showNameSearchZeroState && (
        <CenterContent>
          <CatalogNoNameSearch />
        </CenterContent>
      )}

      {showNameSearchLoading && (
        <CenterContent>
          <Spinner />
        </CenterContent>
      )}

      {showNameSearchNoResults && (
        <CenterContent>
          <CollectionNoResults />
        </CenterContent>
      )}

      <CardList cardsDto={nameSearchCardsDto} refreshCards={() => onNameSearch()} />

      <StickyScrollNavBar>
        <ScrollToTopButton />
      </StickyScrollNavBar>
    </>
  )
}

export const useInCatalogByName = () => {
  const { showError } = useToastContext()
  const [nameSearch, setNameSearch] = useState('')
  const [nameSearchCardsDto, setNameSearchCardsDto] = useState<CardDto[]>([])
  const [isLoadingNameSearch, setIsLoadingNameSearch] = useState(false)
  const [nameSearchSubmitted, setNameSearchSubmitted] = useState(false)

  const onNameSearch = () => {
    if (nameSearch.trim().length < 2) return
    setIsLoadingNameSearch(true)
    setNameSearchSubmitted(true)
    fetchCatalogByName(nameSearch.trim())
      .then((res) => setNameSearchCardsDto(res.data ?? []))
      .catch(() => showError('Failed to search cards'))
      .finally(() => setIsLoadingNameSearch(false))
  }

  return {
    nameSearch,
    onNameSearchChange: setNameSearch,
    onNameSearch,
    nameSearchCardsDto,
    showNameSearchLoading: isLoadingNameSearch,
    showNameSearchZeroState: !nameSearchSubmitted && !isLoadingNameSearch,
    showNameSearchNoResults: nameSearchSubmitted && !isLoadingNameSearch && nameSearchCardsDto.length === 0,
  }
}

export default CatalogByName
