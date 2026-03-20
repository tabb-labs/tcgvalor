import { ExpiresIn } from './isExpired'

export interface ICronJob {
  start: (expiresIn: ExpiresIn, interval: number) => void
  refresh: () => void
}
