import {
  AddUserCardBody,
  CollectionDto,
  CollectionQueryParams,
  ShareCollectionDto,
} from '@core/network-types/collection'
import { fetchApi } from './fetchApi'
import { useApi } from './useApi'

export const addUserCard = async (addUserCardBody: AddUserCardBody) => {
  await fetchApi({ path: '/collection', method: 'POST', body: addUserCardBody })
}

export const removeUserCard = async (userCardId: number) => {
  await fetchApi({
    path: '/collection',
    method: 'DELETE',
    body: { userCardId },
  })
}

export const useUserCards = (isLoggedIn: boolean, params: CollectionQueryParams) => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    ...(params.search ? { search: params.search } : {}),
  })

  return useApi<CollectionDto>({
    path: `/collection?${query.toString()}`,
    shouldMakeRequest: isLoggedIn,
  })
}

export const useShareCollection = (userId: string, params: CollectionQueryParams) => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    ...(params.search ? { search: params.search } : {}),
  })

  return useApi<ShareCollectionDto>({
    path: `/collection/${userId}?${query.toString()}`,
  })
}
