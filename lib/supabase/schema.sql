create extension if not exists pgcrypto;

create table systems (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_id uuid not null references systems(id) on delete cascade,
  is_homebrew boolean not null default false,
  publisher text,
  unique (name, system_id)
);

-- is_homebrew is denormalized onto each content table (copied from the
-- chosen source at write time) so browse-page filtering is a plain
-- equality check instead of a filtered join.
create table monsters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_id uuid not null references systems(id),
  source_id uuid not null references sources(id),
  is_homebrew boolean not null default false,
  rating_label text,
  tags text[] not null default '{}',
  description text not null default '',
  stats jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_id uuid not null references systems(id),
  source_id uuid not null references sources(id),
  is_homebrew boolean not null default false,
  item_type text,
  rarity text,
  tags text[] not null default '{}',
  description text not null default '',
  stats jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table spells (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_id uuid not null references systems(id),
  source_id uuid not null references sources(id),
  is_homebrew boolean not null default false,
  level text,
  tags text[] not null default '{}',
  description text not null default '',
  stats jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_id uuid not null references systems(id),
  source_id uuid not null references sources(id),
  is_homebrew boolean not null default false,
  category text,
  tags text[] not null default '{}',
  description text not null default '',
  stats jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index monsters_name_idx on monsters using gin (to_tsvector('english', name));
create index items_name_idx on items using gin (to_tsvector('english', name));
create index spells_name_idx on spells using gin (to_tsvector('english', name));
create index rules_name_idx on rules using gin (to_tsvector('english', name));

-- Row Level Security stays disabled: these tables are only ever reached
-- through server-side code that already sits behind the app's password
-- gate (see Global Constraints). The service-role key used by the app
-- bypasses RLS regardless, so leaving policies undefined would be a
-- false sense of security, not real protection.
