# TCGValor

## Build & Run

```
# Dev server (webpack + node watch)
npm run dev

# Build
npm run build

# Unit tests
npm test

# Lint / format check
npm run check

# Lint / format fix
npm run fix
```

## What is TCGValor?

Answers the question: "How much are your TCG cards worth?" Users browse a card catalog, track their collection, and see card market values.

## Architecture

**This repo**: Express.js + TypeScript backend, React frontend

- PostgreSQL via Prisma
- Auth: Auth0 (web via `express-openid-connect`, mobile via `express-oauth2-jwt-bearer`)
- Pricing data: CardTrader API

**iOS companion app**: `/Users/michaeltabb/Projects/tcgvalor-ios/tcgvalor`

- SwiftUI + SwiftData
- Shares this backend — no separate server

## iOS Contract Warning

Changes to endpoint URLs, request shapes, or response shapes are **breaking changes for the iOS app**. Flag these explicitly when making or reviewing such changes. The iOS app references:

- `src/core/network-types/` — API response shapes consumed by Swift models
- `src/server/controllers/` — endpoint definitions

## Key Directories

- `src/server/controllers/` — Express route handlers
- `src/server/use-cases/` — business logic
- `src/server/http/` — middleware
- `src/server/clients/` — external API integrations (Auth0, CardTrader)
- `src/core/network-types/` — shared request/response types (also used by iOS)
- `prisma/` — schema and migrations

## Features

- Card catalog — browse by expansion or search by name
- Collection — track owned cards, view total value
- Collection sharing — shareable collection links
- Pricing — market values via CardTrader
