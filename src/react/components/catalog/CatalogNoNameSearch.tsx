import React from 'react'
import styled from 'styled-components'
import { revealUp } from '../base/animations'
import { EmptyStateWrapper, EmptyStateDivider, EmptyStateHeading, EmptyStateBody } from '../base/EmptyState'

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  animation: ${revealUp} 0.4s ease both;
`

const CardSlot = styled.div<{ $offset?: number }>`
  width: 42px;
  height: 58px;
  border: 1.5px solid rgba(232, 160, 20, 0.7);
  border-radius: 5px;
  background: rgba(232, 160, 20, 0.12);
  transform: rotate(${({ $offset }) => $offset ?? 0}deg);
  box-shadow: 0 0 12px rgba(232, 160, 20, 0.12);
`

const CatalogNoNameSearch = () => {
  return (
    <EmptyStateWrapper $variant="dark" id="NoNameSearch" style={{ maxWidth: '420px', gap: '1.6rem' }}>
      <IconRow>
        <CardSlot $offset={-6} />
        <CardSlot />
        <CardSlot $offset={6} />
      </IconRow>

      <EmptyStateDivider />

      <EmptyStateHeading>Search By Name</EmptyStateHeading>

      <EmptyStateBody>
        Type a card name above to find it
        <br />
        across all expansions.
      </EmptyStateBody>
    </EmptyStateWrapper>
  )
}

export default CatalogNoNameSearch
