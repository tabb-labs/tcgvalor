import styled from 'styled-components'
import SearchBar, { SearchWrapper as SearchWrapperBase } from '../base/SearchBar'
import { fetchCatalog, fetchCatalogByName } from '../../network/catalogClient'
import Autocomplete, { useWithAutocomplete } from '../base/form/Autocomplete'
import React, { useEffect, useState } from 'react'
import { CatalogDto, ExpansionDto } from '@core/network-types/catalog'
import { CardDto } from '@core/network-types/card'
import { UseEffectType } from '../../types/UseEffectType'
import { DropdownOption } from '../base/form/utilities/InputFieldDropdown'
import CatalogExpansionDetails from './CatalogExpansionDetails'
import { useRouter } from '../../router/useRouter'
import { useExpansion } from '../../providers/ExpansionProvider'
import { useToastContext } from '../../providers/ToastProvider'
import { PATH_VALUES } from '../../router/pathValues'
import CardList from '../card-list/CardList'
import { setCatalogReturnUrl } from '../../router/catalogReturnUrl'
import Spinner from '../base/Spinner'
import { CenterContent } from '../base/layout/CenterContent'
import CatalogNoCards from './CatalogNoCards'
import CatalogNoExpansionSelected from './CatalogNoExpansionSelected'
import CatalogNoNameSearch from './CatalogNoNameSearch'
import CollectionNoResults from '../collection/CollectionNoResults'
import { StickyScrollNavBar, ScrollToTopButton, ExpansionLogo } from '../sticky-scroll'

type SearchMode = 'expansion' | 'name'

const Container = styled.div`
  margin-top: 1rem;
`

const SearchWrapper = styled(SearchWrapperBase)`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`

const ModeToggle = styled.div`
  display: flex;
  gap: 0;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 1.5px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  overflow: hidden;
  width: fit-content;
`

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  font-size: 1.3rem;
  border: none;
  cursor: pointer;
  background-color: ${({ $active, theme }) => ($active ? theme.staticColor.gray_900 : '#ffffff')};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.staticColor.gray_700)};
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
`

const NameSearchWrapper = styled(SearchWrapperBase)`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`

const Catalog = () => {
  const {
    searchMode,
    onSearchModeChange,
    autocompleteBind,
    cardsDto,
    cardSearch,
    onCardSearchChange,
    expansionDetailsDto,
    expansionsLoadedEffect,
    fetchExpansionDetailsAndCardsEffect,
    refreshCards,
    showLoading,
    showNoCardsYet,
    showNoExpansionsSelected,
    nameSearch,
    onNameSearchChange,
    onNameSearch,
    nameSearchCardsDto,
    showNameSearchLoading,
    showNameSearchZeroState,
    showNameSearchNoResults,
  } = useInCatalog()

  useEffect(expansionsLoadedEffect.effect, expansionsLoadedEffect.deps)
  useEffect(fetchExpansionDetailsAndCardsEffect.effect, fetchExpansionDetailsAndCardsEffect.deps)

  return (
    <Container>
      <ModeToggle>
        <ModeButton $active={searchMode === 'expansion'} onClick={() => onSearchModeChange('expansion')}>
          By Expansion
        </ModeButton>
        <ModeButton $active={searchMode === 'name'} onClick={() => onSearchModeChange('name')}>
          By Name
        </ModeButton>
      </ModeToggle>

      {searchMode === 'expansion' && (
        <>
          <Autocomplete {...autocompleteBind} />

          {!showLoading && expansionDetailsDto && <CatalogExpansionDetails expansionDetailsDto={expansionDetailsDto} />}

          {showNoCardsYet && (
            <CenterContent>
              <CatalogNoCards />
            </CenterContent>
          )}

          {showLoading && (
            <CenterContent>
              <Spinner />
            </CenterContent>
          )}

          {showNoExpansionsSelected && (
            <CenterContent>
              <CatalogNoExpansionSelected />
            </CenterContent>
          )}

          {expansionDetailsDto && (
            <SearchWrapper>
              <SearchBar
                id="CardListSearch"
                placeholder="Search cards..."
                value={cardSearch}
                onInputChange={onCardSearchChange}
                onSearch={() => {}}
              />
            </SearchWrapper>
          )}

          {cardSearch && cardsDto.length === 0 && !showLoading && (
            <CenterContent>
              <CollectionNoResults />
            </CenterContent>
          )}

          <CardList cardsDto={cardsDto} refreshCards={refreshCards} />
        </>
      )}

      {searchMode === 'name' && (
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
        </>
      )}

      <StickyScrollNavBar>
        <ScrollToTopButton />
        {searchMode === 'expansion' && <ExpansionLogo logoUrl={expansionDetailsDto?.logoUrl ?? null} />}
      </StickyScrollNavBar>
    </Container>
  )
}

export const useInCatalog = () => {
  const { expansions } = useExpansion()
  const { showError } = useToastContext()
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const { getParam, navigateTo } = useRouter()
  const expansionSlug = getParam('expansionSlug')
  const [selectedExpansion, setSelectedExpansion] = useState<CatalogDto | null>(null)
  const [allCardsDto, setAllCardsDto] = useState<CardDto[]>([])
  const [cardSearch, setCardSearch] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('expansion')
  const [nameSearch, setNameSearch] = useState('')
  const [nameSearchCardsDto, setNameSearchCardsDto] = useState<CardDto[]>([])
  const [isLoadingNameSearch, setIsLoadingNameSearch] = useState(false)
  const [nameSearchSubmitted, setNameSearchSubmitted] = useState(false)

  const fetchExpansionDetailsAndCards = () => {
    if (!expansionSlug) return
    const selectedExpansion = expansions?.find((expansion) => expansion.slug === expansionSlug)
    if (!selectedExpansion) return
    setIsLoadingCatalog(true)
    fetchCatalog(selectedExpansion.expansionId)
      .then((res) => {
        setCatalogReturnUrl(selectedExpansion.slug)
        setSelectedExpansion(res.data)
        setAllCardsDto(res.data?.cards.sort(sortByHighestMedian) ?? [])
      })
      .catch(() => showError('Failed to load catalog'))
      .finally(() => {
        setIsLoadingCatalog(false)
      })
  }

  const onNameSearch = () => {
    if (nameSearch.trim().length < 2) return
    setIsLoadingNameSearch(true)
    setNameSearchSubmitted(true)
    fetchCatalogByName(nameSearch.trim())
      .then((res) => setNameSearchCardsDto(res.data ?? []))
      .catch(() => showError('Failed to search cards'))
      .finally(() => setIsLoadingNameSearch(false))
  }

  const onSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode)
    setNameSearch('')
    setNameSearchCardsDto([])
    setNameSearchSubmitted(false)
  }

  const sortByHighestMedian = (a: CardDto, b: CardDto) => {
    return b.medianMarketValueCents - a.medianMarketValueCents
  }

  const redirectToOptionSlug = (option: ExpansionDto) => {
    navigateTo(PATH_VALUES.catalog(option.slug))
  }

  const {
    bind: autocompleteBind,
    setOptions,
    setInputValue,
  } = useWithAutocomplete<ExpansionDto>({
    didSelectOption: redirectToOptionSlug,
  })

  const expansionsLoadedEffect: UseEffectType = {
    effect: () => {
      if (expansions) {
        const newOptions: DropdownOption<ExpansionDto>[] = expansions.map((expansion) => ({
          data: expansion,
          title: expansion.name,
          imageSource: expansion.symbol,
        }))
        setOptions(newOptions)

        if (expansionSlug) {
          const match = expansions.find((e) => e.slug === expansionSlug)
          if (match) setInputValue(match.name)
        }
      }
    },
    deps: [expansions],
  }

  const fetchExpansionDetailsAndCardsEffect: UseEffectType = {
    effect: () => {
      setAllCardsDto([])
      setCardSearch('')
      fetchExpansionDetailsAndCards()
    },
    deps: [expansionSlug, expansions],
  }

  const slugNotFound = !!expansions && !!expansionSlug && !expansions.find((e) => e.slug === expansionSlug)
  const pendingLoad = !!expansionSlug && !slugNotFound && !selectedExpansion

  return {
    searchMode,
    onSearchModeChange,
    autocompleteBind: { ...autocompleteBind, id: 'CatalogAutocomplete' },
    cardsDto: cardSearch
      ? allCardsDto.filter((c) => c.name.toLowerCase().includes(cardSearch.toLowerCase()))
      : allCardsDto,
    cardSearch,
    onCardSearchChange: setCardSearch,
    expansionDetailsDto: selectedExpansion?.details || null,
    expansionsLoadedEffect,
    fetchExpansionDetailsAndCardsEffect,
    refreshCards: fetchExpansionDetailsAndCards,
    showLoading: (isLoadingCatalog || pendingLoad) && allCardsDto.length === 0,
    showNoCardsYet: !isLoadingCatalog && selectedExpansion?.cards.length === 0,
    showNoExpansionsSelected: !expansionSlug || slugNotFound,
    nameSearch,
    onNameSearchChange: setNameSearch,
    onNameSearch,
    nameSearchCardsDto,
    showNameSearchLoading: isLoadingNameSearch,
    showNameSearchZeroState: !nameSearchSubmitted && !isLoadingNameSearch,
    showNameSearchNoResults: nameSearchSubmitted && !isLoadingNameSearch && nameSearchCardsDto.length === 0,
  }
}
export default Catalog
