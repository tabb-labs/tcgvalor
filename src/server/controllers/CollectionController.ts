import { Router } from 'express'
import {
  AddUserCardBodySchema,
  CollectionQueryParamsSchema,
  RemoveUserCardBodySchema,
} from '@core/network-types/collection'
import AddCardTraderCardUseCase from '../use-cases/collection/AddCardTraderCardUseCase'
import UserCardRepo from '../repository/UserCardRepo'
import ExpansionPokemonRepo from '../repository/ExpansionPokemonRepo'
import CardBlueprintPokemonRepo from '../repository/CardBlueprintPokemonRepo'
import CardBlueprintMarketValueRepo from '../repository/CardBlueprintMarketValueRepo'
import CardTraderClient from '../clients/CardTrader/CardTraderClient'
import GetCollectionUseCase from '../use-cases/collection/GetCollectionUseCase'
import GetShareCollectionUseCase from '../use-cases/collection/GetShareCollectionUseCase'
import CollectionFactory from '../domain/CollectionFactory'
import PricesForExpansionUseCase from '../use-cases/price/PricesForExpansionUseCase'
import { prisma } from '../../../prisma/prismaClient'
import { asyncHandler } from '../http/asyncHandler'
import { requiresAuthMiddleware } from '../http/requiresAuthMiddleware'

const CollectionController = Router()

CollectionController.get(
  '/',
  ...requiresAuthMiddleware,
  asyncHandler(async (req, res) => {
    const parsed = CollectionQueryParamsSchema.safeParse(req.query)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((i) => i.message), status: 400 })
      return
    }

    const collectionFactory = new CollectionFactory(new UserCardRepo())
    const getCollectionUseCase = new GetCollectionUseCase(collectionFactory)
    const result = await getCollectionUseCase.call(req.currentUser!.id, parsed.data)
    if (result.isSuccess()) {
      res.sendData({ data: result.value, status: 200 })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

CollectionController.get(
  '/:shareToken',
  asyncHandler(async (req, res) => {
    const parsed = CollectionQueryParamsSchema.safeParse(req.query)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((i) => i.message), status: 400 })
      return
    }
    const collectionFactory = new CollectionFactory(new UserCardRepo())
    const getShareCollectionUseCase = new GetShareCollectionUseCase(prisma, collectionFactory)
    const result = await getShareCollectionUseCase.call(req.params.shareToken, parsed.data)
    if (result.isSuccess()) {
      res.sendData({ data: result.value, status: 200 })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

CollectionController.post(
  '/',
  ...requiresAuthMiddleware,
  asyncHandler(async (req, res) => {
    const parsed = AddUserCardBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((issue) => issue.message), status: 400 })
      return
    }
    const cardTraderClient = new CardTraderClient()
    const cardBlueprintPokemonRepo = new CardBlueprintPokemonRepo()
    const addCardTraderCardUseCase = new AddCardTraderCardUseCase(
      prisma,
      cardTraderClient,
      new ExpansionPokemonRepo(),
      cardBlueprintPokemonRepo,
      new PricesForExpansionUseCase(cardTraderClient, cardBlueprintPokemonRepo, new CardBlueprintMarketValueRepo())
    )
    const result = await addCardTraderCardUseCase.call(
      req.currentUser!.id,
      parsed.data.blueprintId,
      parsed.data.expansionId,
      'UNKNOWN'
    )
    if (result.isSuccess()) {
      res.sendSuccess({ status: 201 })
    } else {
      res.sendError({ errors: [result.error], status: 409 })
    }
  })
)

CollectionController.delete(
  '/',
  ...requiresAuthMiddleware,
  asyncHandler(async (req, res) => {
    const parsed = RemoveUserCardBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((issue) => issue.message), status: 400 })
      return
    }
    await prisma.userCard.delete({ where: { id: parsed.data.userCardId, userId: req.currentUser!.id } })
    res.sendSuccess()
  })
)

export default CollectionController
