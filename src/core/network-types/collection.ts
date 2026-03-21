import { z } from 'zod'
import { CardDto } from './card'

export type CollectionMetaDto = {
  medianMarketValueCents: number
  cardsInCollection: number
}

export type PaginationDto = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CollectionDto = {
  meta: CollectionMetaDto
  cards: CardDto[]
  pagination: PaginationDto
}

export type ShareCollectionDto = {
  meta: CollectionMetaDto
  cards: CardDto[]
  name: string
}

export const CollectionQueryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  name: z.string().optional(),
  expansion: z.string().optional(),
  sortBy: z.enum(['name', 'price']).default('price'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
})

export type CollectionQueryParams = z.infer<typeof CollectionQueryParamsSchema>

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
