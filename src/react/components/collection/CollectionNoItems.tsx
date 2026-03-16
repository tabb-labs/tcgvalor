import React from 'react'
import { PATH_VALUES } from '../../router/pathValues'
import {
  EmptyStateWrapper,
  EmptyStateCardIcon,
  EmptyStateDivider,
  EmptyStateHeading,
  EmptyStateBody,
} from '../base/EmptyState'
import { GoldWord } from '../base/GoldWord'
import InternalTextLink from '../base/text-link/InternalTextLink'

const CollectionNoItems = () => {
  return (
    <EmptyStateWrapper $variant="dark" style={{ maxWidth: '480px' }}>
      <EmptyStateCardIcon />
      <EmptyStateDivider />

      <EmptyStateHeading>
        Your <GoldWord>Collection</GoldWord> is Empty
      </EmptyStateHeading>

      <EmptyStateBody>
        Head to the <InternalTextLink id="CollectionCatalogLink" pathValue={PATH_VALUES.catalog()} label="Catalog" /> to
        browse expansions and add cards to your collection.
      </EmptyStateBody>
    </EmptyStateWrapper>
  )
}

export default CollectionNoItems
