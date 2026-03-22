import { createHmac, createHash } from 'crypto'
import { ENV } from '../../env'

// Key is derived once (lazy) from ADMIN_TOKEN; 6 bytes of HMAC output = 8 base64url chars
let _key: Buffer | undefined
const key = (): Buffer => (_key ??= createHash('sha256').update(ENV.ADMIN_TOKEN()).digest())

export const encodeShareToken = (userId: number): string =>
  createHmac('sha256', key()).update(userId.toString()).digest().subarray(0, 6).toString('base64url')
