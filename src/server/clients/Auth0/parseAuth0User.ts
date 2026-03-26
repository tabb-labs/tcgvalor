import { z } from 'zod'

// TODO: Remove after migrating postgres user IDs to new Auth0 tenant
export const AUTH0_ID_MAP: Record<string, string> = {
  'auth0|699345a6ba48e5b37b010271': 'auth0|66532576f4306b7b1fa27e04',
}

const Auth0UserSchema = z
  .object({
    sid: z.string(),
    updated_at: z.string(),
    sub: z.string(),
    given_name: z.string().nullable().optional(),
    family_name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    picture: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    email_verified: z.boolean().nullable().optional(),
  })
  .transform((parsed) => ({
    sid: parsed.sid,
    updatedAt: parsed.updated_at,
    sub: AUTH0_ID_MAP[parsed.sub] ?? parsed.sub,
    givenName: parsed.given_name ?? null,
    familyName: parsed.family_name ?? null,
    nickname: parsed.nickname ?? null,
    name: parsed.name ?? null,
    picture: parsed.picture ?? null,
    locale: parsed.locale ?? null,
    email: parsed.email ?? null,
    emailVerified: parsed.email_verified ?? null,
  }))

export type Auth0User = z.infer<typeof Auth0UserSchema>

export const parseAuth0User = (user: unknown): Auth0User => Auth0UserSchema.parse(user)
