import React from 'react'
import styled from 'styled-components'

export const SearchWrapper = styled.div`
  position: relative;
`

export const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${({ theme }) => theme.staticColor.gray_400};
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1.5px solid ${({ theme }) => theme.staticColor.gray_300};
  border-radius: 0.5rem;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.staticColor.gray_900};
  background-color: #ffffff;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.staticColor.gray_400};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.staticColor.gold_500};
  }
`

const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 1rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.staticColor.gray_400};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.staticColor.gray_900};
  }
`

type SearchBarProps = {
  value: string
  placeholder?: string
  onInputChange: (value: string) => void
  onSearch: () => void
  id?: string
}

const SearchBar = ({ value, placeholder, onInputChange, onSearch, id }: SearchBarProps) => (
  <SearchWrapper>
    <SearchIcon>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </SearchIcon>
    <SearchInput
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onInputChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
    />
    <SearchButton type="button" onClick={onSearch} aria-label="Search">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SearchButton>
  </SearchWrapper>
)

export default SearchBar
