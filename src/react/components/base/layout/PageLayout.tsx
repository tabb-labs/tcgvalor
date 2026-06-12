import React from 'react'
import { ChildrenProp } from '../../../types/ChildrenProp'
import styled, { css } from 'styled-components'
import Navigation from '../../navigation/Navigation'
import Footer from '../../Footer'
import { ResponsiveLayout } from './ResponsiveLayout'

const FOOTER_HEIGHT = '2.8rem'

const Wrapper = styled.div<{ $fullHeight?: boolean }>`
  ${({ $fullHeight }) =>
    $fullHeight &&
    css`
      height: 100dvh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `}
`

const Content = styled(ResponsiveLayout)<{ $fullHeight?: boolean }>`
  ${({ $fullHeight }) =>
    $fullHeight
      ? css`
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        `
      : css`
          margin-bottom: ${FOOTER_HEIGHT};
        `}
`

const FooterContainer = styled.footer<{ $fullHeight?: boolean }>`
  height: ${FOOTER_HEIGHT};

  ${({ $fullHeight }) =>
    !$fullHeight &&
    css`
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    `}
`

type PageLayoutProps = ChildrenProp & { fullHeight?: boolean }

const PageLayout = ({ children, fullHeight }: PageLayoutProps) => {
  const isFullHeight = !!fullHeight
  return (
    <Wrapper $fullHeight={isFullHeight}>
      <Navigation />
      <Content $fullHeight={isFullHeight}>{children}</Content>
      <FooterContainer $fullHeight={isFullHeight}>
        <Footer />
      </FooterContainer>
    </Wrapper>
  )
}

export default PageLayout
