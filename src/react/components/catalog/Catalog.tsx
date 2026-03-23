import styled from 'styled-components'
import React, { useState } from 'react'
import CatalogByExpansion from './CatalogByExpansion'
import CatalogByName from './CatalogByName'

type SearchMode = 'expansion' | 'name'

const Container = styled.div`
  margin-top: 1rem;
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

const Catalog = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('expansion')

  return (
    <Container>
      <ModeToggle>
        <ModeButton $active={searchMode === 'expansion'} onClick={() => setSearchMode('expansion')}>
          By Expansion
        </ModeButton>
        <ModeButton $active={searchMode === 'name'} onClick={() => setSearchMode('name')}>
          By Name
        </ModeButton>
      </ModeToggle>

      {searchMode === 'expansion' && <CatalogByExpansion />}
      {searchMode === 'name' && <CatalogByName />}
    </Container>
  )
}

export default Catalog
