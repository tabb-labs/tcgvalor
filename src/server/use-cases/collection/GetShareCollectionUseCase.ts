import { PrismaClient } from '@prisma/client'
import { CollectionQueryParams, ShareCollectionDto } from '@core/network-types/collection'
import { ICollectionFactory } from '../../domain/CollectionFactory'
import { Result } from '../Result'

class GetShareCollectionUseCase {
  private readonly prisma: PrismaClient
  private readonly collectionFactory: ICollectionFactory

  constructor(prisma: PrismaClient, collectionFactory: ICollectionFactory) {
    this.prisma = prisma
    this.collectionFactory = collectionFactory
  }

  call = async (userId: number, params: CollectionQueryParams): Promise<Result<ShareCollectionDto>> => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Result.failure('user not found')

    const { cards, meta, pagination } = await this.collectionFactory.makePaginated(userId, params)

    return Result.success({ cards, meta, pagination, name: user.name })
  }
}

export default GetShareCollectionUseCase
