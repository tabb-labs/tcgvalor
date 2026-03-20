import { UserCardWithBlueprint } from '../../../src/server/repository/UserCardRepo'

type MakeUserCardWithBlueprintMockArgs = {
  id?: number
  userId?: number
  cardBlueprintId?: number
  blueprintExternalId?: number
  name?: string
  imagePreviewUrl?: string
  imageShowUrl?: string
  expansionId?: number
}

export const makeUserCardWithBlueprintMock = ({
  id = 1,
  userId = 1,
  cardBlueprintId = 1,
  blueprintExternalId = 1,
  name = 'name',
  imagePreviewUrl = 'preview',
  imageShowUrl = 'show',
  expansionId = 1,
}: MakeUserCardWithBlueprintMockArgs = {}): UserCardWithBlueprint => ({
  id,
  userId,
  cardBlueprintId,
  condition: 'UNKNOWN',
  createdAt: new Date(),
  updatedAt: new Date(),
  cardBlueprint: {
    id: cardBlueprintId,
    expansionId,
    name,
    collectorNumber: '',
    imagePreviewUrl,
    imageShowUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
    platformLinks: [
      {
        id: cardBlueprintId,
        cardBlueprintId,
        platform: 'CARD_TRADER',
        externalId: String(blueprintExternalId),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    marketValue: null,
  },
})
