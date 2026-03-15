import { Router } from 'express'
import GetCatalogUseCase from '../use-cases/catalog/GetCatalogUseCase'
import UserCardRepo from '../repository/UserCardRepo'
import CardTraderClient from '../clients/CardTrader/CardTraderClient'
import Store from '../StoreRegistry'
import ExpansionPokemonRepo from '../repository/ExpansionPokemonRepo'
import CardBlueprintPokemonRepo from '../repository/CardBlueprintPokemonRepo'
import PokemonCardFactory from '../domain/PokemonCardFactory'
import PokemonExpansionFactory from '../domain/PokemonExpansionFactory'
import { asyncHandler } from '../http/asyncHandler'

const CatalogController = Router()

CatalogController.get('/', (_, res) => {
  res.sendData({ data: Store.expansions.getState() })
})

CatalogController.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const expansionId = +req.params.id
    if (!expansionId) {
      res.sendError({ errors: [`${req.params.id} is not a valid expansion id`] })
      return
    }

    const pokemonCardFactory = new PokemonCardFactory(
      new CardBlueprintPokemonRepo(),
      new CardTraderClient(),
      Store.blueprintValues.getState()
    )
    const pokemonExpansionFactory = new PokemonExpansionFactory(new ExpansionPokemonRepo())
    const getCatalogUseCase = new GetCatalogUseCase(new UserCardRepo(), pokemonExpansionFactory, pokemonCardFactory)

    const result = await getCatalogUseCase.call(expansionId, req.currentUser?.id)
    if (result.isSuccess()) {
      res.sendData({ data: result.value })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

export default CatalogController
