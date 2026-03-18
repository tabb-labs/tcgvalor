import { CatalogDto } from '@core/network-types/catalog'
import { IPokemonExpansionFactory } from '@domain/PokemonExpansionFactory'
import { IPokemonCardFactory } from '@domain/PokemonCardFactory'
import { Result } from '@use-cases/Result'

class GetCatalogUseCase {
  private readonly pokemonExpansionFactory: IPokemonExpansionFactory
  private readonly pokemonCardFactory: IPokemonCardFactory

  constructor(pokemonExpansionFactory: IPokemonExpansionFactory, pokemonCardFactory: IPokemonCardFactory) {
    this.pokemonExpansionFactory = pokemonExpansionFactory
    this.pokemonCardFactory = pokemonCardFactory
  }

  call = async (cardTraderExpansionId: number, userId?: number): Promise<Result<CatalogDto>> => {
    const [pokemonCards, expansion] = await Promise.all([
      this.pokemonCardFactory.makeList(cardTraderExpansionId, userId),
      this.pokemonExpansionFactory.make(cardTraderExpansionId),
    ])

    const cards = pokemonCards.map((c) => c.toCardDto())
    const details = expansion ? expansion.toExpansionDetailsDto(pokemonCards) : null

    return Result.success({ details, cards })
  }
}

export default GetCatalogUseCase
