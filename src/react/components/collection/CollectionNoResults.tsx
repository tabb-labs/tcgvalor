import React from 'react'
import {
  EmptyStateWrapper,
  EmptyStateCardIcon,
  EmptyStateDivider,
  EmptyStateHeading,
  EmptyStateBody,
} from '../base/EmptyState'
import { GoldWord } from '../base/GoldWord'

const CollectionNoResults = () => (
  <EmptyStateWrapper $variant="dark" style={{ maxWidth: '480px' }}>
    <EmptyStateCardIcon />
    <EmptyStateDivider />

    <EmptyStateHeading>
      No <GoldWord>Results</GoldWord> Found
    </EmptyStateHeading>

    <EmptyStateBody>Try a different search term.</EmptyStateBody>
  </EmptyStateWrapper>
)

export default CollectionNoResults
