import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const HeroFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
`

const PageBackground = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 15% 10%, rgba(232, 160, 20, 0.06), transparent),
    radial-gradient(circle at 80% 70%, rgba(30, 60, 180, 0.05), transparent), #060710;
  z-index: -1;
`

const Grain = styled.div`
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
`

const HeroBackground = () => (
  <>
    <HeroFonts />
    <PageBackground />
    <Grain />
  </>
)

export default HeroBackground
