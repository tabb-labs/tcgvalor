import React, { createContext, useContext } from 'react'
import { ChildrenProp } from '../types/ChildrenProp'
import { useToast } from '../components/base/Toast'

type ToastContextType = {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
})

export const ToastContextProvider = ({ children }: ChildrenProp) => {
  const { showSuccess, showError, Toast } = useToast()
  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {Toast}
    </ToastContext.Provider>
  )
}

export const useToastContext = (): ToastContextType => {
  return useContext(ToastContext)
}
