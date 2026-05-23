# Hyphash Supabase Schema Inventory

_Last updated: 2026-05-23_

## Live project inspection status

Candidate legacy project:

- Supabase project name: `mycelium`
- Project ref: `eijyziziogiorltxchkl`

Attempted live inspection with Supabase CLI:

```bash
npx supabase link --project-ref eijyziziogiorltxchkl --yes
npx supabase gen types typescript --project-id eijyziziogiorltxchkl
```

Result:

```text
project is paused
Project must be active and healthy.
```

Because the project is paused, the live database schema could not be read from Supabase. The inventory below is inferred from the application code and should be treated as the migration target for a new Supabase project.

## Expected application tables

Hyphash uses Supabase Auth plus six public schema domain tables:

- `profiles`
- `observations`
- `observation_photos`
- `comments`
- `flags`
- `stellar_wallets`

No Supabase Storage bucket is currently required by the code path reviewed here. Images are stored as browser preview URLs locally and/or pinned externally through Pinata/IPFS.

## `profiles`

Purpose: public user profile tied to Supabase Auth and optionally to a Stellar address.

Inferred from:

- `hooks/useAuth.tsx`
- `app/(app)/profile/[address]/page.tsx`
- `app/api/wallet/create/route.ts`
- `types/index.ts`

Expected columns:

- `id uuid primary key references auth.users(id) on delete cascade`
- `username text null`
- `avatar_url text null`
- `stellar_address text null`
- `stellar_public_key text null`
- `created_at timestamptz not null default now()`

Recommended indexes/constraints:

- unique index on `stellar_address` where not null
- unique index on `stellar_public_key` where not null
- optional unique index on `username` where not null

Important behavior:

- A trigger should create `profiles` rows when new users sign up.
- `username` should be copied from `auth.users.raw_user_meta_data->>'username'` when present.

## `observations`

Purpose: main fungi observation record.

Inferred from:

- `types/index.ts`
- `hooks/useObservations.tsx`
- `components/observation/ObservationForm.tsx`
- `app/api/consensus/check/route.ts`
- `app/api/nft/{mint,confirm}/route.ts`

Expected columns:

Identity and ownership:

- `id uuid primary key`
- `observer_id uuid not null references profiles(id) on delete cascade`

Location and timing:

- `latitude double precision not null`
- `longitude double precision not null`
- `observed_at date not null`

Appearance fields:

- `cap_shape text null`
- `cap_color text null`
- `cap_size_cm numeric null`
- `cap_surface text null`
- `cap_margin text null`
- `underside_type text null`
- `underside_color text null`
- `underside_spacing text null`
- `gill_attachment text null`
- `stem_color text null`
- `stem_height_cm numeric null`
- `stem_hollow boolean null`
- `stem_ring boolean null`
- `stem_shape text null`
- `stem_surface text null`
- `stem_base text null`
- `has_volva boolean null`
- `flesh_color text null`
- `bruise_color text null`
- `flesh_consistency text null`
- `color_change text null`
- `has_latex boolean null`
- `latex_color text null`
- `smell text null`
- `taste text null`

Environment fields:

- `substrate text null`
- `habitat text null`
- `growth_pattern text null`
- `ecological_role text null`
- `associated_trees text null`
- `season text null`
- `spore_print_color text null`

Identification and community status:

- `proposed_species text null`
- `confidence text null`
- `notes text null`
- `status text not null default 'unverified'`
- `verified_species text null`

IPFS / Stellar fields:

- `ipfs_metadata_cid text null`
- `ipfs_photo_cids text[] null`
- `nft_asset_code text null`
- `nft_tx_hash text null`

Timestamps:

- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Recommended constraints:

- `status in ('unverified', 'discussing', 'community_id', 'unknown')`
- `underside_type in ('gills', 'pores', 'teeth', 'smooth')` when not null
- `growth_pattern in ('alone', 'cluster', 'ring', 'scattered')` when not null
- `confidence in ('guess', 'somewhat', 'pretty_sure', 'no_idea')` when not null

Recommended indexes:

- `observer_id`
- `created_at desc`
- `status`
- `(latitude, longitude)` initially; consider PostGIS later.
- `proposed_species` and/or `verified_species` for species filtering.

## `observation_photos`

Purpose: photo metadata attached to observations.

Inferred from:

- `types/index.ts`
- `hooks/useObservations.tsx`
- `components/observation/ObservationForm.tsx`

Expected columns:

- `id uuid primary key`
- `observation_id uuid not null references observations(id) on delete cascade`
- `storage_path text not null`
- `photo_type text not null`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`

Recommended constraints:

- `photo_type in ('cap_top', 'underside', 'stem', 'cross_section', 'habitat', 'other')`

Recommended indexes:

- `observation_id`
- `(observation_id, sort_order)`

Note:

- Current code stores `storage_path` as a client preview URL when adding observations locally. If moving to permanent media, this should become an IPFS URL/CID or Supabase Storage path.

## `comments`

Purpose: discussion and consensus actions on observations.

Inferred from:

- `types/index.ts`
- `app/(app)/observation/[id]/page.tsx`
- `lib/consensus.ts`

Expected columns:

- `id uuid primary key default gen_random_uuid()`
- `observation_id uuid not null references observations(id) on delete cascade`
- `author_id uuid not null references profiles(id) on delete cascade`
- `body text not null`
- `comment_type text not null default 'discussion'`
- `suggested_species text null`
- `created_at timestamptz not null default now()`

Recommended constraints:

- `comment_type in ('discussion', 'agree', 'disagree', 'suggest')`

Recommended indexes:

- `observation_id`
- `(observation_id, created_at)`
- `(observation_id, comment_type)`

Consensus behavior:

- `lib/consensus.ts` counts unique `author_id` values with `comment_type = 'agree'`.
- Threshold is currently `3` independent users.
- If consensus is reached, the server updates `observations.status = 'community_id'` and sets `verified_species`.

## `flags`

Purpose: user moderation/reporting flags.

Inferred from:

- `types/index.ts`
- `hooks/useObservations.tsx`

Expected columns:

- `id uuid primary key default gen_random_uuid()`
- `observation_id uuid not null references observations(id) on delete cascade`
- `flagger_id uuid not null references profiles(id) on delete cascade`
- `reason text not null`
- `details text null`
- `status text not null default 'pending'`
- `reviewed_by uuid null references profiles(id) on delete set null`
- `reviewed_at timestamptz null`
- `created_at timestamptz not null default now()`

Recommended constraints:

- `reason in ('inappropriate_content', 'spam', 'wrong_content', 'duplicate', 'misleading_id', 'low_quality', 'other')`
- `status in ('pending', 'reviewed_valid', 'reviewed_dismissed')`
- unique constraint on `(observation_id, flagger_id)` to prevent duplicate flags by the same user.

Recommended indexes:

- `observation_id`
- `flagger_id`
- `status`

## `stellar_wallets`

Purpose: custodial Stellar wallet generated for each user and encrypted server-side.

Inferred from:

- `app/api/wallet/create/route.ts`
- `app/api/nft/mint/route.ts`
- `lib/stellar/wallet-crypto.ts`

Expected columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `public_key text not null`
- `encrypted_secret text not null`
- `funded boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Recommended constraints/indexes:

- unique constraint on `user_id`
- unique constraint on `public_key`

Security notes:

- `encrypted_secret` must never be readable from browser/client queries.
- Only privileged server routes using `SUPABASE_SERVICE_ROLE_KEY` should read or write wallet secrets.
- `WALLET_ENCRYPTION_KEY` must remain stable after wallets are created.

## RLS outline for new project

Recommended high-level policy shape:

- `profiles`: public read; users can update their own non-sensitive profile fields.
- `observations`: public read; authenticated users can insert observations for themselves; owners can update safe fields before minting; admin/service role can update verification/NFT fields.
- `observation_photos`: public read; observation owners can insert photo rows for their own observations.
- `comments`: public read; authenticated users can insert comments as themselves.
- `flags`: users can insert one flag per observation; users can read their own flags; admin can review all.
- `stellar_wallets`: no public read; users may be allowed to read only `public_key`/`funded` via a safe view or route, but not `encrypted_secret`; service role handles secret operations.

## Migration readiness notes

Before creating the new Supabase project, add a real migration set under `supabase/migrations/` that defines:

1. extensions: `pgcrypto` for `gen_random_uuid()`;
2. tables above;
3. indexes and check constraints;
4. `updated_at` trigger helper;
5. profile creation trigger on `auth.users`;
6. RLS enablement and policies;
7. optional safe views for public wallet metadata if needed.
