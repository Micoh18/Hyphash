-- Hyphash initial Supabase schema
-- Inferred from the Next.js application code and docs/supabase-schema-inventory.md.

create extension if not exists pgcrypto;

-- Shared trigger helper for updated_at columns.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Public profile tied to Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  stellar_address text,
  stellar_public_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_unique
  on public.profiles (username)
  where username is not null;

create unique index if not exists profiles_stellar_address_unique
  on public.profiles (stellar_address)
  where stellar_address is not null;

create unique index if not exists profiles_stellar_public_key_unique
  on public.profiles (stellar_public_key)
  where stellar_public_key is not null;

-- Main fungi observation record.
create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  observer_id uuid not null references public.profiles(id) on delete cascade,

  latitude double precision not null,
  longitude double precision not null,
  observed_at date not null,

  cap_shape text,
  cap_color text,
  cap_size_cm numeric,
  cap_surface text,
  cap_margin text,

  underside_type text,
  underside_color text,
  underside_spacing text,
  gill_attachment text,

  stem_color text,
  stem_height_cm numeric,
  stem_hollow boolean,
  stem_ring boolean,
  stem_shape text,
  stem_surface text,
  stem_base text,
  has_volva boolean,

  flesh_color text,
  bruise_color text,
  flesh_consistency text,
  color_change text,
  has_latex boolean,
  latex_color text,
  smell text,
  taste text,

  substrate text,
  habitat text,
  growth_pattern text,
  ecological_role text,
  associated_trees text,
  season text,
  spore_print_color text,

  proposed_species text,
  confidence text,
  notes text,
  status text not null default 'unverified',
  verified_species text,

  ipfs_metadata_cid text,
  ipfs_photo_cids text[],
  nft_asset_code text,
  nft_tx_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint observations_status_check
    check (status in ('unverified', 'discussing', 'community_id', 'unknown')),
  constraint observations_underside_type_check
    check (underside_type is null or underside_type in ('gills', 'pores', 'teeth', 'smooth')),
  constraint observations_growth_pattern_check
    check (growth_pattern is null or growth_pattern in ('alone', 'cluster', 'ring', 'scattered')),
  constraint observations_confidence_check
    check (confidence is null or confidence in ('guess', 'somewhat', 'pretty_sure', 'no_idea')),
  constraint observations_cap_size_nonnegative_check
    check (cap_size_cm is null or cap_size_cm >= 0),
  constraint observations_stem_height_nonnegative_check
    check (stem_height_cm is null or stem_height_cm >= 0),
  constraint observations_latitude_range_check
    check (latitude >= -90 and latitude <= 90),
  constraint observations_longitude_range_check
    check (longitude >= -180 and longitude <= 180)
);

create index if not exists observations_observer_id_idx on public.observations(observer_id);
create index if not exists observations_created_at_idx on public.observations(created_at desc);
create index if not exists observations_status_idx on public.observations(status);
create index if not exists observations_location_idx on public.observations(latitude, longitude);
create index if not exists observations_proposed_species_idx on public.observations(proposed_species) where proposed_species is not null;
create index if not exists observations_verified_species_idx on public.observations(verified_species) where verified_species is not null;

create trigger observations_set_updated_at
before update on public.observations
for each row execute function public.set_updated_at();

-- Photo metadata attached to observations. The app currently stores preview/IPFS paths in storage_path.
create table if not exists public.observation_photos (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  storage_path text not null,
  photo_type text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint observation_photos_photo_type_check
    check (photo_type in ('cap_top', 'underside', 'stem', 'cross_section', 'habitat', 'other')),
  constraint observation_photos_sort_order_nonnegative_check
    check (sort_order >= 0)
);

create index if not exists observation_photos_observation_id_idx on public.observation_photos(observation_id);
create index if not exists observation_photos_observation_sort_idx on public.observation_photos(observation_id, sort_order);

-- Discussion and consensus comments.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  comment_type text not null default 'discussion',
  suggested_species text,
  created_at timestamptz not null default now(),

  constraint comments_comment_type_check
    check (comment_type in ('discussion', 'agree', 'disagree', 'suggest')),
  constraint comments_body_not_blank_check
    check (length(btrim(body)) > 0),
  constraint comments_suggest_species_check
    check (comment_type <> 'suggest' or suggested_species is not null)
);

create index if not exists comments_observation_id_idx on public.comments(observation_id);
create index if not exists comments_observation_created_idx on public.comments(observation_id, created_at);
create index if not exists comments_observation_type_idx on public.comments(observation_id, comment_type);
create index if not exists comments_author_id_idx on public.comments(author_id);

-- User moderation flags.
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  flagger_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),

  constraint flags_reason_check
    check (reason in ('inappropriate_content', 'spam', 'wrong_content', 'duplicate', 'misleading_id', 'low_quality', 'other')),
  constraint flags_status_check
    check (status in ('pending', 'reviewed_valid', 'reviewed_dismissed')),
  constraint flags_unique_observation_flagger unique (observation_id, flagger_id)
);

create index if not exists flags_observation_id_idx on public.flags(observation_id);
create index if not exists flags_flagger_id_idx on public.flags(flagger_id);
create index if not exists flags_status_idx on public.flags(status);

-- Server-side custodial Stellar wallets. encrypted_secret must stay server-only.
create table if not exists public.stellar_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  public_key text not null,
  encrypted_secret text not null,
  funded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stellar_wallets_user_id_unique unique (user_id),
  constraint stellar_wallets_public_key_unique unique (public_key)
);

create trigger stellar_wallets_set_updated_at
before update on public.stellar_wallets
for each row execute function public.set_updated_at();

-- Create a profile when Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'username', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent browser clients from changing server-managed profile Stellar fields.
create or replace function public.protect_profile_stellar_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role'
    and (
      new.stellar_address is distinct from old.stellar_address
      or new.stellar_public_key is distinct from old.stellar_public_key
    ) then
    raise exception 'stellar profile fields are server-managed';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_stellar_fields
before update on public.profiles
for each row execute function public.protect_profile_stellar_fields();

-- Prevent browser clients from changing consensus/NFT fields directly.
create or replace function public.protect_observation_system_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role'
    and (
      new.status is distinct from old.status
      or new.verified_species is distinct from old.verified_species
      or new.ipfs_metadata_cid is distinct from old.ipfs_metadata_cid
      or new.ipfs_photo_cids is distinct from old.ipfs_photo_cids
      or new.nft_asset_code is distinct from old.nft_asset_code
      or new.nft_tx_hash is distinct from old.nft_tx_hash
    ) then
    raise exception 'observation system fields are server-managed';
  end if;

  return new;
end;
$$;

create trigger observations_protect_system_fields
before update on public.observations
for each row execute function public.protect_observation_system_fields();

-- Row Level Security.
alter table public.profiles enable row level security;
alter table public.observations enable row level security;
alter table public.observation_photos enable row level security;
alter table public.comments enable row level security;
alter table public.flags enable row level security;
alter table public.stellar_wallets enable row level security;

-- Profiles: public read, users can create/update their own normal profile data.
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Observations: public read, authenticated users create/update their own observations.
create policy "observations are publicly readable"
  on public.observations for select
  using (true);

create policy "authenticated users can insert own observations"
  on public.observations for insert
  to authenticated
  with check (auth.uid() = observer_id);

create policy "observers can update own observations before minting"
  on public.observations for update
  to authenticated
  using (auth.uid() = observer_id and nft_tx_hash is null)
  with check (auth.uid() = observer_id);

-- Observation photos: public read; owners of the parent observation can add photos.
create policy "observation photos are publicly readable"
  on public.observation_photos for select
  using (true);

create policy "observation owners can insert photos"
  on public.observation_photos for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.observations o
      where o.id = observation_id
        and o.observer_id = auth.uid()
    )
  );

create policy "observation owners can update photos"
  on public.observation_photos for update
  to authenticated
  using (
    exists (
      select 1
      from public.observations o
      where o.id = observation_id
        and o.observer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.observations o
      where o.id = observation_id
        and o.observer_id = auth.uid()
    )
  );

-- Comments: public read; authenticated users comment as themselves.
create policy "comments are publicly readable"
  on public.comments for select
  using (true);

create policy "authenticated users can insert own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Flags: public read for current UI counters; authenticated users can flag as themselves.
create policy "flags are publicly readable"
  on public.flags for select
  using (true);

create policy "authenticated users can insert own flags"
  on public.flags for insert
  to authenticated
  with check (auth.uid() = flagger_id);

-- No client policies for stellar_wallets: service role API routes handle all reads/writes.

-- Minimal privileges for PostgREST roles. RLS still controls row visibility/actions.
grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.observations to anon, authenticated;
grant insert, update on public.observations to authenticated;

grant select on public.observation_photos to anon, authenticated;
grant insert, update on public.observation_photos to authenticated;

grant select on public.comments to anon, authenticated;
grant insert on public.comments to authenticated;

grant select on public.flags to anon, authenticated;
grant insert on public.flags to authenticated;

revoke all on public.stellar_wallets from anon, authenticated;
