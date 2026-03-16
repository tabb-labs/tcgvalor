import React from 'react'
import { removeUserCard } from '../../../network/collectionClient'

import CardButtonBase, { useWithCardButtonBase } from './CardButton'

type RemoveCardButtonProps = {
  userCardIds: number[]
  refreshCards: () => void
}

const RemoveCardButton = ({ userCardIds, refreshCards }: RemoveCardButtonProps) => {
  const cardButton = useInRemoveCardButton(userCardIds, refreshCards)

  return <CardButtonBase {...cardButton} />
}

export const useInRemoveCardButton = (userCardIds: number[], refreshCards: () => void) => {
  const removeCard = () => {
    return removeUserCard(userCardIds[0])
  }

  const cardButtonBase = useWithCardButtonBase(removeCard, refreshCards, {
    success: 'Card Removed',
    error: 'Failed to Remove Card',
  })

  const isDisabled = userCardIds.length === 0 ? true : cardButtonBase.isDisabled
  return { ...cardButtonBase, title: 'Remove', isDisabled }
}

export default RemoveCardButton
