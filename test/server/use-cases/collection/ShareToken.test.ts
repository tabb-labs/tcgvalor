import { encodeShareToken } from '../../../../src/server/use-cases/collection/ShareToken'

beforeAll(() => {
  process.env.ADMIN_TOKEN = 'test-secret'
})

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
