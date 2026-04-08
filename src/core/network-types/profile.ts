import { SubscriptionDto } from './subscription'

export type ProfileDto = {
  id: number
  shareToken: string
  email: string | null
  name: string
  nickname: string
  picture: string | null
  subscription: SubscriptionDto | null
}
