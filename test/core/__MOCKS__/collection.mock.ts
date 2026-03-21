import {
  AddUserCardBody,
  CollectionMetaDto,
  CollectionQueryParams,
  PaginationDto,
} from '@core/network-types/collection'

export const COLLECTION_META_DTO: CollectionMetaDto = {
  medianMarketValueCents: 0,
  cardsInCollection: 0,
}

export const PAGINATION_DTO: PaginationDto = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
}

export const COLLECTION_QUERY_PARAMS: CollectionQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'price',
  sortDir: 'desc',
}

export const ADD_USER_CARD_DTO: AddUserCardBody = {
  blueprintId: 0,
  expansionId: 0,
  name: '',
  imageUrlPreview: '',
  imageUrlShow: '',
}
