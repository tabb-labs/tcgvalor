import { Router } from 'express'
import GetCatalogUseCase from '../use-cases/catalog/GetCatalogUseCase'
import SearchCatalogByNameUseCase from '../use-cases/catalog/SearchCatalogByNameUseCase'
import UserCardRepo from '../repository/UserCardRepo'
import CardTraderClient from '../clients/CardTrader/CardTraderClient'
import Store from '../StoreRegistry'
import ExpansionPokemonRepo from '../repository/ExpansionPokemonRepo'
import CardBlueprintPokemonRepo from '../repository/CardBlueprintPokemonRepo'
import CardBlueprintMarketValueRepo from '../repository/CardBlueprintMarketValueRepo'
import PokemonCardFactory from '../domain/PokemonCardFactory'
import PokemonExpansionFactory from '../domain/PokemonExpansionFactory'
import GetBlueprintValueUseCase from '../use-cases/price/GetBlueprintValueUseCase'
import { asyncHandler } from '../http/asyncHandler'

const CatalogController = Router()

CatalogController.get('/', (_, res) => {
  res.sendData({ data: Store.expansions.getState() })
})

CatalogController.get(
  '/search',
  asyncHandler(async (req, res) => {
    const name = req.query.name as string | undefined
    if (!name || name.trim().length < 2) {
      res.sendError({ errors: ['name query param must be at least 2 characters'] })
      return
    }

    const searchUseCase = new SearchCatalogByNameUseCase(new CardBlueprintPokemonRepo())
    const cards = await searchUseCase.call(name.trim(), req.currentUser?.id)
    res.sendData({ data: cards })
  })
)

CatalogController.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const expansionId = +req.params.id
    if (!expansionId) {
      res.sendError({ errors: [`${req.params.id} is not a valid expansion id`] })
      return
    }

    const cardTraderClient = new CardTraderClient()
    const pokemonCardFactory = new PokemonCardFactory(
      new CardBlueprintPokemonRepo(),
      cardTraderClient,
      new CardBlueprintMarketValueRepo(),
      new GetBlueprintValueUseCase(cardTraderClient),
      new UserCardRepo()
    )
    const pokemonExpansionFactory = new PokemonExpansionFactory(new ExpansionPokemonRepo())
    const getCatalogUseCase = new GetCatalogUseCase(pokemonExpansionFactory, pokemonCardFactory)

    const result = await getCatalogUseCase.call(expansionId, req.currentUser?.id)
    if (result.isSuccess()) {
      res.sendData({ data: result.value })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

export default CatalogController
