import SignedDataVerifierFactory from './SignedDataVerifierFactory'

export type AppleTransactionPayload = {
  originalTransactionId: string
  productId: string
  expiresDate: number | undefined
}

export interface IAppleTransactionVerifier {
  verify: (jws: string) => Promise<AppleTransactionPayload | null>
}

class AppleTransactionVerifier implements IAppleTransactionVerifier {
  private readonly factory: SignedDataVerifierFactory

  constructor() {
    this.factory = new SignedDataVerifierFactory()
  }

  verify = async (jws: string): Promise<AppleTransactionPayload | null> => {
    const decoded = await this.factory.verify((v) => v.verifyAndDecodeTransaction(jws))
    if (!decoded?.originalTransactionId || !decoded?.productId) return null
    return {
      originalTransactionId: decoded.originalTransactionId,
      productId: decoded.productId,
      expiresDate: decoded.expiresDate,
    }
  }
}

export default AppleTransactionVerifier
