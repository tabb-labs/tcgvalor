export const validatedEnv = (key: string, variable?: string) => {
  if (!variable) throw new Error(`Missing Environment Variable: ${key}`)
  return variable
}

type EnvironmentId = 'production' | 'development'

export const ENV = {
  AUTH_0: {
    ISSUER_BASE_URL: () => validatedEnv('AUTH_ISSUER_BASE_URL', process.env.AUTH_ISSUER_BASE_URL),
    BASE_URL: () => validatedEnv('AUTH_BASE_URL', process.env.AUTH_BASE_URL),
    CLIENT_ID: () => validatedEnv('AUTH_CLIENT_ID', process.env.AUTH_CLIENT_ID),
    SECRET: () => validatedEnv('AUTH_SECRET', process.env.AUTH_SECRET),
    AUDIENCE: 'https://api.tcgvalor.com',
  },
  CARD_TRADER: {
    CARD_TRADER_API_KEY: () => validatedEnv('CARD_TRADER_API_KEY', process.env.CARD_TRADER_API_KEY),
    CARD_TRADER_BASE_URL: 'https://cardtrader.com',
    CARD_TRADER_API_URL: 'https://api.cardtrader.com/api/v2',
    POKEMON_GAME_ID: 5,
    POKEMON_SINGLE_CARD_CATEGORY: 73,
  },
  DATABASE: {
    URL: () => validatedEnv('DATABASE_URL', process.env.DATABASE_URL),
  },
  GITHUB_TOKEN: () => process.env.GITHUB_TOKEN ?? '',
  ADMIN_TOKEN: () => validatedEnv('ADMIN_TOKEN', process.env.ADMIN_TOKEN),
  ID: process.env.NODE_ENV as EnvironmentId,
  EMAILER: {
    SERVICE: () => validatedEnv('EMAILER_SERVICE', process.env.EMAILER_SERVICE),
    SENDER: () => validatedEnv('EMAILER_SENDER', process.env.EMAILER_SENDER),
    PASSWORD: () => validatedEnv('EMAILER_PASSWORD', process.env.EMAILER_PASSWORD),
  },
  HONEY_BADGER: () => validatedEnv('HONEY_BADGER', process.env.HONEY_BADGER),
  APPLE: {
    BUNDLE_ID: () => validatedEnv('APPLE_BUNDLE_ID', process.env.APPLE_BUNDLE_ID),
    APP_APPLE_ID: () => validatedEnv('APPLE_APP_APPLE_ID', process.env.APPLE_APP_APPLE_ID),
    ROOT_CERTS_BASE64: () => validatedEnv('APPLE_ROOT_CERTS_BASE64', process.env.APPLE_ROOT_CERTS_BASE64),
  },
}
