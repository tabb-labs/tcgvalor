import React, { useEffect } from 'react'
import { createContext, useContext } from 'react'
import { ChildrenProp } from '../types/ChildrenProp'
import { ExpansionDto } from '@core/network-types/catalog'
import { useExpansionsData } from '../network/catalogClient'
import { useToastContext } from './ToastProvider'

export type ExpansionContextType = {
  expansions: ExpansionDto[] | null
  isLoading: boolean
}

const ProfileContext = createContext<ExpansionContextType>({
  expansions: [],
  isLoading: false,
})

export const useExpansionProvider = () => {
  const { data, isLoading, errors } = useExpansionsData()
  const { showError } = useToastContext()

  useEffect(() => {
    if (errors) showError('Failed to load expansions')
  }, [errors])

  return {
    expansions: data,
    isLoading,
  }
}

export const ExpansionContextProvider = ({ children }: ChildrenProp) => {
  const value = useExpansionProvider()

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useExpansion = (): ExpansionContextType => {
  return useContext(ProfileContext)
}
