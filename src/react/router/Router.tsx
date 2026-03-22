import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CatalogPage from '../pages/CatalogPage'
import CollectionPage from '../pages/CollectionPage'
import { getAuthReturnUrl } from './authReturnUrl'
import { useProfile } from '../providers/ProfileProvider'
import SpinnerPage from '../pages/SpinnerPage'
import ShareCollectionPage from '../pages/ShareCollectionPage'
import DeveloperNotesPage from '../pages/DeveloperNotesPage'
import SeriesPage from '../pages/SeriesPage'

const redirectToAuthReturnUrlUnlessMissing = () => {
  const authReturnUrl = getAuthReturnUrl()
  if (authReturnUrl) location.pathname = authReturnUrl
}

const Router = () => {
  const { isLoading } = useProfile()

  redirectToAuthReturnUrlUnlessMissing()

  if (isLoading) return <SpinnerPage />
  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/collection', element: <CollectionPage /> },
  { path: '/collection/:shareToken', element: <ShareCollectionPage /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/catalog/:expansionSlug', element: <CatalogPage /> },
  { path: '/series', element: <SeriesPage /> },
  { path: '/developer-notes', element: <DeveloperNotesPage /> },
  { path: '*', element: 'Page Not Found' },
])

export default Router
