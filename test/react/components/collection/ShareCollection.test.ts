import { renderHook } from '@testing-library/react'
import { useInShareCollection } from '../../../../src/react/components/collection/ShareCollection'
import { CARD_DTO } from '../../../core/__MOCKS__/card.mock'
import * as ProfileProviderModule from '../../../../src/react/providers/ProfileProvider'
import * as UseRouterModule from '../../../../src/react/router/useRouter'
import * as CollectionClientModule from '../../../../src/react/network/collectionClient'
import { USE_ROUTER_RETURN } from '../../__MOCKS__/useRouterReturn.mock'
import { PROFILE_CONTEXT_TYPE } from '../../__MOCKS__/profileContextType.mock'
import { ShareCollectionDto } from '@core/network-types/collection'
import { UseApiReturn } from '../../../../src/react/network/useApi'
import { COLLECTION_META_DTO, PAGINATION_DTO } from '../../../core/__MOCKS__/collection.mock'
import { PROFILE_DTO } from '../../../core/__MOCKS__/profile.mock'

const USE_PROFILE = jest.spyOn(ProfileProviderModule, 'useProfile')
const USE_ROUTER = jest.spyOn(UseRouterModule, 'useRouter')
const USE_SHARE_COLLECTION = jest.spyOn(CollectionClientModule, 'useShareCollection')

const USE_SHARE_COLLECTION_RETURN: UseApiReturn<ShareCollectionDto> = {
  data: null,
  isLoading: false,
  errors: null,
  refresh: jest.fn(),
}

const CARDS = [CARD_DTO, CARD_DTO]

const SHARE_COLLECTION_DTO: ShareCollectionDto = {
  meta: COLLECTION_META_DTO,
  cards: [],
  pagination: PAGINATION_DTO,
  name: '',
}

const GET_PARAM = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  USE_ROUTER.mockReturnValue(USE_ROUTER_RETURN)
  USE_PROFILE.mockReturnValue(PROFILE_CONTEXT_TYPE)
  USE_SHARE_COLLECTION.mockReturnValue(USE_SHARE_COLLECTION_RETURN)
})

describe('Use In Share Collection', () => {
  it('should return cards and details', () => {
    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      data: { ...SHARE_COLLECTION_DTO, cards: CARDS, meta: { ...COLLECTION_META_DTO, cardsInCollection: 2 } },
    })
    const { result } = renderHook(useInShareCollection)

    expect(result.current.cards).toEqual(CARDS)
    expect(result.current.meta).toEqual({ ...COLLECTION_META_DTO, cardsInCollection: 2 })
  })

  it('should use router param for get share data', () => {
    const USER_ID = '123'

    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      profile: { ...PROFILE_DTO, id: Number(USER_ID) },
    })

    GET_PARAM.mockReturnValue(USER_ID)

    USE_ROUTER.mockReturnValue({ ...USE_ROUTER_RETURN, getParam: GET_PARAM })

    renderHook(useInShareCollection)

    expect(USE_SHARE_COLLECTION).toHaveBeenCalledWith(USER_ID, expect.any(Object))
  })

  it('should show user found view when collection exists', () => {
    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      isLoading: false,
    })

    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      data: { ...SHARE_COLLECTION_DTO, cards: CARDS, meta: { ...COLLECTION_META_DTO, cardsInCollection: 2 } },
    })

    const { result } = renderHook(useInShareCollection)

    expect(result.current.showUserFoundView).toBe(true)
    expect(result.current.showEditLink).toBe(false)
    expect(result.current.showNoUserFoundView).toBe(false)
    expect(result.current.showLoading).toBe(false)
  })

  it('should show loading when data is being fetched', () => {
    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      isLoading: true,
    })

    const { result } = renderHook(useInShareCollection)

    expect(result.current.showUserFoundView).toBe(false)
    expect(result.current.showEditLink).toBe(false)
    expect(result.current.showNoUserFoundView).toBe(false)
    expect(result.current.showLoading).toBe(true)
  })

  it('should show no use found when collection is empty', () => {
    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      isLoading: false,
    })

    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      data: { ...SHARE_COLLECTION_DTO, cards: [], meta: { ...COLLECTION_META_DTO, cardsInCollection: 0 } },
    })

    const { result } = renderHook(useInShareCollection)

    expect(result.current.showUserFoundView).toBe(false)
    expect(result.current.showEditLink).toBe(false)
    expect(result.current.showNoUserFoundView).toBe(true)
    expect(result.current.showLoading).toBe(false)
  })

  it('should show no results when search active but collection has cards', () => {
    USE_SHARE_COLLECTION.mockReturnValue({
      ...USE_SHARE_COLLECTION_RETURN,
      data: { ...SHARE_COLLECTION_DTO, cards: [], meta: { ...COLLECTION_META_DTO, cardsInCollection: 5 } },
    })

    const { result } = renderHook(useInShareCollection)

    expect(result.current.showNoResults).toBe(true)
    expect(result.current.showNoUserFoundView).toBe(false)
    expect(result.current.showUserFoundView).toBe(false)
  })

  it('should show edit link when collection belongs to logged in user ', () => {
    const SHARE_TOKEN = 'abc12345'

    USE_PROFILE.mockReturnValue({
      ...PROFILE_CONTEXT_TYPE,
      profile: { ...PROFILE_DTO, shareToken: SHARE_TOKEN },
    })

    GET_PARAM.mockReturnValue(SHARE_TOKEN)

    USE_ROUTER.mockReturnValue({ ...USE_ROUTER_RETURN, getParam: GET_PARAM })

    const { result } = renderHook(useInShareCollection)

    expect(result.current.showEditLink).toBe(true)
  })
})
