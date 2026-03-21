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
