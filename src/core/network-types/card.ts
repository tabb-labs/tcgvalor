export type CardDto = {
  blueprintId: number
  expansionId: number
  name: string
  imageUrlPreview: string
  imageUrlShow: string
  userCards: { id: number; condition: string }[]
  medianMarketValueCents: number
  listingCount: number
}
