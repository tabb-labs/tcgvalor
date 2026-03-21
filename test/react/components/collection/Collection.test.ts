/* eslint-disable @typescript-eslint/await-thenable */
import { act, renderHook } from '@testing-library/react'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'
import * as UserCardClient from '../../../../src/react/network/collectionClient'
import { useInCollection } from '../../../../src/react/components/collection/Collection'
import { UseApiReturn } from '../../../../src/react/network/useApi'
import { CollectionDto } from '@core/network-types/collection'
import * as ProfileProviderModule from '../../../../src/react/providers/ProfileProvider'
import { PROFILE_CONTEXT_TYPE } from '../../__MOCKS__/profileContextType.mock'
import { COLLECTION_META_DTO, PAGINATION_DTO } from '../../../core/__MOCKS__/collection.mock'
import { PROFILE_DTO } from '../../../core/__MOCKS__/profile.mock'
import * as UseRouterModule from '../../../../src/react/router/useRouter'
import { USE_ROUTER_RETURN } from '../../__MOCKS__/useRouterReturn.mock'

const CARDS = [CARD_DTO, CARD_DTO]

const COLLECTION_DTO: CollectionDto = {
  cards: CARDS,
  meta: COLLECTION_META_DTO,
  pagination: PAGINATION_DTO,
}

const REFRESH = jest.fn()
const USE_USER_CARDS = jest.spyOn(UserCardClient, 'useUserCards')

const USE_USER_CARDS_RETURN: UseApiReturn<CollectionDto> = {
  data: null,
  isLoading: false,
  errors: null,
  refresh: REFRESH,
}
USE_USER_CARDS.mockReturnValue(USE_USER_CARDS_RETURN)

const USE_PROFILE = jest.spyOn(ProfileProviderModule, 'useProfile')
USE_PROFILE.mockReturnValue(PROFILE_CONTEXT_TYPE)

const USE_ROUTER = jest.spyOn(UseRouterModule, 'useRouter')
USE_ROUTER.mockReturnValue(USE_ROUTER_RETURN)

beforeEach(jest.clearAllMocks)

describe('Use In Collection', () => {
  it('should init as empty array', () => {
    USE_USER_CARDS.mockReturnValue(USE_USER_CARDS_RETURN)
    const { result } = renderHook(useInCollection)
    expect(result.current.cardListProps.cardsDto).toEqual([])
  })

  it('should return cards when available', () => {
    USE_USER_CARDS.mockReturnValue({
      ...USE_USER_CARDS_RETURN,
      data: COLLECTION_DTO,
    })
    const { result } = renderHook(useInCollection)
    expect(result.current.cardListProps.cardsDto).toEqual(CARDS)
  })

  it('should trigger refresh', () => {
    const { result } = renderHook(useInCollection)
    act(() => {
      if (result.current.cardListProps.refreshCards) result.current.cardListProps.refreshCards()
    })
    expect(REFRESH).toHaveBeenCalled()
  })

  it('should build share link path', () => {
    const USER_ID = '123'
    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      profile: { ...PROFILE_DTO, id: Number(USER_ID) },
    })
    const { result } = renderHook(useInCollection)

    expect(result.current.shareLinkPath).toEqual('/collection/123')
  })

  it('should show not logged in when use is not logged in', () => {
    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      isLoggedIn: false,
      isLoading: false,
    })
    USE_USER_CARDS.mockReturnValue({ ...USE_USER_CARDS_RETURN, isLoading: false })

    const { result } = renderHook(useInCollection)
    expect(result.current.showNotLoggedIn).toEqual(true)
    expect(result.current.showNoCollection).toEqual(false)
    expect(result.current.showLoading).toEqual(false)
    expect(result.current.showCollection).toEqual(false)
  })

  it('should show no items when user is logged in and NO items exist', () => {
    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      isLoggedIn: true,
      isLoading: false,
    })
    USE_USER_CARDS.mockReturnValue({ ...USE_USER_CARDS_RETURN, isLoading: false })

    const { result } = renderHook(useInCollection)
    expect(result.current.showNotLoggedIn).toEqual(false)
    expect(result.current.showNoCollection).toEqual(true)
    expect(result.current.showLoading).toEqual(false)
    expect(result.current.showCollection).toEqual(false)
  })

  it('should show loading when data is loading', () => {
    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      isLoggedIn: false,
      isLoading: true,
    })
    USE_USER_CARDS.mockReturnValue({
      ...USE_USER_CARDS_RETURN,
      isLoading: true,
    })

    const { result } = renderHook(useInCollection)
    expect(result.current.showNotLoggedIn).toEqual(false)
    expect(result.current.showNoCollection).toEqual(false)
    expect(result.current.showLoading).toEqual(true)
    expect(result.current.showCollection).toEqual(false)
  })

  it('should show collection', () => {
    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      isLoggedIn: true,
      isLoading: false,
    })
    USE_USER_CARDS.mockReturnValue({
      ...USE_USER_CARDS_RETURN,
      isLoading: false,
      data: { ...COLLECTION_DTO, meta: { ...COLLECTION_META_DTO, cardsInCollection: 2 } },
    })

    const { result } = renderHook(useInCollection)
    expect(result.current.showNotLoggedIn).toEqual(false)
    expect(result.current.showNoCollection).toEqual(false)
    expect(result.current.showLoading).toEqual(false)
    expect(result.current.showCollection).toEqual(true)
  })
})
