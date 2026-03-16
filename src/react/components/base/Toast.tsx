import React, { useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
`

type ToastType = 'success' | 'error'

type ToastState = {
  message: string
  type: ToastType
  id: string
  leaving: boolean
}

const randomSuffix = () => Math.random().toString(36).slice(2, 5)

const DURATION_MS = 3000
const FADE_MS = 300

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const show = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${randomSuffix()}`
    setToasts((current) => [...current, { message, type, id, leaving: false }])

    setTimeout(() => {
      setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    }, DURATION_MS - FADE_MS)

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, DURATION_MS)
  }, [])

  const showSuccess = useCallback((message: string) => show(message, 'success'), [show])
  const showError = useCallback((message: string) => show(message, 'error'), [show])

  const Toast =
    toasts.length > 0 ? (
      <ToastStack>
        {toasts.map((t) => (
          <ToastItem key={t.id} $type={t.type} $leaving={t.leaving}>
            <Icon>{t.type === 'success' ? '✓' : '✕'}</Icon>
            {t.message}
          </ToastItem>
        ))}
      </ToastStack>
    ) : null

  return { showSuccess, showError, Toast }
}

const fadeOut = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(20px); }
`

const ToastStack = styled.div`
  position: fixed;
  bottom: 4rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  z-index: 9999;
  pointer-events: none;
`

const ToastItem = styled.div<{ $type: ToastType; $leaving: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 1.3rem;
  font-weight: 500;
  white-space: nowrap;
  animation: ${({ $leaving }) => ($leaving ? fadeOut : slideIn)} ${({ $leaving }) => ($leaving ? FADE_MS : 200)}ms
    ease-out forwards;

  background: ${({ $type }) => ($type === 'success' ? '#1a3a2a' : '#3a1a1a')};
  border: 1px solid ${({ $type }) => ($type === 'success' ? '#2d6a4a' : '#6a2d2d')};
  color: ${({ $type }) => ($type === 'success' ? '#4caf7d' : '#e05c5c')};
`

const Icon = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
`
