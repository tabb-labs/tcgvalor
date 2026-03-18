import { CatalogDto } from '@core/network-types/catalog'
import { IPokemonExpansionFactory } from '@domain/PokemonExpansionFactory'
import { IPokemonCardFactory } from '@domain/PokemonCardFactory'
import { Result } from '@use-cases/Result'
import { IPricesForExpansionUseCase } from '../price/PricesForExpansionUseCase'
import Logger from '../../logger'

class GetCatalogUseCase {
  private readonly pokemonExpansionFactory: IPokemonExpansionFactory
  private readonly pokemonCardFactory: IPokemonCardFactory
  private readonly pricesForExpansionUseCase: IPricesForExpansionUseCase

  constructor(
    pokemonExpansionFactory: IPokemonExpansionFactory,
    pokemonCardFactory: IPokemonCardFactory,
    pricesForExpansionUseCase: IPricesForExpansionUseCase
  ) {
    this.pokemonExpansionFactory = pokemonExpansionFactory
    this.pokemonCardFactory = pokemonCardFactory
    this.pricesForExpansionUseCase = pricesForExpansionUseCase
  }

  call = async (cardTraderExpansionId: number, userId?: number): Promise<Result<CatalogDto>> => {
    const [pokemonCards, expansion] = await Promise.all([
      this.pokemonCardFactory.makeList(cardTraderExpansionId, userId),
      this.pokemonExpansionFactory.make(cardTraderExpansionId),
    ])

    this.pricesForExpansionUseCase.call(cardTraderExpansionId).catch((e) => {
      Logger.error(`GetCatalogUseCase: failed to store prices for expansion ${cardTraderExpansionId}: ${e}`)
    })

    const cards = pokemonCards.map((c) => c.toCardDto())
    const details = expansion ? expansion.toExpansionDetailsDto(pokemonCards) : null

    return Result.success({ details, cards })
  }
}

export default GetCatalogUseCase
