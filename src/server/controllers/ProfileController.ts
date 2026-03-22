import { Router } from 'express'
import { ProfileDto } from '@core/network-types/profile'
import { User } from '@prisma/client'
import { encodeShareToken } from '../use-cases/collection/ShareToken'

const ProfileController = Router()

ProfileController.get('/', (req, res) => {
  if (!req.currentUser) {
    res.sendError({ errors: ['User not logged in'] })
    return
  }

  res.sendData({ data: profileDto(req.currentUser) })
})

const profileDto = (user: User): ProfileDto => ({
  id: user.id,
  shareToken: encodeShareToken(user.id),
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  picture: user.picture,
})

export default ProfileController
