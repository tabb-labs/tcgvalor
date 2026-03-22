import { encodeShareToken, decodeShareToken } from '../../../../src/server/use-cases/collection/ShareToken'

process.env.ADMIN_TOKEN = 'test-secret'

describe('ShareToken', () => {
  describe('encodeShareToken', () => {
    it('should return an 8 character string', () => {
      expect(encodeShareToken(1).length).toBe(8)
    })

    it('should be deterministic', () => {
      expect(encodeShareToken(42)).toEqual(encodeShareToken(42))
    })

    it('should produce different tokens for different user ids', () => {
      expect(encodeShareToken(1)).not.toEqual(encodeShareToken(2))
    })
  })

  describe('decodeShareToken', () => {
    it('should round-trip encode then decode', () => {
      const userId = 99
      expect(decodeShareToken(encodeShareToken(userId))).toBe(userId)
    })

    it('should return null for a token with wrong length', () => {
      expect(decodeShareToken('short')).toBeNull()
    })

    it('should return null for an invalid base64url string', () => {
      expect(decodeShareToken('!!!!!!!!')).toBeNull()
    })
  })
})
