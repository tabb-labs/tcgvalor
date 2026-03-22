import { PrismaClient } from '@prisma/client'
import { CollectionQueryParams, ShareCollectionDto } from '@core/network-types/collection'
import { ICollectionFactory } from '../../domain/CollectionFactory'
import { Result } from '../Result'
import { encodeShareToken } from './ShareToken'

class GetShareCollectionUseCase {
  private readonly prisma: PrismaClient
  private readonly collectionFactory: ICollectionFactory

  constructor(prisma: PrismaClient, collectionFactory: ICollectionFactory) {
    this.prisma = prisma
    this.collectionFactory = collectionFactory
  }

  call = async (shareToken: string, params: CollectionQueryParams): Promise<Result<ShareCollectionDto>> => {
    const users = await this.prisma.user.findMany({ select: { id: true, nickname: true } })
    const user = users.find((u) => encodeShareToken(u.id) === shareToken)
    if (!user) return Result.failure('user not found')

    const { cards, meta, pagination } = await this.collectionFactory.makePaginated(user.id, params)

    return Result.success({ cards, meta, pagination, name: user.nickname || 'Trader' })
  }
}

export default GetShareCollectionUseCase
