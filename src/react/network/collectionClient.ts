import { AddUserCardBody, CollectionDto, ShareCollectionDto } from '@core/network-types/collection'
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

export const useUserCards = (isLoggedIn: boolean) => {
  return useApi<CollectionDto>({
    path: '/collection',
    shouldMakeRequest: isLoggedIn,
  })
}

export const useShareCollection = (userId: string) => {
  return useApi<ShareCollectionDto>({
    path: `/collection/${userId}`,
  })
}
