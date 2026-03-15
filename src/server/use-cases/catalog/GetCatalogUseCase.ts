import { CatalogDto, ExpansionPriceDetailsDto } from '@core/network-types/catalog'
import { CardDto } from '@core/network-types/card'
import { IUserCardRepo } from '../../repository/UserCardRepo'
import { BlueprintValue } from '../../types/BlueprintValue'
import { IPokemonExpansionFactory } from '@domain/PokemonExpansionFactory'
import { IPokemonCardFactory } from '@domain/PokemonCardFactory'
import UserCardStack from '@domain/UserCardStack'
import { Result } from '@use-cases/Result'

class GetCatalogUseCase {
  private readonly userCardRepo: IUserCardRepo
  private readonly pokemonExpansionFactory: IPokemonExpansionFactory
  private readonly pokemonCardFactory: IPokemonCardFactory

  constructor(
    userCardRepo: IUserCardRepo,
    pokemonExpansionFactory: IPokemonExpansionFactory,
    pokemonCardFactory: IPokemonCardFactory
  ) {
    this.userCardRepo = userCardRepo
    this.pokemonExpansionFactory = pokemonExpansionFactory
    this.pokemonCardFactory = pokemonCardFactory
  }

  call = async (
    cardTraderExpansionId: number,
    blueprintValues: Map<string, BlueprintValue>,
    userId?: number
  ): Promise<Result<CatalogDto>> => {
    const [postgresCards, expansion] = await Promise.all([
      this.pokemonCardFactory.fromPostgres(cardTraderExpansionId),
      this.pokemonExpansionFactory.fromPostgres(cardTraderExpansionId),
    ])

    const pokemonCards =
      postgresCards.length > 0 ? postgresCards : await this.pokemonCardFactory.fromCardTrader(cardTraderExpansionId)

    let userCardStack: UserCardStack | undefined

    if (userId) {
      const userCards = await this.userCardRepo.listByExpansion(userId, cardTraderExpansionId)
      userCardStack = new UserCardStack(userCards)
    }

    const cards = pokemonCards.map((c) => c.toCardDto(blueprintValues, userCardStack))
    const details = expansion ? expansion.toExpansionDetailsDto(this.buildExpansionPriceDetails(cards)) : null

    return Result.success({ details, cards })
  }

  private buildExpansionPriceDetails = (cards: CardDto[]): ExpansionPriceDetailsDto => {
    return cards.reduce(
      (acc, { medianMarketValueCents: v }) => {
        if (v >= 1 && v <= 49_99) acc.zeroToFifty++
        else if (v >= 50_00 && v <= 99_99) acc.fiftyToOneHundred++
        else if (v >= 100_00 && v <= 199_99) acc.oneHundredTwoHundred++
        else if (v >= 200_00) acc.twoHundredPlus++
        return acc
      },
      { zeroToFifty: 0, fiftyToOneHundred: 0, oneHundredTwoHundred: 0, twoHundredPlus: 0 }
    )
  }
}

export default GetCatalogUseCase
