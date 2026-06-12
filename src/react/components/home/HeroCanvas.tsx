import React from 'react'
import styled, { css, keyframes } from 'styled-components'

const auraDrift = keyframes`
  0%   { opacity: 0.65; transform: scale(1) translate(0, 0); }
  50%  { opacity: 1;    transform: scale(1.1) translate(2%, 3%); }
  100% { opacity: 0.7;  transform: scale(0.95) translate(-2%, -1%); }
`

const floatA = keyframes`
  from { transform: rotate(-14deg) translateY(0); }
  to   { transform: rotate(-10deg) translateY(-22px); }
`

const floatB = keyframes`
  from { transform: rotate(9deg) translateY(0); }
  to   { transform: rotate(13deg) translateY(-17px); }
`

const floatC = keyframes`
  from { transform: rotate(20deg) translateY(0); }
  to   { transform: rotate(16deg) translateY(-25px); }
`

const floatD = keyframes`
  from { transform: rotate(-21deg) translateY(0); }
  to   { transform: rotate(-17deg) translateY(-13px); }
`

const holoSweep = keyframes`
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
`

const Canvas = styled.section`
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 9rem 1.5rem 5rem;
  box-sizing: border-box;

  /* Escape ResponsiveLayout padding to go full-width */
  width: 100vw;
  margin-left: calc(-50vw + 50%);
`

const Orb = styled.div<{ $hue: string; $left: string; $top: string; $size: string; $delay?: string }>`
  position: absolute;
  left: ${(p) => p.$left};
  top: ${(p) => p.$top};
  width: ${(p) => p.$size};
  height: ${(p) => p.$size};
  border-radius: 50%;
  background: ${(p) => p.$hue};
  filter: blur(100px);
  animation: ${auraDrift} 14s ease-in-out infinite alternate;
  animation-delay: ${(p) => p.$delay ?? '0s'};
  pointer-events: none;
`

const ghostBase = css`
  position: absolute;
  border-radius: 10px;
  border: 1px solid rgba(232, 160, 20, 0.12);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(232, 160, 20, 0.04));

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: linear-gradient(
      108deg,
      transparent 22%,
      rgba(232, 160, 20, 0.06) 42%,
      rgba(255, 215, 80, 0.12) 50%,
      rgba(232, 160, 20, 0.06) 58%,
      transparent 78%
    );
    background-size: 230% 100%;
    animation: ${holoSweep} 4.5s ease-in-out infinite alternate;
  }
`

const CardA = styled.div`
  ${ghostBase}
  width: 116px;
  height: 162px;
  left: 5%;
  top: 20%;
  animation: ${floatA} 4.4s ease-in-out infinite alternate;
`

const CardB = styled.div`
  ${ghostBase}
  width: 97px;
  height: 136px;
  left: 10%;
  top: 54%;
  opacity: 0.5;
  animation: ${floatB} 3.9s ease-in-out infinite alternate;
  animation-delay: -1.4s;
  &::after {
    animation-delay: -0.9s;
    animation-duration: 5.2s;
  }
  @media (max-width: 650px) {
    display: none;
  }
`

const CardC = styled.div`
  ${ghostBase}
  width: 122px;
  height: 170px;
  right: 5%;
  top: 18%;
  animation: ${floatC} 4.8s ease-in-out infinite alternate;
  animation-delay: -0.6s;
  &::after {
    animation-delay: -1.8s;
    animation-duration: 3.9s;
  }
`

const CardD = styled.div`
  ${ghostBase}
  width: 90px;
  height: 126px;
  right: 11%;
  top: 57%;
  opacity: 0.45;
  animation: ${floatD} 3.5s ease-in-out infinite alternate;
  animation-delay: -2.2s;
  &::after {
    animation-delay: -0.4s;
    animation-duration: 4.3s;
  }
  @media (max-width: 650px) {
    display: none;
  }
`

const HeroCanvas = ({ children }: { children: React.ReactNode }) => (
  <Canvas>
    <Orb $hue="rgba(232,160,20,0.13)" $left="8%" $top="15%" $size="42vw" />
    <Orb $hue="rgba(30,60,180,0.07)" $left="60%" $top="55%" $size="38vw" $delay="-5s" />

    <CardA />
    <CardB />
    <CardC />
    <CardD />

    {children}
  </Canvas>
)

export default HeroCanvas
