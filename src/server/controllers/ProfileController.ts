import { Router } from 'express'
import { Subscription, User } from '@prisma/client'
import { ProfileDto } from '@core/network-types/profile'
import { asyncHandler } from '../http/asyncHandler'
import { encodeShareToken } from '../use-cases/collection/ShareToken'
import SubscriptionRepo from '../repository/SubscriptionRepo'

const ProfileController = Router()

ProfileController.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.currentUser) {
      res.sendError({ errors: ['User not logged in'] })
      return
    }

    const subscription = await new SubscriptionRepo().findActiveForUser(req.currentUser.id)
    res.sendData({ data: profileDto(req.currentUser, subscription) })
  })
)

const profileDto = (user: User, subscription: Subscription | null): ProfileDto => ({
  id: user.id,
  shareToken: encodeShareToken(user.id),
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  picture: user.picture,
  subscription: subscription
    ? {
        tier: subscription.tier,
        status: subscription.status,
        expiresAt: subscription.expiresAt?.toISOString() ?? null,
      }
    : null,
})

export default ProfileController
