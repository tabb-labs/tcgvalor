import OwnedPricesUpdater from '../../../src/server/cron-jobs/OwnedPricesUpdater'
import CardBlueprintMarketValueRepo_FAKE from '../__FAKES__/CardBlueprintMarketValueRepo.fake'
import PricesForExpansion_FAKE from '../__FAKES__/PricesForExpansion.fake'

const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

describe('OwnedPricesUpdater', () => {
  let ownedPricesUpdater: OwnedPricesUpdater
  let cardBlueprintMarketValueRepo_FAKE: CardBlueprintMarketValueRepo_FAKE
  let pricesForExpansion_FAKE: PricesForExpansion_FAKE

  beforeEach(() => {
    jest.clearAllMocks()
    cardBlueprintMarketValueRepo_FAKE = new CardBlueprintMarketValueRepo_FAKE()
    pricesForExpansion_FAKE = new PricesForExpansion_FAKE()
    ownedPricesUpdater = new OwnedPricesUpdater(cardBlueprintMarketValueRepo_FAKE, pricesForExpansion_FAKE)
  })

  describe('refresh', () => {
    it('should fetch prices for each owned expansion', async () => {
      cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS.mockResolvedValue([1, 2, 3])

      ownedPricesUpdater.refresh()
      await flushPromises()

      expect(pricesForExpansion_FAKE.CALL).toHaveBeenCalledTimes(3)
      expect(pricesForExpansion_FAKE.CALL).toHaveBeenCalledWith(1)
      expect(pricesForExpansion_FAKE.CALL).toHaveBeenCalledWith(2)
      expect(pricesForExpansion_FAKE.CALL).toHaveBeenCalledWith(3)
    })

    it('should not call pricesForExpansion when there are no owned expansions', async () => {
      cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS.mockResolvedValue([])

      ownedPricesUpdater.refresh()
      await flushPromises()

      expect(pricesForExpansion_FAKE.CALL).not.toHaveBeenCalled()
    })

    it('should continue refreshing other expansions when one fails', async () => {
      cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS.mockResolvedValue([1, 2])
      pricesForExpansion_FAKE.CALL.mockRejectedValueOnce(new Error('CardTrader error'))

      ownedPricesUpdater.refresh()
      await flushPromises()

      expect(pricesForExpansion_FAKE.CALL).toHaveBeenCalledTimes(2)
    })
  })

  describe('start', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('should refresh when lastRun is null', async () => {
      cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS.mockResolvedValue([1])

      ownedPricesUpdater.start({ minutes: 1 }, 30_000)
      await jest.advanceTimersByTimeAsync(30_000)

      expect(cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS).toHaveBeenCalled()
    })

    it('should not refresh when not expired', async () => {
      ownedPricesUpdater.refresh()
      await jest.advanceTimersByTimeAsync(0)
      jest.clearAllMocks()

      ownedPricesUpdater.start({ minutes: 5 }, 30_000)
      await jest.advanceTimersByTimeAsync(30_000)

      expect(cardBlueprintMarketValueRepo_FAKE.LIST_OWNED_CARD_TRADER_EXPANSION_IDS).not.toHaveBeenCalled()
    })
  })
})
