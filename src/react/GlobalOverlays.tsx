import React from 'react'
import GlobalPopup from './GlobalPopup'
import { useGlobalPopup } from './providers/GlobalPopupProvider'
import IosAppBanner from './components/navigation/IosAppBanner'

const GlobalOverlays = () => {
  const { popupBind, children } = useGlobalPopup()
  return (
    <>
      <GlobalPopup bind={popupBind}>{children}</GlobalPopup>
      <IosAppBanner />
    </>
  )
}

export default GlobalOverlays
