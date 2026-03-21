import styled from 'styled-components'
import { SearchWrapper as SearchWrapperBase, SearchIcon, SearchInput } from '../base/SearchBar'
import { fetchCatalog } from '../../network/catalogClient'
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
import CollectionNoResults from '../collection/CollectionNoResults'
import { StickyScrollNavBar, ScrollToTopButton, ExpansionLogo } from '../sticky-scroll'

const Container = styled.div`
  margin-top: 1rem;
`

const SearchWrapper = styled(SearchWrapperBase)`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`

const Catalog = () => {
  const {
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
  } = useInCatalog()

  useEffect(expansionsLoadedEffect.effect, expansionsLoadedEffect.deps)
  useEffect(fetchExpansionDetailsAndCardsEffect.effect, fetchExpansionDetailsAndCardsEffect.deps)

  return (
    <Container>
      <p>Search Pokemon Cards By Expansion</p>
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
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </SearchIcon>
          <SearchInput
            id="CardListSearch"
            placeholder="Search cards..."
            value={cardSearch}
            onChange={(e) => onCardSearchChange(e.target.value)}
          />
        </SearchWrapper>
      )}

      {cardSearch && cardsDto.length === 0 && !showLoading && (
        <CenterContent>
          <CollectionNoResults />
        </CenterContent>
      )}

      <CardList cardsDto={cardsDto} refreshCards={refreshCards} />

      <StickyScrollNavBar>
        <ScrollToTopButton />
        <ExpansionLogo logoUrl={expansionDetailsDto?.logoUrl ?? null} />
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
  }
}
export default Catalog
