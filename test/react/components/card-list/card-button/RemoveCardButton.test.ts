/* eslint-disable @typescript-eslint/await-thenable */
import { act, renderHook } from '@testing-library/react'
import * as CollectionsClientModule from '../../../../../src/react/network/collectionClient'
import { useInRemoveCardButton } from '../../../../../src/react/components/card-list/card-button/RemoveCardButton'

const REMOVE_USER_CARD = jest.spyOn(CollectionsClientModule, 'removeUserCard')
const REFRESH = jest.fn()

const USER_CARD_ID = 1234

REMOVE_USER_CARD.mockResolvedValue()

beforeEach(jest.clearAllMocks)

describe('Use In Remove Card Button', () => {
  it('should set loading to false and set showCheckmark to true after remove my card completes', async () => {
    const { result } = renderHook(() => useInRemoveCardButton([USER_CARD_ID], REFRESH))

    await act(async () => await result.current.click())

    expect(REFRESH).toHaveBeenCalled()
    expect(REMOVE_USER_CARD).toHaveBeenCalledWith(USER_CARD_ID)

    expect(result.current.shouldShowCheckmark).toEqual(true)
    expect(result.current.shouldShowLoading).toEqual(false)
    expect(result.current.isDisabled).toEqual(true)
    expect(result.current.title).toEqual('Remove')
  })

  it('should be disabled when userCardIds is empty', () => {
    const { result } = renderHook(() => useInRemoveCardButton([], REFRESH))

    expect(result.current.isDisabled).toEqual(true)
  })

  it('should NOT be disabled when userCardIds has entries', () => {
    const { result } = renderHook(() => useInRemoveCardButton([USER_CARD_ID], REFRESH))

    expect(result.current.isDisabled).toEqual(false)
  })
})
