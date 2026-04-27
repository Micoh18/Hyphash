<div align="center">
  <img src="public/logo.png" alt="Hyphash" width="160" />

  # Hyphash

  **A community-driven, map-first platform for documenting wild fungi.**

  *iNaturalist meets the forest floor: observation-deep, description-rich, community-verified, and anchored on-chain.*
</div>

---

## Overview

Hyphash is an interactive world map where mycophiles, foragers, and citizen scientists document wild fungi sightings with detailed sensory descriptions, photographs, and community-based identification. Verified observations reach consensus through **Proof of Spore** (three independent observers agreeing on an identification) and can be minted as NFTs on the **Stellar** network, creating a permanent, decentralized record of biodiversity contributions.

## Features

- **Interactive World Map** — Leaflet-based map with custom SVG markers colored by observation status (pending, community-verified, expert-verified, disputed).
- **Multi-step Observation Wizard** — Capture location, photos, morphology (cap shape, gill type, spore print), environment (substrate, habitat), and identification notes.
- **Proof of Spore (Consensus Engine)** — when three independent observers agree on the same identification, the observation is automatically promoted to *community-verified*.
- **Auto-provisioned Stellar Wallets** — Encrypted with AES-256-GCM and minted as NFTs once verified.
- **AI-assisted Identification** — On-device inference via `@huggingface/transformers`.
- **Decentralized Media** — Photos and metadata pinned to IPFS through Pinata.
- **Auth-first UX** — Email/password and OAuth (Google, GitHub) with route-protected layouts.
- **i18n** — English, Spanish, Portuguese, and Russian translations out of the box.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, Framer Motion, Radix UI primitives |
| **Auth & DB** | Supabase (Postgres + Row Level Security + SSR cookies) |
| **Map** | Leaflet 1.9 + react-leaflet 5 (dynamic SSR-disabled import) |
| **Blockchain** | Stellar SDK 14, Freighter API, AES-256-GCM keypair encryption |
| **Storage** | IPFS via Pinata |
| **AI** | `@huggingface/transformers` for in-browser identification |
| **Tooling** | ESLint 9, PostCSS, `tsc --noEmit` |

## Architecture

```
app/
  (app)/                  # Protected routes — Sidebar layout
    map/                  # Interactive fungi map
    feed/                 # Observation feed
    observe/              # New observation wizard
    observation/[id]/     # Detail + discussion thread
    profile/[address]/    # User profile by Stellar address
  api/
    consensus/check/      # Community verification trigger
    nft/{mint,confirm}/   # Stellar NFT minting + tx confirmation
    wallet/create/        # Auto-provision encrypted wallet
    ipfs/upload/          # Pinata image upload
components/
  map/                    # FungiMap, MapFilters
  observation/            # ObservationForm, PhotoUpload, PhotoGallery, ObservationCard
  community/              # CommentThread, VerificationBadge, FlagButton
  auth/                   # ConnectWallet (Freighter)
hooks/                    # useAuth, useWallet, useObservations, useGeolocation
lib/
  stellar/                # nft.ts, wallet-crypto.ts (AES-256-GCM)
  supabase/               # client | server | admin
  consensus.ts            # 3+ agrees → verified
  api-guard.ts            # CSRF + rate limiting wrapper
  ipfs/client.ts          # Pinata
  i18n/                   # en, es, pt, ru
middleware.ts             # Session refresh + route protection
types/index.ts            # Domain types + form option arrays
```

### Database (Supabase)

- `profiles` — user identity tied to a Stellar address
- `observations` — ~30 fields (morphology, environment, ID, on-chain metadata)
- `observation_photos` — image references
- `comments` — typed actions (`agree`, `disagree`, `suggest`, `discussion`)
- `stellar_wallets` — AES-256-GCM encrypted secrets
- `flags` — content moderation

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- A **Supabase** project (URL + anon key + service role key)
- A **Pinata** account (JWT for IPFS uploads)
- A **Stellar** wallet encryption key (32-byte AES key)

> **Windows / Git Bash:** add Node to PATH:
> ```bash
> export PATH="/c/Program Files/nodejs:$PATH"
> ```

### Installation

```bash
cd mycelium
npm install
```

### Environment Variables

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PINATA_JWT=...
STELLAR_NETWORK=testnet
STELLAR_WALLET_ENCRYPTION_KEY=...
```

### Scripts

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npm run typecheck    # tsc --noEmit
```

## Key Patterns

- **Route groups** — `(app)/` wraps protected pages with the Sidebar; public pages (landing, login, signup, about, privacy, terms) live outside.
- **Leaflet + SSR** — `FungiMap` is loaded via `next/dynamic` with `ssr: false`; react-leaflet components are imported inside `useEffect`.
- **API security** — every route handler runs through `apiGuard()` for CSRF validation and per-IP rate limiting.
- **Supabase clients** — separate `client.ts` (browser), `server.ts` (RSC + route handlers), and `admin.ts` (RLS bypass).
- **Consensus** — implemented in `lib/consensus.ts`; promotes an observation once it accumulates 3+ unique agreement comments.
- **Auto wallet** — on signup, `/api/wallet/create` generates a Stellar keypair, encrypts the secret with AES-256-GCM, and persists it.

## Theming

Earthy palette defined as Tailwind v4 `@theme` tokens and CSS custom properties for light/dark modes:

`mycelium` · `spore` · `forest` · `moss` · `bark` · `cap-red` · `cap-orange` · `cap-brown`

## Roadmap

- [ ] **PostGIS** geospatial queries for nearby observations
- [ ] **Species pages** aggregating sightings, traits, and seasonality
- [ ] **Realtime** updates via Supabase Realtime channels
- [ ] **Contributor micropayments** over Stellar
- [ ] Expert verification tier and reputation scoring

## License

Private — all rights reserved.
