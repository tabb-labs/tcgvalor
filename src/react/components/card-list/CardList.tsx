import styled, { css } from 'styled-components'
import { tabLandAndUp } from '../../styles/Responsive'
import React from 'react'
import CardItem from './CardItem'
import { CardDto } from '@core/network-types/card'

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

export type CardListProps = {
  cardsDto: CardDto[]
  isEditable?: boolean
  refreshCards?: (() => void) | undefined
}

const CardList = ({ cardsDto, refreshCards, isEditable = true }: CardListProps) => {
  return (
    <>
      <CardContainer>
        {cardsDto.map((cardDto) => (
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

export default CardList
