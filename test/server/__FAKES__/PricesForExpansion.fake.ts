import { IPricesForExpansionUseCase } from '../../../src/server/use-cases/price/PricesForExpansionUseCase'

class PricesForExpansion_FAKE implements IPricesForExpansionUseCase {
  CALL = jest.fn().mockResolvedValue(undefined)

  call = this.CALL
}

export default PricesForExpansion_FAKE
