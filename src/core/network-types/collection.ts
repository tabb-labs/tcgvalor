import { z } from 'zod'
import { CardDto } from './card'

export type CollectionMetaDto = {
  medianMarketValueCents: number
  cardsInCollection: number
}

export type CollectionDto = {
  meta: CollectionMetaDto
  cards: CardDto[]
}

export type ShareCollectionDto = {
  meta: CollectionMetaDto
  cards: CardDto[]
  name: string
}

export const AddUserCardBodySchema = z.object({
  blueprintId: z.number(),
  expansionId: z.number(),
  name: z.string(),
  imageUrlPreview: z.string(),
  imageUrlShow: z.string(),
})

export type AddUserCardBody = z.infer<typeof AddUserCardBodySchema>

export const RemoveUserCardBodySchema = z.object({
  userCardId: z.number(),
})

export type RemoveUserCardBody = z.infer<typeof RemoveUserCardBodySchema>
