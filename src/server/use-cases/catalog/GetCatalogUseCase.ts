import { CatalogDto } from '@core/network-types/catalog'
import { IUserCardRepo } from '../../repository/UserCardRepo'
import { IPokemonExpansionFactory } from '@domain/PokemonExpansionFactory'
import { IPokemonCardFactory } from '@domain/PokemonCardFactory'
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

  call = async (cardTraderExpansionId: number, userId?: number): Promise<Result<CatalogDto>> => {
    const [pokemonCards, expansion] = await Promise.all([
      this.pokemonCardFactory.makeList(cardTraderExpansionId),
      this.pokemonExpansionFactory.make(cardTraderExpansionId),
    ])

    const userCards = userId ? await this.userCardRepo.listByExpansion(userId, cardTraderExpansionId) : []

    const cards = pokemonCards.map((c) => c.toCardDto(userCards))
    const details = expansion ? expansion.toExpansionDetailsDto(pokemonCards) : null

    return Result.success({ details, cards })
  }
}

export default GetCatalogUseCase
