import React, { useState } from 'react'
import styled from 'styled-components'

const APP_STORE_URL = 'https://apps.apple.com/us/app/tcgvalor/id6768466615'
const DISMISSED_KEY = 'ios-app-banner-dismissed'

const isNonSafariIos = () => {
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  return isIos && !isSafari
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.staticColor.gray_900};
  border-top: 1px solid ${({ theme }) => theme.staticColor.gold_400};
`

const Icon = styled.img`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 8px;
  flex-shrink: 0;
`

const Text = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`

const Title = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.staticColor.gray_50};
`

const Subtitle = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.staticColor.gray_400};
`

const GetButton = styled.a`
  padding: 0.7rem 1.6rem;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.staticColor.gold_400};
  color: ${({ theme }) => theme.staticColor.gray_900};
  font-weight: 600;
  font-size: 1.3rem;
  text-decoration: none;
  white-space: nowrap;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  color: ${({ theme }) => theme.staticColor.gray_400};
`

const IosAppBanner = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')

  if (dismissed || !isNonSafariIos()) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Bar>
      <Icon src="/images/favicon.png" alt="TCG Valor" />
      <Text>
        <Title>TCG Valor</Title>
        <Subtitle>Get the app for the best experience</Subtitle>
      </Text>
      <GetButton href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
        View
      </GetButton>
      <CloseButton onClick={handleDismiss} aria-label="Dismiss">
        ✕
      </CloseButton>
    </Bar>
  )
}

export default IosAppBanner
