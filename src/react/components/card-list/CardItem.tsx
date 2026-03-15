import React from 'react'
import styled from 'styled-components'
import { useGlobalPopup } from '../../providers/GlobalPopupProvider'
import EnlargedCardPopup from './EnlargedCardPopup'
import { useProfile } from '../../providers/ProfileProvider'
import AddCardButton from './card-button/AddCardButton'
import { formatCentsToDollars } from '../../../core/currencyFormatter'
import RemoveCardButton from './card-button/RemoveCardButton'
import { CardDto } from '@core/network-types/card'
import { Line } from '../base/Line'
import { formatWithCommas } from '../../../core/numberFormatter'

const Container = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`

const Image = styled.img`
  cursor: pointer;
`

const ContentWell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Actions = styled.div`
  display: flex;
`

const PriceWell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Price = styled.span`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.staticColor.gray_600};
`

const ListingText = styled.p`
  font-size: 1.2rem;
  font-style: italic;
`

type CardItemProps = {
  cardDto: CardDto
  id?: string
  isEditable?: boolean
  refreshCards?: (() => void) | undefined
}

const CardItem = ({ cardDto, id, isEditable = true, refreshCards = () => {} }: CardItemProps) => {
  const { formattedMedian, formattedListingCount, showOwnedCount, showActions, openEnlargedImage } = useInCardItem(
    cardDto,
    isEditable
  )

  return (
    <Container id={id}>
      <Image
        src={cardDto.imageUrlPreview}
        onClick={(e) => openEnlargedImage(e, <EnlargedCardPopup imageUrl={cardDto.imageUrlShow} />)}
      />
      <ContentWell>
        <Line />
        <h2>{cardDto.name}</h2>
        <Line />
        <Details>
          <PriceWell>
            <h3>
              Value: <Price>{formattedMedian}</Price>
            </h3>
            <ListingText>Based on {formattedListingCount} Listings.</ListingText>
          </PriceWell>

          <>
            {showOwnedCount && <h3>Owned: {cardDto.userCards.length}</h3>}
            {showActions && (
              <Actions>
                <AddCardButton cardDto={cardDto} refreshCards={refreshCards} />
                <RemoveCardButton userCardIds={cardDto.userCards.map((c) => c.id)} refreshCards={refreshCards} />
              </Actions>
            )}
          </>
        </Details>
      </ContentWell>
    </Container>
  )
}

export const useInCardItem = (cardDto: CardDto, isEditable: boolean) => {
  const { show: openEnlargedImage } = useGlobalPopup()
  const { isLoggedIn } = useProfile()

  const formatValue = (cents: number) => {
    if (cents < 0) return '...'
    return formatCentsToDollars(cents)
  }

  return {
    isLoggedIn,
    formattedMedian: formatValue(cardDto.medianMarketValueCents),
    formattedListingCount: formatWithCommas(cardDto.listingCount),
    showOwnedCount: isLoggedIn || !isEditable,
    showActions: isLoggedIn && isEditable,
    openEnlargedImage,
  }
}

export default CardItem
