import { Router } from 'express'
import { AddUserCardBodySchema, RemoveUserCardBodySchema } from '@core/network-types/collection'
import AddCardTraderCardUseCase from '../use-cases/collection/AddCardTraderCardUseCase'
import UserCardRepo from '../repository/UserCardRepo'
import ExpansionPokemonRepo from '../repository/ExpansionPokemonRepo'
import CardBlueprintPokemonRepo from '../repository/CardBlueprintPokemonRepo'
import CardTraderClient from '../clients/CardTrader/CardTraderClient'
import GetCollectionUseCase from '../use-cases/collection/GetCollectionUseCase'
import Store from '../StoreRegistry'
import RemoveCardUseCase from '../use-cases/collection/RemoveCardUseCase'
import GetShareCollectionUseCase from '../use-cases/collection/GetShareCollectionUseCase'
import CollectionFactory from '../domain/CollectionFactory'
import { prisma } from '../../../prisma/prismaClient'
import { asyncHandler } from '../http/asyncHandler'
import { requiresAuth } from 'express-openid-connect'

const CollectionController = Router()

CollectionController.get(
  '/',
  requiresAuth(),
  asyncHandler(async (req, res) => {
    const collectionFactory = new CollectionFactory(new UserCardRepo(), Store.blueprintValues.getState())
    const getCollectionUseCase = new GetCollectionUseCase(collectionFactory)
    const result = await getCollectionUseCase.call(req.currentUser!.id)
    if (result.isSuccess()) {
      res.sendData({ data: result.value, status: 200 })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

CollectionController.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId)
    const collectionFactory = new CollectionFactory(new UserCardRepo(), Store.blueprintValues.getState())
    const getShareCollectionUseCase = new GetShareCollectionUseCase(prisma, collectionFactory)
    const result = await getShareCollectionUseCase.call(userId)
    if (result.isSuccess()) {
      res.sendData({ data: result.value, status: 200 })
    } else {
      res.sendError({ errors: [result.error], status: 404 })
    }
  })
)

CollectionController.post(
  '/',
  requiresAuth(),
  asyncHandler(async (req, res) => {
    const parsed = AddUserCardBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((issue) => issue.message), status: 400 })
      return
    }
    const addCardTraderCardUseCase = new AddCardTraderCardUseCase(
      prisma,
      new CardTraderClient(),
      new ExpansionPokemonRepo(),
      new CardBlueprintPokemonRepo()
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
  requiresAuth(),
  asyncHandler(async (req, res) => {
    const parsed = RemoveUserCardBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.sendError({ errors: parsed.error.issues.map((issue) => issue.message), status: 400 })
      return
    }
    const removeCardUseCase = new RemoveCardUseCase(new UserCardRepo())
    const result = await removeCardUseCase.call(req.currentUser!.externalId, parsed.data.blueprintId)
    if (result.isSuccess()) {
      res.sendSuccess()
    } else {
      res.sendError({ errors: [result.error], status: 409 })
    }
  })
)

export default CollectionController
