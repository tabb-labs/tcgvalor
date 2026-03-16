import React from 'react'
import { addUserCard } from '../../../network/collectionClient'
import { CardDto } from '@core/network-types/card'
import { AddUserCardBody } from '@core/network-types/collection'
import CardButtonBase, { useWithCardButtonBase } from './CardButton'

type AddCardButtonProps = {
  cardDto: CardDto
  refreshCards: () => void
}

const AddCardButton = ({ cardDto, refreshCards }: AddCardButtonProps) => {
  const cardButton = useInAddCardButton(cardDto, refreshCards)
  return <CardButtonBase {...cardButton} />
}

export const useInAddCardButton = (cardDto: CardDto, refreshCards: () => void) => {
  const addCard = () => {
    const dto: AddUserCardBody = {
      blueprintId: cardDto.blueprintId,
      expansionId: cardDto.expansionId,
      name: cardDto.name,
      imageUrlPreview: cardDto.imageUrlPreview,
      imageUrlShow: cardDto.imageUrlShow,
    }

    return addUserCard(dto)
  }

  const cardButtonBase = useWithCardButtonBase(addCard, refreshCards, {
    success: 'Card Added',
    error: 'Failed to Add Card',
  })
  return { ...cardButtonBase, title: 'Add' }
}

export default AddCardButton
