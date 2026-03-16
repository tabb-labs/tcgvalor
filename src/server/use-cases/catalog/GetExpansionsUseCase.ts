import { PrismaClient } from '@prisma/client'
import { ExpansionDto } from '@core/network-types/catalog'
import { ICardTraderClient } from '../../clients/CardTrader/CardTraderClient'
import { IExpansionPokemonRepo } from '../../repository/ExpansionPokemonRepo'
import { CardExpansion } from '../../types/CardExpansion'
import { IExpansionSorter, SortableExpansion } from './ExpansionSorter'
import { Result } from '@use-cases/Result'

export interface IGetExpansionsUseCase {
  call: () => Promise<Result<ExpansionDto[]>>
}

class GetExpansionsUseCase implements IGetExpansionsUseCase {
  private readonly prisma: PrismaClient
  private readonly cardTraderClient: ICardTraderClient
  private readonly expansionSorter: IExpansionSorter
  private readonly expansionPokemonRepo: IExpansionPokemonRepo

  constructor(
    prisma: PrismaClient,
    cardTraderClient: ICardTraderClient,
    expansionSorter: IExpansionSorter,
    expansionPokemonRepo: IExpansionPokemonRepo
  ) {
    this.prisma = prisma
    this.cardTraderClient = cardTraderClient
    this.expansionSorter = expansionSorter
    this.expansionPokemonRepo = expansionPokemonRepo
  }

  call = async (): Promise<Result<ExpansionDto[]>> => {
    const pokemonExpansions = await this.cardTraderClient.getPokemonExpansions()

    const sortableExpansions = await this.getSortableExpansions(pokemonExpansions)

    const record = await this.prisma.expansionPokemonOrder.findFirst()
    if (!record) return Result.failure('Missing expansion order')

    const expansionOrder = {
      mainSeries: record.mainSeries as string[],
      otherSeries: record.otherSeries as string[],
    }

    const sortedExpansions = this.expansionSorter.sort(sortableExpansions, expansionOrder)

    const expansionDto: ExpansionDto[] = sortedExpansions.map((sortedExpansion) => ({
      name: sortedExpansion.cardExpansion.name,
      expansionId: sortedExpansion.cardExpansion.expansionId,
      symbol: sortedExpansion.expansionEntity?.symbolUrl ?? null,
      slug: this.formatSlug(sortedExpansion.cardExpansion.name),
    }))

    return Result.success(expansionDto)
  }

  private getSortableExpansions = async (pokemonExpansions: CardExpansion[]) => {
    const sortableExpansions: SortableExpansion[] = []

    for (let i = 0; i < pokemonExpansions.length; i++) {
      const cardExpansion = pokemonExpansions[i]
      const sortableExpansion: SortableExpansion = {
        cardExpansion,
        expansionEntity: await this.expansionPokemonRepo.find(cardExpansion.expansionId),
      }
      sortableExpansions.push(sortableExpansion)
    }

    return sortableExpansions
  }

  private formatSlug = (expansionName: string) => {
    const withHyphens = expansionName.replace(' ', '-')
    const onlyNumOrChar = withHyphens.replace(/[^a-zA-Z0-9|-]/g, '')
    return onlyNumOrChar.toLowerCase()
  }
}

export default GetExpansionsUseCase
