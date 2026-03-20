import styled, { css } from 'styled-components'
import { tabLandAndUp } from '../../styles/Responsive'
import React, { useEffect, useState } from 'react'
import CardItem from './CardItem'
import { CardDto } from '@core/network-types/card'
import Input, { useWithInput } from '../base/form/Input'
import { Button } from '../base/Button'
import { UseEffectType } from '../../types/UseEffectType'
import { CenterContent } from '../base/layout/CenterContent'

const CardContainer = styled.div`
  display: grid;
  padding-top: 1rem;
  padding-bottom: 1rem;
  row-gap: 1rem;
  column-gap: 1rem;

  ${tabLandAndUp(css`
    grid-template-columns: repeat(2, 1fr);
  `)}
`

const SearchBarContainer = styled.div`
  max-width: 45rem;
`

const CardsHeader = styled.h1`
  margin-top: 2rem;
`

const SearchBarControls = styled.div`
  display: flex;
`

const InputContainer = styled.div`
  flex: 1;
`

export type CardListProps = {
  cardsDto: CardDto[]
  isEditable?: boolean
  refreshCards?: (() => void) | undefined
}

const CardList = ({ cardsDto, refreshCards, isEditable = true }: CardListProps) => {
  const {
    filteredCardsDto,
    inputBind,
    showSearchBar,
    showNoCardsMatchingFilter,
    showCardsTitle,
    cardsWillChangeEffect,
    clearInput,
  } = useInCardList(cardsDto)

  useEffect(cardsWillChangeEffect.effect, cardsWillChangeEffect.deps)

  return (
    <>
      {showCardsTitle && <CardsHeader>Cards:</CardsHeader>}
      {showSearchBar && (
        <SearchBarContainer>
          <p>Search By Name:</p>
          <SearchBarControls>
            <InputContainer>
              <Input id="CardListSearch" {...inputBind} />
            </InputContainer>
            <Button onClick={clearInput}>Clear</Button>
          </SearchBarControls>
        </SearchBarContainer>
      )}

      {showNoCardsMatchingFilter && (
        <CenterContent>
          <h1>No Matching Cards</h1>
          <p>Try searching something else.</p>
        </CenterContent>
      )}

      <CardContainer>
        {filteredCardsDto.map((cardDto) => (
          <CardItem
            id={`CardListItem-${cardDto.blueprintId}`}
            key={cardDto.blueprintId}
            cardDto={cardDto}
            isEditable={isEditable}
            refreshCards={refreshCards}
          />
        ))}
      </CardContainer>
    </>
  )
}

export const useInCardList = (cardsDto: CardDto[]) => {
  const input = useWithInput({})
  const [filteredCardsDto, setFilteredCardsDto] = useState<CardDto[]>([])

  const filterCards = () => {
    return cardsDto.filter((cardDto) => {
      const downcaseValue = input.value.toLowerCase()
      const downcaseName = cardDto.name.toLowerCase()
      return downcaseName.includes(downcaseValue)
    })
  }

  const cardsWillChangeEffect: UseEffectType = {
    effect: () => setFilteredCardsDto(filterCards()),
    deps: [cardsDto, input.value],
  }

  const cardsExist = cardsDto.length > 0

  return {
    filteredCardsDto,
    inputBind: input.bind,
    showSearchBar: cardsExist,
    showNoCardsMatchingFilter: cardsExist && filteredCardsDto.length === 0,
    showCardsTitle: cardsExist,
    cardsWillChangeEffect,
    clearInput: () => input.setValue(''),
  }
}

export default CardList
