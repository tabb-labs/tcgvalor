import { Result } from '@use-cases/Result'
import { CollectionDto, CollectionQueryParams } from '@core/network-types/collection'
import { ICollectionFactory } from '../../domain/CollectionFactory'

class GetCollectionUseCase {
  private readonly collectionFactory: ICollectionFactory

  constructor(collectionFactory: ICollectionFactory) {
    this.collectionFactory = collectionFactory
  }

  call = async (userId: number, params: CollectionQueryParams): Promise<Result<CollectionDto>> => {
    const result = await this.collectionFactory.makePaginated(userId, params)
    return Result.success(result)
  }
}

export default GetCollectionUseCase
