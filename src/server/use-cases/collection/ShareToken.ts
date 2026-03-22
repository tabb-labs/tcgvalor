import { createCipheriv, createDecipheriv, createHash } from 'crypto'
import { ENV } from '../../env'

const getKey = () => createHash('sha256').update(ENV.ADMIN_TOKEN()).digest().slice(0, 16)
const IV = Buffer.alloc(16, 0)

export const encodeShareToken = (userId: number): string => {
  const cipher = createCipheriv('aes-128-ctr', getKey(), IV)
  const buf = Buffer.alloc(6)
  buf.writeUInt32BE(userId, 0)
  return Buffer.concat([cipher.update(buf), cipher.final()]).toString('base64url')
}

export const decodeShareToken = (token: string): number | null => {
  try {
    const decipher = createDecipheriv('aes-128-ctr', getKey(), IV)
    const encrypted = Buffer.from(token, 'base64url')
    if (encrypted.length !== 6) return null
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.readUInt32BE(0)
  } catch {
    return null
  }
}
