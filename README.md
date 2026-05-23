<div align="center">
  <img src="public/logo.png" alt="Hyphash" width="160" />

  # Hyphash

  **A community-driven, map-first platform for documenting wild fungi observations.**

  *iNaturalist meets the forest floor: rich field observations, community verification, IPFS media, and optional Stellar testnet publishing.*
</div>

---

## Overview

Hyphash is a Next.js application for recording wild fungi sightings with location, photos, morphology, habitat, identification notes, and community discussion. Observations can be reviewed through a **Proof of Spore** style consensus flow: when multiple independent users agree on an identification, the observation can be promoted to a community-verified state.

The app also includes optional on-chain publishing support: photos and metadata can be pinned to IPFS through Pinata, and verified observations can be represented as Stellar assets/NFT-like records on testnet.

## Current Status

- **Application:** Next.js app router web app.
- **Auth/data:** Supabase is required for login, profiles, observations, comments, flags, and wallet records.
- **IPFS:** Pinata is optional but required for photo/metadata pinning.
- **Stellar:** testnet is recommended during development.
- **Database migrations:** no Supabase migration files are currently included in this repo. You must create/provision the required tables in Supabase before the full app flow will work.
- **Package name:** `package.json` still uses the internal name `mycelium`; the public/project name is **Hyphash**.

## Features

- Interactive fungi map powered by Leaflet and `react-leaflet`.
- Protected app area for feed, map, observation creation, observation detail, and profiles.
- Multi-step observation wizard with morphology, environment, location, photos, and identification fields.
- Community comments with agreement/disagreement/suggestion actions.
- Flagging/moderation primitives for observations.
- Supabase email/OAuth authentication through SSR-compatible clients.
- Optional IPFS upload through Pinata.
- Optional Stellar testnet wallet creation and observation publishing.
- Client-side AI-assisted image validation/identification foundation through `@huggingface/transformers`.
- Internationalization foundation with English, Spanish, Portuguese, and Russian translations.

## Tech Stack

- **Framework:** Next.js 15, App Router, React 19, TypeScript 5.
- **Styling/UI:** Tailwind CSS v4, Framer Motion, Radix primitives.
- **Backend/data:** Supabase Postgres, Auth, SSR cookies, service role for privileged server routes.
- **Map:** Leaflet 1.9 and `react-leaflet` 5.
- **Storage:** Pinata API for IPFS file and JSON pinning.
- **Blockchain:** Stellar SDK 14 and Freighter wallet integration.
- **AI:** `@huggingface/transformers` for browser-side model support.
- **Tooling:** ESLint, TypeScript, PostCSS, npm.

## Repository Structure

```text
app/
  (app)/                  Protected application routes
    feed/                 Observation feed
    map/                  Interactive fungi map
    observe/              New observation wizard
    observation/[id]/     Observation detail and discussion
    profile/[address]/    Public profile by Stellar address
  api/
    consensus/check/      Community consensus trigger
    ipfs/upload/          Pinata upload endpoint
    nft/{mint,confirm}/   Stellar transaction build/confirmation endpoints
    validate-image/       Image validation endpoint
    wallet/create/        Auto-provision Stellar wallet endpoint
components/
  auth/                   Wallet/auth UI helpers
  community/              Comments, flags, verification indicators
  landing/                Public landing sections
  map/                    Map and filters
  nav/                    Sidebar and language switcher
  observation/            Observation form, cards, photo UI
hooks/                    Auth, observations, geolocation, publishing, wallet hooks
lib/
  api-guard.ts            API CSRF/rate-limit wrapper
  consensus.ts            Community verification logic
  i18n/                   Translation helpers and dictionaries
  ipfs/client.ts          Pinata API client
  stellar/                Stellar NFT and wallet encryption helpers
  supabase/               Browser, server, and admin Supabase clients
types/index.ts            Domain types and form option constants
```

## Prerequisites

- Node.js **20+**.
- npm.
- A Supabase project.
- A Pinata account if you want IPFS uploads.
- A Stellar/Freighter testnet setup if you want on-chain publishing.

## Installation

```bash
git clone https://github.com/Micoh18/Hyphash.git
cd Hyphash
npm ci
```

If `npm ci` fails because the lockfile is out of sync, use:

```bash
npm install
```

## Environment Variables

Create `.env.local` in the project root.

```env
# Supabase — required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pinata / IPFS — required only for IPFS photo + metadata uploads
PINATA_API_KEY=
PINATA_SECRET_KEY=

# Stellar — use testnet while developing
NEXT_PUBLIC_STELLAR_NETWORK=testnet
STELLAR_ISSUER_SECRET=

# Server-side wallet encryption — required by wallet creation and NFT mint routes
# Must be at least 32 characters. Keep stable once wallets exist.
WALLET_ENCRYPTION_KEY=
```

### Variable Reference

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL. Safe to expose to the browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key. Safe to expose; protect data with RLS policies.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key. **Server-only secret. Never expose or commit.**
- `PINATA_API_KEY`: Pinata API key for `pinFileToIPFS` and `pinJSONToIPFS`.
- `PINATA_SECRET_KEY`: Pinata API secret. **Server-only secret.**
- `NEXT_PUBLIC_STELLAR_NETWORK`: `testnet` or `public`. Use `testnet` during development.
- `STELLAR_ISSUER_SECRET`: Stellar issuer secret key used by the server to build/sign issuer-side operations. **Server-only secret.**
- `WALLET_ENCRYPTION_KEY`: app-level key used to encrypt auto-provisioned Stellar wallet secrets. Must be at least 32 characters and must not change after real wallets are created, or existing encrypted secrets will become unreadable.

> Note: older docs referred to `STELLAR_WALLET_ENCRYPTION_KEY`. The current code reads `WALLET_ENCRYPTION_KEY`.

## Generate `WALLET_ENCRYPTION_KEY` on Windows PowerShell

The repo includes a helper script:

```powershell
.\scripts\generate-wallet-encryption-key.ps1
```

To print only, without touching `.env.local`:

```powershell
.\scripts\generate-wallet-encryption-key.ps1 -PrintOnly
```

To append the generated key to a specific env file:

```powershell
.\scripts\generate-wallet-encryption-key.ps1 -OutFile .env.local
```

## Supabase Setup Notes

The app expects these domain tables to exist:

- `profiles`
- `observations`
- `observation_photos`
- `comments`
- `flags`
- `stellar_wallets`

The app code also expects Supabase Auth to be configured for email/password and any OAuth providers you enable. Because migrations are not currently committed, database schema provisioning must be done manually or added as a future migration set.

Recommended next improvement: add a `supabase/migrations/` directory with the schema, indexes, storage policies, and RLS policies required by the app.

## Local Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quality Checks

Run these before committing or deploying:

```bash
npm run typecheck
npm run lint
npm run build
```

Current script notes:

- `npm run typecheck` runs `tsc --noEmit`.
- `npm run lint` uses `next lint`, which is deprecated in Next.js 16 and should eventually be migrated to the ESLint CLI.
- `npm run build` requires at least valid Supabase public env values because the app creates Supabase clients during prerender/build.
- There is no `npm test` script currently configured.

## On-Chain / IPFS Flow

When enabled, the publishing flow is:

```text
User submits observation
  → Photos upload to Pinata/IPFS
  → Observation metadata uploads to Pinata/IPFS
  → Server builds a Stellar transaction
  → Freighter asks the user to co-sign
  → Transaction is submitted to Stellar Horizon
  → Observation stores IPFS/Stellar metadata
```

For detailed setup, see [`SETUP-ONCHAIN.md`](./SETUP-ONCHAIN.md).

## Troubleshooting

### `@supabase/ssr: Your project's URL and API key are required`

Add these to `.env.local` and restart the dev/build command:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### `PINATA_API_KEY and PINATA_SECRET_KEY must be set`

Set both Pinata variables if you are testing IPFS upload routes. If you are not testing IPFS, avoid triggering upload/publish flows.

### `WALLET_ENCRYPTION_KEY must be set (min 32 chars)`

Generate one with:

```powershell
.\scripts\generate-wallet-encryption-key.ps1
```

### Freighter does not open or rejects network

Confirm both places are on the same Stellar network:

- `.env.local`: `NEXT_PUBLIC_STELLAR_NETWORK=testnet`
- Freighter extension: Testnet selected.

### Stellar issuer is underfunded

For testnet, fund the issuer public key with Friendbot:

```text
https://friendbot.stellar.org?addr=YOUR_ISSUER_PUBLIC_KEY
```

## Security Notes

- Never commit `.env.local` or any real secret.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `PINATA_SECRET_KEY`, `STELLAR_ISSUER_SECRET`, and `WALLET_ENCRYPTION_KEY` server-side only.
- Do not use Supabase service role keys in browser/client components.
- Configure Supabase Row Level Security before using real user data.
- Keep `WALLET_ENCRYPTION_KEY` backed up securely; losing/changing it can make encrypted wallet secrets unrecoverable.

## Roadmap

- Add Supabase migrations and RLS policies to the repo.
- Add automated tests for core hooks, API routes, and consensus logic.
- Migrate `next lint` to the ESLint CLI before Next.js 16.
- Add CI checks for typecheck, lint, build, and dependency audit.
- Add PostGIS/geospatial queries for nearby observations.
- Add species pages with aggregated sightings, traits, and seasonality.
- Add Supabase Realtime updates.
- Add expert verification and reputation scoring.

## License

Private — all rights reserved.
