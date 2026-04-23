export type CardDto = {
  blueprintId: number
  expansionId: number
  expansionName: string
  expansionAbbreviation: string
  collectorNumber: string
  name: string
  imageUrlPreview: string
  imageUrlShow: string
  userCards: { id: number; condition: string }[]
  medianMarketValueCents: number
  listingCount: number
}
