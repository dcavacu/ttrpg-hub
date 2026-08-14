# ttrpg-hub Foundation & Monsters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the ttrpg-hub app end-to-end — database schema for all four content types, a password gate, and a complete browse/search/filter/detail/add/edit flow for Monsters — deployed and usable at a URL.

**Architecture:** Next.js (App Router, TypeScript) talking to a Supabase Postgres database exclusively from the server (Server Components and Server Actions); the browser never talks to Supabase directly. A single shared-password cookie, checked in middleware, gates every route. Monsters get a full UI; Items/Spells/Rules reuse the same schema shape and are deferred to a follow-on plan once this vertical slice is proven.

**Tech Stack:** Next.js 14 (App Router) + TypeScript, Supabase (Postgres), `@supabase/supabase-js`, Vitest + Testing Library for tests, plain CSS modules for styling, Vercel for hosting.

**Spec:** [docs/superpowers/specs/2026-08-14-ttrpg-hub-design.md](../specs/2026-08-14-ttrpg-hub-design.md)

## Global Constraints

- All Supabase access happens server-side only, using the service-role key (never `NEXT_PUBLIC_`-prefixed, never sent to the browser). The site's access control is the password gate, not Supabase Row Level Security.
- No live external API calls at runtime — the Open5e import is a one-time script, not something the running app calls.
- No automated PDF parsing/OCR.
- Single shared password gates the whole app (view and edit); no per-user accounts in v1.
- Content tables use a `stats jsonb` column so the same schema works for any system's stat-block shape.
- Free-tier hosting: Vercel (app) + Supabase (database).

---

## File Structure

```
ttrpg-hub/
  .env.example
  package.json
  vitest.config.ts
  middleware.ts
  lib/
    supabase/
      client.ts            # server-only Supabase client factory
      schema.sql            # DDL for systems, sources, monsters, items, spells, rules
    auth/
      password.ts           # constant-time password comparison (pure)
      password.test.ts
      session.ts             # HMAC session token create/verify (pure)
      session.test.ts
    content/
      types.ts               # shared TS types
      filters.ts              # applyContentFilters (pure, chainable-query helper)
      filters.test.ts
      monsters.ts              # listMonsters/getMonsterById/createMonster/updateMonster
      monsters.test.ts
      validate-monster.ts       # validateMonsterInput (pure)
      validate-monster.test.ts
      open5e-mapper.ts           # mapOpen5eMonsterToRow (pure)
      open5e-mapper.test.ts
  app/
    login/
      page.tsx
      actions.ts
    monsters/
      page.tsx                    # browse page (Server Component)
      actions.ts                    # createMonsterAction/updateMonsterAction
      MonsterCard.tsx
      MonsterCard.test.tsx
      MonsterFilters.tsx
      MonsterFilters.test.tsx
      MonsterForm.tsx
      new/
        page.tsx
      [id]/
        page.tsx                       # detail page (Server Component)
        edit/
          page.tsx
  scripts/
    seed-srd-monsters.ts
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `vitest.config.ts`, `.env.example`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`

**Interfaces:**
- Produces: a running Next.js dev server and a working `vitest` command, which every later task depends on.

- [ ] **Step 1: Scaffold the app**

```bash
npx create-next-app@14 . --typescript --eslint --app --src-dir=false --import-alias "@/*"
```

Answer "No" to Tailwind (this plan uses plain CSS) and "No" to `src/` directory when prompted.

- [ ] **Step 2: Add test tooling**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 3: Add the Supabase dependency**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 4: Write a smoke test to confirm the toolchain works**

Create `app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('Home page', () => {
  it('renders the compendium heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /compendium/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `app/page.tsx` doesn't render a matching heading yet (default `create-next-app` boilerplate).

- [ ] **Step 6: Replace the boilerplate home page**

Replace `app/page.tsx`:

```tsx
export default function Page() {
  return (
    <main>
      <h1>The Compendium</h1>
      <p>
        <a href="/monsters">Browse monsters</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 7: Run tests to confirm they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 8: Create `.env.example`**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SITE_PASSWORD=
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Vitest and Supabase dependency"
```

---

## Task 2: Database schema

**Files:**
- Create: `lib/supabase/schema.sql`, `lib/supabase/client.ts`, `lib/content/types.ts`

**Interfaces:**
- Produces: `createSupabaseClient(): SupabaseClient` — used by every query module and the seed script. Table shapes matching `lib/content/types.ts`.

- [ ] **Step 1: Write the schema**

Create `lib/supabase/schema.sql`:

```sql
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
```

This file is applied by hand in the Supabase SQL editor — Supabase has no automated migration runner in this project, so there is no automated test for the DDL itself. Task 4's tests exercise the query layer against a mocked client instead.

- [ ] **Step 2: Write the server-only Supabase client factory**

Create `lib/supabase/client.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
```

- [ ] **Step 3: Write the shared content types**

Create `lib/content/types.ts`:

```ts
export type SourceType = 'official' | 'homebrew';

export interface System {
  id: string;
  name: string;
}

export interface Source {
  id: string;
  name: string;
  is_homebrew: boolean;
}

export interface Monster {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  rating_label: string | null;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export interface ContentFilters {
  systemId?: string;
  sourceType?: SourceType;
  search?: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase lib/content/types.ts
git commit -m "Add database schema and Supabase client factory"
```

---

## Task 3: Password gate

**Files:**
- Create: `lib/auth/password.ts`, `lib/auth/password.test.ts`, `lib/auth/session.ts`, `lib/auth/session.test.ts`, `middleware.ts`, `app/login/page.tsx`, `app/login/actions.ts`

**Interfaces:**
- Consumes: none (pure module + Next.js middleware/server-action primitives).
- Produces: `isCorrectPassword(input: string, expected: string): boolean`, `createSessionToken(secret: string): string`, `verifySessionToken(token: string | undefined, secret: string): boolean` — used by `middleware.ts` and `app/login/actions.ts`, and by every later task implicitly (all routes sit behind this gate).

- [ ] **Step 1: Write the failing test for password comparison**

Create `lib/auth/password.test.ts`:

```ts
import { isCorrectPassword } from './password';

describe('isCorrectPassword', () => {
  it('returns true when the input matches exactly', () => {
    expect(isCorrectPassword('open-sesame', 'open-sesame')).toBe(true);
  });

  it('returns false when the input does not match', () => {
    expect(isCorrectPassword('wrong', 'open-sesame')).toBe(false);
  });

  it('returns false for an empty input', () => {
    expect(isCorrectPassword('', 'open-sesame')).toBe(false);
  });

  it('returns false when expected is unset', () => {
    expect(isCorrectPassword('anything', '')).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- password.test.ts`
Expected: FAIL — `lib/auth/password.ts` doesn't exist yet.

- [ ] **Step 3: Implement it**

Create `lib/auth/password.ts`:

```ts
export function isCorrectPassword(input: string, expected: string): boolean {
  if (!input || !expected || input.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- password.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for session tokens**

Create `lib/auth/session.test.ts`:

```ts
import { createSessionToken, verifySessionToken } from './session';

describe('session tokens', () => {
  it('verifies a token created with the same secret', () => {
    const token = createSessionToken('secret-a');
    expect(verifySessionToken(token, 'secret-a')).toBe(true);
  });

  it('rejects a token created with a different secret', () => {
    const token = createSessionToken('secret-a');
    expect(verifySessionToken(token, 'secret-b')).toBe(false);
  });

  it('rejects an undefined token', () => {
    expect(verifySessionToken(undefined, 'secret-a')).toBe(false);
  });

  it('rejects a tampered token', () => {
    const token = createSessionToken('secret-a');
    expect(verifySessionToken(token + 'x', 'secret-a')).toBe(false);
  });
});
```

- [ ] **Step 6: Run it to confirm it fails**

Run: `npm test -- session.test.ts`
Expected: FAIL — `lib/auth/session.ts` doesn't exist yet.

- [ ] **Step 7: Implement it**

Create `lib/auth/session.ts`:

```ts
import { createHmac, timingSafeEqual } from 'crypto';

const SIGNED_VALUE = 'granted';

export function createSessionToken(secret: string): string {
  return createHmac('sha256', secret).update(SIGNED_VALUE).digest('hex');
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const expected = createSessionToken(secret);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  if (tokenBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(tokenBuffer, expectedBuffer);
}
```

- [ ] **Step 8: Run tests to confirm they pass**

Run: `npm test -- session.test.ts`
Expected: PASS

- [ ] **Step 9: Wire up the middleware**

Create `middleware.ts` (project root):

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth/session';

const SESSION_COOKIE = 'ttrpg_hub_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SITE_PASSWORD ?? '';

  if (!verifySessionToken(token, secret)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 10: Write the login page and server action**

Create `app/login/actions.ts`:

```ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isCorrectPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/monsters');
  const secret = process.env.SITE_PASSWORD ?? '';

  if (!isCorrectPassword(password, secret)) {
    redirect(`/login?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  cookies().set('ttrpg_hub_session', createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  redirect(redirectTo);
}
```

Create `app/login/page.tsx`:

```tsx
import { login } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  return (
    <main>
      <h1>Enter the compendium</h1>
      <form action={login}>
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/monsters'} />
        <label>
          Password
          <input type="password" name="password" required autoFocus />
        </label>
        {searchParams.error && <p role="alert">That password isn&apos;t right. Try again.</p>}
        <button type="submit">Enter</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 11: Manually verify the gate**

Run: `npm run dev`, set `SITE_PASSWORD=test-pass` in `.env.local`, visit `http://localhost:3000/` — expect a redirect to `/login`. Submit the wrong password — expect the error message. Submit `test-pass` — expect a redirect back to `/monsters` (404 is fine at this point; that page doesn't exist until Task 6) with the `ttrpg_hub_session` cookie set.

- [ ] **Step 12: Commit**

```bash
git add lib/auth middleware.ts app/login
git commit -m "Add shared-password gate with signed session cookie"
```

---

## Task 4: Content filter logic

**Files:**
- Create: `lib/content/filters.ts`, `lib/content/filters.test.ts`

**Interfaces:**
- Consumes: `ContentFilters` from `lib/content/types.ts` (Task 2).
- Produces: `applyContentFilters<Q extends FilterableQuery>(query: Q, filters: ContentFilters): Q` — used by `lib/content/monsters.ts` (Task 5).

- [ ] **Step 1: Write the failing tests**

Create `lib/content/filters.test.ts`:

```ts
import { applyContentFilters, type FilterableQuery } from './filters';

function createMockQuery(): FilterableQuery & { eq: any; ilike: any } {
  const query: any = {};
  query.eq = vi.fn(() => query);
  query.ilike = vi.fn(() => query);
  return query;
}

describe('applyContentFilters', () => {
  it('filters by system id when provided', () => {
    const query = createMockQuery();
    applyContentFilters(query, { systemId: 'sys-123' });
    expect(query.eq).toHaveBeenCalledWith('system_id', 'sys-123');
  });

  it('filters by is_homebrew=true for sourceType homebrew', () => {
    const query = createMockQuery();
    applyContentFilters(query, { sourceType: 'homebrew' });
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', true);
  });

  it('filters by is_homebrew=false for sourceType official', () => {
    const query = createMockQuery();
    applyContentFilters(query, { sourceType: 'official' });
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', false);
  });

  it('applies a case-insensitive name search', () => {
    const query = createMockQuery();
    applyContentFilters(query, { search: 'owl' });
    expect(query.ilike).toHaveBeenCalledWith('name', '%owl%');
  });

  it('applies no filters when none are given', () => {
    const query = createMockQuery();
    applyContentFilters(query, {});
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.ilike).not.toHaveBeenCalled();
  });

  it('combines multiple filters', () => {
    const query = createMockQuery();
    applyContentFilters(query, { systemId: 'sys-123', sourceType: 'homebrew', search: 'owl' });
    expect(query.eq).toHaveBeenCalledWith('system_id', 'sys-123');
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', true);
    expect(query.ilike).toHaveBeenCalledWith('name', '%owl%');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- filters.test.ts`
Expected: FAIL — `lib/content/filters.ts` doesn't exist yet.

- [ ] **Step 3: Implement it**

Create `lib/content/filters.ts`:

```ts
import type { ContentFilters } from './types';

export interface FilterableQuery {
  eq(column: string, value: unknown): FilterableQuery;
  ilike(column: string, pattern: string): FilterableQuery;
}

export function applyContentFilters<Q extends FilterableQuery>(query: Q, filters: ContentFilters): Q {
  let result: FilterableQuery = query;
  if (filters.systemId) {
    result = result.eq('system_id', filters.systemId);
  }
  if (filters.sourceType) {
    result = result.eq('is_homebrew', filters.sourceType === 'homebrew');
  }
  if (filters.search) {
    result = result.ilike('name', `%${filters.search}%`);
  }
  return result as Q;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- filters.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/content/filters.ts lib/content/filters.test.ts
git commit -m "Add reusable content filter logic"
```

---

## Task 5: Monster queries

**Files:**
- Create: `lib/content/monsters.ts`, `lib/content/monsters.test.ts`

**Interfaces:**
- Consumes: `applyContentFilters` (Task 4), `createSupabaseClient` (Task 2), `Monster`/`ContentFilters` types (Task 2).
- Produces: `listMonsters(client, filters): Promise<Monster[]>`, `getMonsterById(client, id): Promise<Monster | null>`, `createMonster(client, input): Promise<string>`, `updateMonster(client, id, input): Promise<void>`, and the `MonsterInput` type — all consumed by `app/monsters/page.tsx`, `app/monsters/[id]/page.tsx` (Task 7), and `app/monsters/actions.ts` (Task 8).

- [ ] **Step 1: Write the failing tests**

Create `lib/content/monsters.test.ts`:

```ts
import { listMonsters, getMonsterById, createMonster, updateMonster } from './monsters';

function createMockBuilder(result: { data: unknown; error: { message: string } | null }) {
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.ilike = vi.fn(() => builder);
  builder.insert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve);
  return builder;
}

function createMockClient(builder: any) {
  return { from: vi.fn(() => builder) } as any;
}

const sampleRow = {
  id: 'm-1',
  name: 'Owlbear',
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast'],
  description: 'Half owl, half bear.',
  stats: { 'Armor Class': '13' },
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: 'Monster Manual', is_homebrew: false },
};

describe('listMonsters', () => {
  it('returns mapped rows on success', async () => {
    const builder = createMockBuilder({ data: [sampleRow], error: null });
    const client = createMockClient(builder);

    const result = await listMonsters(client, {});

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([sampleRow]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);

    await expect(listMonsters(client, {})).rejects.toThrow('boom');
  });
});

describe('getMonsterById', () => {
  it('returns the row when found', async () => {
    const builder = createMockBuilder({ data: sampleRow, error: null });
    const client = createMockClient(builder);

    const result = await getMonsterById(client, 'm-1');

    expect(builder.eq).toHaveBeenCalledWith('id', 'm-1');
    expect(result).toEqual(sampleRow);
  });

  it('returns null when not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await getMonsterById(client, 'missing');

    expect(result).toBeNull();
  });
});

const sampleInput = {
  name: 'Owlbear',
  system_id: 'sys-1',
  source_id: 'src-1',
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast'],
  description: 'Half owl, half bear.',
  stats: { 'Armor Class': '13' },
};

describe('createMonster', () => {
  it('inserts and returns the new id', async () => {
    const builder = createMockBuilder({ data: { id: 'm-2' }, error: null });
    const client = createMockClient(builder);

    const id = await createMonster(client, sampleInput);

    expect(builder.insert).toHaveBeenCalledWith(sampleInput);
    expect(id).toBe('m-2');
  });
});

describe('updateMonster', () => {
  it('updates the row by id', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    await updateMonster(client, 'm-1', sampleInput);

    expect(builder.update).toHaveBeenCalledWith(sampleInput);
    expect(builder.eq).toHaveBeenCalledWith('id', 'm-1');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- monsters.test.ts`
Expected: FAIL — `lib/content/monsters.ts` doesn't exist yet.

- [ ] **Step 3: Implement it**

Create `lib/content/monsters.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { ContentFilters, Monster } from './types';

const MONSTER_SELECT =
  'id, name, is_homebrew, rating_label, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listMonsters(client: SupabaseClient, filters: ContentFilters): Promise<Monster[]> {
  const query = applyContentFilters(
    client.from('monsters').select(MONSTER_SELECT).order('name') as any,
    filters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list monsters: ${error.message}`);
  return (data ?? []) as unknown as Monster[];
}

export async function getMonsterById(client: SupabaseClient, id: string): Promise<Monster | null> {
  const { data, error } = await client.from('monsters').select(MONSTER_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load monster ${id}: ${error.message}`);
  return (data as unknown as Monster) ?? null;
}

export interface MonsterInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  rating_label?: string;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export async function createMonster(client: SupabaseClient, input: MonsterInput): Promise<string> {
  const { data, error } = await client.from('monsters').insert(input).select('id').single();
  if (error) throw new Error(`Failed to create monster: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateMonster(client: SupabaseClient, id: string, input: MonsterInput): Promise<void> {
  const { error } = await client.from('monsters').update(input).eq('id', id);
  if (error) throw new Error(`Failed to update monster ${id}: ${error.message}`);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- monsters.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/content/monsters.ts lib/content/monsters.test.ts
git commit -m "Add monster query layer over Supabase"
```

---

## Task 6: Monster card and filter components

**Files:**
- Create: `app/monsters/MonsterCard.tsx`, `app/monsters/MonsterCard.test.tsx`, `app/monsters/MonsterFilters.tsx`, `app/monsters/MonsterFilters.test.tsx`

**Interfaces:**
- Consumes: `Monster`, `ContentFilters`, `SourceType` types (Task 2).
- Produces: `<MonsterCard monster={Monster} />`, `<MonsterFilters systems={System[]} initial={ContentFilters} />` (emits navigation via `next/navigation`'s `useRouter`) — both consumed by `app/monsters/page.tsx` (Task 7).

- [ ] **Step 1: Write the failing test for MonsterCard**

Create `app/monsters/MonsterCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MonsterCard } from './MonsterCard';
import type { Monster } from '@/lib/content/types';

const monster: Monster = {
  id: 'm-1',
  name: 'Owlbear',
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: 'Monster Manual', is_homebrew: false },
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast', 'forest'],
  description: 'Half owl, half bear, all bad mood.',
  stats: {},
};

describe('MonsterCard', () => {
  it('shows the name, rating, system, and tags', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByText('Owlbear')).toBeInTheDocument();
    expect(screen.getByText('CR 3')).toBeInTheDocument();
    expect(screen.getByText(/D&D 5e/)).toBeInTheDocument();
    expect(screen.getByText('beast')).toBeInTheDocument();
    expect(screen.getByText('forest')).toBeInTheDocument();
  });

  it('labels official sources as Official', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('labels homebrew sources as Homebrew', () => {
    render(<MonsterCard monster={{ ...monster, is_homebrew: true }} />);
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('links to the monster detail page', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/monsters/m-1');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- MonsterCard.test.tsx`
Expected: FAIL — `app/monsters/MonsterCard.tsx` doesn't exist yet.

- [ ] **Step 3: Implement MonsterCard**

Create `app/monsters/MonsterCard.tsx`:

```tsx
import Link from 'next/link';
import type { Monster } from '@/lib/content/types';

export function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <Link href={`/monsters/${monster.id}`}>
      <article>
        <div>
          <span>{monster.name}</span>
          {monster.rating_label && <span>{monster.rating_label}</span>}
        </div>
        <div>{monster.system.name} &middot; {monster.source.name}</div>
        <span>{monster.is_homebrew ? 'Homebrew' : 'Official'}</span>
        <ul>
          {monster.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- MonsterCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Write the failing test for MonsterFilters**

Create `app/monsters/MonsterFilters.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MonsterFilters } from './MonsterFilters';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const systems = [
  { id: 'sys-1', name: 'D&D 5e' },
  { id: 'sys-2', name: 'Pathfinder 2e' },
];

describe('MonsterFilters', () => {
  beforeEach(() => push.mockClear());

  it('navigates with a search query param when typing', async () => {
    render(<MonsterFilters systems={systems} initial={{}} />);
    await userEvent.type(screen.getByLabelText(/search/i), 'owl');
    expect(push).toHaveBeenLastCalledWith('/monsters?search=owl');
  });

  it('navigates with a system query param when selected', async () => {
    render(<MonsterFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/system/i), 'sys-2');
    expect(push).toHaveBeenLastCalledWith('/monsters?systemId=sys-2');
  });

  it('navigates with a sourceType query param when selected', async () => {
    render(<MonsterFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/source/i), 'homebrew');
    expect(push).toHaveBeenLastCalledWith('/monsters?sourceType=homebrew');
  });
});
```

- [ ] **Step 6: Run it to confirm it fails**

Run: `npm test -- MonsterFilters.test.tsx`
Expected: FAIL — `app/monsters/MonsterFilters.tsx` doesn't exist yet.

- [ ] **Step 7: Implement MonsterFilters**

Create `app/monsters/MonsterFilters.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import type { ContentFilters, System } from '@/lib/content/types';

function pushFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  const query = params.toString();
  router.push(query ? `/monsters?${query}` : '/monsters');
}

export function MonsterFilters({ systems, initial }: { systems: System[]; initial: ContentFilters }) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="monster-search">
        Search
        <input
          id="monster-search"
          type="text"
          defaultValue={initial.search ?? ''}
          onChange={(e) => pushFilters(router, { ...initial, search: e.target.value || undefined })}
        />
      </label>
      <label htmlFor="monster-system">
        System
        <select
          id="monster-system"
          defaultValue={initial.systemId ?? ''}
          onChange={(e) => pushFilters(router, { ...initial, systemId: e.target.value || undefined })}
        >
          <option value="">All</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="monster-source">
        Source
        <select
          id="monster-source"
          defaultValue={initial.sourceType ?? ''}
          onChange={(e) =>
            pushFilters(router, {
              ...initial,
              sourceType: (e.target.value || undefined) as ContentFilters['sourceType'],
            })
          }
        >
          <option value="">All</option>
          <option value="official">Official</option>
          <option value="homebrew">Homebrew</option>
        </select>
      </label>
    </div>
  );
}
```

- [ ] **Step 8: Run tests to confirm they pass**

Run: `npm test -- MonsterFilters.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add app/monsters/MonsterCard.tsx app/monsters/MonsterCard.test.tsx app/monsters/MonsterFilters.tsx app/monsters/MonsterFilters.test.tsx
git commit -m "Add monster card and filter UI components"
```

---

## Task 7: Monster browse and detail pages

**Files:**
- Create: `app/monsters/page.tsx`, `app/monsters/[id]/page.tsx`

**Interfaces:**
- Consumes: `listMonsters`, `getMonsterById` (Task 5), `createSupabaseClient` (Task 2), `MonsterCard`, `MonsterFilters` (Task 6). Assumes at least one row exists in `systems` for the filter dropdown — seeded in Task 9, or added by hand via the Supabase table editor for manual testing before that.
- Produces: the `/monsters` and `/monsters/[id]` routes, which Task 8's forms link to and redirect back to.

These are Server Components that fetch from a live Supabase database — not practical to unit test without standing up test infrastructure this project doesn't otherwise need (see Task 5's mocked-client tests for the query logic itself, which *is* unit tested). Verification here is manual, against a real dev database.

- [ ] **Step 1: Implement the browse page**

Create `app/monsters/page.tsx`:

```tsx
import { createSupabaseClient } from '@/lib/supabase/client';
import { listMonsters } from '@/lib/content/monsters';
import { MonsterCard } from './MonsterCard';
import { MonsterFilters } from './MonsterFilters';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';

export default async function MonstersPage({
  searchParams,
}: {
  searchParams: { search?: string; systemId?: string; sourceType?: string };
}) {
  const client = createSupabaseClient();

  const { data: systems } = await client.from('systems').select('id, name').order('name');

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
  };

  const monsters = await listMonsters(client, filters);

  return (
    <main>
      <h1>Monsters</h1>
      <a href="/monsters/new">+ Add entry</a>
      <MonsterFilters systems={(systems ?? []) as System[]} initial={filters} />
      {monsters.length === 0 ? (
        <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
      ) : (
        <div>
          {monsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Implement the detail page**

Create `app/monsters/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';

export default async function MonsterDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  return (
    <main>
      <a href="/monsters">&larr; Back to Monsters</a>
      <h1>{monster.name}</h1>
      <p>
        {monster.system.name} &middot; {monster.rating_label}
      </p>
      <a href={`/monsters/${monster.id}/edit`}>Edit entry</a>
      <p>{monster.description}</p>
      <dl>
        {Object.entries(monster.stats).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ul>
        {monster.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 3: Manually verify against a real database**

In the Supabase SQL editor, run `lib/supabase/schema.sql`, then insert one row each into `systems` and `sources`, and one into `monsters` referencing them. Run `npm run dev`, log in at `/login`, visit `/monsters` — expect the seeded monster's card to appear with correct name/rating/system/source-badge/tags, the search box to filter it out when typing a non-matching term, and the system/source selects to filter it out when set to a non-matching value. Click the card — expect the detail page to render its description, stats, and tags, with a working "Back to Monsters" link.

- [ ] **Step 4: Commit**

```bash
git add app/monsters/page.tsx "app/monsters/[id]/page.tsx"
git commit -m "Add monster browse and detail pages"
```

---

## Task 8: Add/edit monster form

**Files:**
- Create: `lib/content/validate-monster.ts`, `lib/content/validate-monster.test.ts`, `app/monsters/MonsterForm.tsx`, `app/monsters/actions.ts`, `app/monsters/new/page.tsx`, `app/monsters/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `MonsterInput` type, `createMonster`, `updateMonster` (Task 5); `createSupabaseClient` (Task 2); `getMonsterById` (Task 5, for pre-filling the edit form).
- Produces: `validateMonsterInput(input: Partial<MonsterInput>): string[]` (list of error messages, empty when valid) — used by `app/monsters/actions.ts`.

- [ ] **Step 1: Write the failing tests for validation**

Create `lib/content/validate-monster.test.ts`:

```ts
import { validateMonsterInput } from './validate-monster';

describe('validateMonsterInput', () => {
  it('returns no errors for a complete input', () => {
    const errors = validateMonsterInput({
      name: 'Owlbear',
      system_id: 'sys-1',
      source_id: 'src-1',
      description: 'Half owl, half bear.',
    });
    expect(errors).toEqual([]);
  });

  it('requires a name', () => {
    const errors = validateMonsterInput({ system_id: 'sys-1', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('Name is required.');
  });

  it('requires a system', () => {
    const errors = validateMonsterInput({ name: 'Owlbear', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('System is required.');
  });

  it('requires a source', () => {
    const errors = validateMonsterInput({ name: 'Owlbear', system_id: 'sys-1', description: 'x' });
    expect(errors).toContain('Source is required.');
  });

  it('collects multiple errors at once', () => {
    const errors = validateMonsterInput({});
    expect(errors).toEqual(
      expect.arrayContaining(['Name is required.', 'System is required.', 'Source is required.']),
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- validate-monster.test.ts`
Expected: FAIL — `lib/content/validate-monster.ts` doesn't exist yet.

- [ ] **Step 3: Implement validation**

Create `lib/content/validate-monster.ts`:

```ts
import type { MonsterInput } from './monsters';

export function validateMonsterInput(input: Partial<MonsterInput>): string[] {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push('Name is required.');
  if (!input.system_id) errors.push('System is required.');
  if (!input.source_id) errors.push('Source is required.');
  return errors;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- validate-monster.test.ts`
Expected: PASS

- [ ] **Step 5: Write the server actions**

Create `app/monsters/actions.ts`:

```ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonster, updateMonster, type MonsterInput } from '@/lib/content/monsters';
import { validateMonsterInput } from '@/lib/content/validate-monster';

function readInput(formData: FormData): Partial<MonsterInput> {
  const sourceId = String(formData.get('source_id') ?? '');
  const isHomebrew = formData.get('is_homebrew') === 'on';
  return {
    name: String(formData.get('name') ?? '').trim(),
    system_id: String(formData.get('system_id') ?? ''),
    source_id: sourceId,
    is_homebrew: isHomebrew,
    rating_label: String(formData.get('rating_label') ?? '') || undefined,
    description: String(formData.get('description') ?? ''),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    stats: {},
  };
}

export async function createMonsterAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();
  const id = await createMonster(client, input as MonsterInput);
  redirect(`/monsters/${id}`);
}

export async function updateMonsterAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();
  await updateMonster(client, id, input as MonsterInput);
  redirect(`/monsters/${id}`);
}
```

- [ ] **Step 6: Write the shared form component**

Create `app/monsters/MonsterForm.tsx`:

```tsx
import type { Monster, System } from '@/lib/content/types';

export function MonsterForm({
  action,
  systems,
  monster,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  monster?: Monster;
  error?: string;
}) {
  return (
    <form action={action}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="name">
        Name
        <input id="name" name="name" defaultValue={monster?.name} required />
      </label>
      <label htmlFor="system_id">
        System
        <select id="system_id" name="system_id" defaultValue={monster?.system.id} required>
          <option value="">Choose a system</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="source_id">
        Source id
        <input id="source_id" name="source_id" defaultValue={monster?.source.id} required />
      </label>
      <label htmlFor="is_homebrew">
        Homebrew
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={monster?.is_homebrew} />
      </label>
      <label htmlFor="rating_label">
        Rating label
        <input id="rating_label" name="rating_label" defaultValue={monster?.rating_label ?? ''} />
      </label>
      <label htmlFor="tags">
        Tags (comma separated)
        <input id="tags" name="tags" defaultValue={monster?.tags.join(', ')} />
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={monster?.description} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
```

Source is a raw id field rather than a dropdown in this v1 — picking a source means knowing its id from the Supabase table editor. A friendlier source picker is a natural follow-up once there's enough real source data to make a dropdown worthwhile.

- [ ] **Step 7: Wire up the new/edit pages**

Create `app/monsters/new/page.tsx`:

```tsx
import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonsterAction } from '../actions';
import { MonsterForm } from '../MonsterForm';
import type { System } from '@/lib/content/types';

export default async function NewMonsterPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const { data: systems } = await client.from('systems').select('id, name').order('name');

  return (
    <main>
      <h1>Add a monster</h1>
      <MonsterForm action={createMonsterAction} systems={(systems ?? []) as System[]} error={searchParams.error} />
    </main>
  );
}
```

Create `app/monsters/[id]/edit/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { updateMonsterAction } from '../../actions';
import { MonsterForm } from '../../MonsterForm';
import type { System } from '@/lib/content/types';

export default async function EditMonsterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  const { data: systems } = await client.from('systems').select('id, name').order('name');
  const boundAction = updateMonsterAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {monster.name}</h1>
      <MonsterForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        monster={monster}
        error={searchParams.error}
      />
    </main>
  );
}
```

- [ ] **Step 8: Manually verify create and edit**

With the dev server running and logged in: visit `/monsters/new`, submit with the Name field blank — expect the error message and no new row. Fill in a name, an existing system id, and an existing source id from Supabase's table editor, submit — expect a redirect to the new monster's detail page showing the saved data. From that detail page, click "Edit entry", change the description, submit — expect the redirect back to the detail page showing the updated description.

- [ ] **Step 9: Commit**

```bash
git add lib/content/validate-monster.ts lib/content/validate-monster.test.ts app/monsters/MonsterForm.tsx app/monsters/actions.ts "app/monsters/new" "app/monsters/[id]/edit"
git commit -m "Add monster create/edit form and server actions"
```

---

## Task 9: Seed script for SRD monsters

**Files:**
- Create: `lib/content/open5e-mapper.ts`, `lib/content/open5e-mapper.test.ts`, `scripts/seed-srd-monsters.ts`

**Interfaces:**
- Consumes: `createSupabaseClient` (Task 2), `createMonster`/`MonsterInput` (Task 5).
- Produces: `mapOpen5eMonsterToRow(raw: Open5eMonster, systemId: string, sourceId: string): MonsterInput` — used only by the seed script.

- [ ] **Step 1: Write the failing test for the mapper**

Create `lib/content/open5e-mapper.test.ts`:

```ts
import { mapOpen5eMonsterToRow } from './open5e-mapper';

const raw = {
  name: 'Owlbear',
  challenge_rating: '3',
  armor_class: 13,
  hit_points: 59,
  speed: { walk: 40 },
  type: 'monstrosity',
  desc: 'A dangerous forest predator.',
};

describe('mapOpen5eMonsterToRow', () => {
  it('maps name, rating label, tags, and description', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.name).toBe('Owlbear');
    expect(row.rating_label).toBe('CR 3');
    expect(row.tags).toEqual(['monstrosity']);
    expect(row.description).toBe('A dangerous forest predator.');
  });

  it('sets system_id, source_id, and is_homebrew=false', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.system_id).toBe('sys-1');
    expect(row.source_id).toBe('src-1');
    expect(row.is_homebrew).toBe(false);
  });

  it('maps known stat fields into the stats bag', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.stats['Armor Class']).toBe('13');
    expect(row.stats['Hit Points']).toBe('59');
    expect(row.stats['Speed']).toBe('40 ft.');
  });

  it('falls back to an empty description when none is given', () => {
    const row = mapOpen5eMonsterToRow({ ...raw, desc: undefined }, 'sys-1', 'src-1');
    expect(row.description).toBe('');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- open5e-mapper.test.ts`
Expected: FAIL — `lib/content/open5e-mapper.ts` doesn't exist yet.

- [ ] **Step 3: Implement the mapper**

Create `lib/content/open5e-mapper.ts`:

```ts
import type { MonsterInput } from './monsters';

export interface Open5eMonster {
  name: string;
  challenge_rating?: string;
  armor_class?: number;
  hit_points?: number;
  speed?: { walk?: number };
  type?: string;
  desc?: string;
}

export function mapOpen5eMonsterToRow(raw: Open5eMonster, systemId: string, sourceId: string): MonsterInput {
  return {
    name: raw.name,
    system_id: systemId,
    source_id: sourceId,
    is_homebrew: false,
    rating_label: raw.challenge_rating ? `CR ${raw.challenge_rating}` : undefined,
    tags: raw.type ? [raw.type] : [],
    description: raw.desc ?? '',
    stats: {
      ...(raw.armor_class !== undefined ? { 'Armor Class': String(raw.armor_class) } : {}),
      ...(raw.hit_points !== undefined ? { 'Hit Points': String(raw.hit_points) } : {}),
      ...(raw.speed?.walk !== undefined ? { Speed: `${raw.speed.walk} ft.` } : {}),
    },
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test -- open5e-mapper.test.ts`
Expected: PASS

- [ ] **Step 5: Write the seed script**

Create `scripts/seed-srd-monsters.ts`:

```ts
import { createSupabaseClient } from '../lib/supabase/client';
import { createMonster } from '../lib/content/monsters';
import { mapOpen5eMonsterToRow, type Open5eMonster } from '../lib/content/open5e-mapper';

const OPEN5E_URL = 'https://api.open5e.com/monsters/?limit=1000';

async function main() {
  const client = createSupabaseClient();

  const { data: system, error: systemError } = await client
    .from('systems')
    .select('id')
    .eq('slug', 'dnd-5e')
    .single();
  if (systemError || !system) {
    throw new Error('Run once with a "D&D 5e" / "dnd-5e" row in systems before seeding.');
  }

  const { data: source, error: sourceError } = await client
    .from('sources')
    .select('id')
    .eq('name', 'SRD')
    .eq('system_id', system.id)
    .single();
  if (sourceError || !source) {
    throw new Error('Run once with an "SRD" row in sources (system D&D 5e, is_homebrew=false) before seeding.');
  }

  const response = await fetch(OPEN5E_URL);
  if (!response.ok) throw new Error(`Open5e request failed: ${response.status}`);
  const body = (await response.json()) as { results: Open5eMonster[] };

  let created = 0;
  for (const raw of body.results) {
    const row = mapOpen5eMonsterToRow(raw, system.id, source.id);
    await createMonster(client, row);
    created += 1;
  }

  console.log(`Seeded ${created} monsters from the Open5e SRD.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Manually run the seed script once**

In the Supabase SQL editor, insert a `systems` row (`name='D&D 5e'`, `slug='dnd-5e'`) and a `sources` row (`name='SRD'`, matching `system_id`, `is_homebrew=false`) if they don't already exist from Task 7's manual testing. Then run:

```bash
npx tsx scripts/seed-srd-monsters.ts
```

Expected: the script logs `Seeded N monsters from the Open5e SRD.` and `/monsters` in the running app shows them. This is a one-time step — the deployed app never calls Open5e itself (Global Constraints).

- [ ] **Step 7: Commit**

```bash
git add lib/content/open5e-mapper.ts lib/content/open5e-mapper.test.ts scripts/seed-srd-monsters.ts
git commit -m "Add one-time Open5e SRD seed script"
```

---

## Task 10: Deploy

**Files:** none (configuration only)

**Interfaces:** none — this task makes the app reachable at a public URL for the first time.

- [ ] **Step 1: Create the Supabase project**

Create a free Supabase project. In the SQL editor, run `lib/supabase/schema.sql`. Note the project URL and the `service_role` key (Project Settings → API) for the next step.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel
```

Follow the prompts to link/create a Vercel project from this directory.

- [ ] **Step 3: Set production environment variables**

In the Vercel project settings, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SITE_PASSWORD` (a real password, not the local test one) as environment variables, then trigger a redeploy:

```bash
npx vercel --prod
```

- [ ] **Step 4: Smoke test the deployed app**

Visit the Vercel URL — expect a redirect to `/login`. Log in with the production `SITE_PASSWORD` — expect a redirect to `/monsters` showing the seeded data (run Task 9's seed script against the production Supabase project first, or add a row by hand, if `/monsters` is empty). Confirm `/monsters/new` and editing an existing entry both work against the production database.

- [ ] **Step 5: Commit the Vercel project link**

```bash
git add .vercel 2>/dev/null || true
git commit -m "Link Vercel project" --allow-empty
```

(`vercel` writes `.vercel/project.json` locally; committing it is optional — skip this step if you'd rather keep that file untracked and out of the repo.)

---

## What's next

Items, Spells, and Rules follow the exact same shape as Monsters (Tasks 4-8 reused schema, filter, and query patterns already cover their tables). Once this Monsters slice has been used for a session or two and any rough edges from the design preview are worked out, a follow-on plan can extract the generic pieces (`MonsterCard`/`MonsterFilters`/`MonsterForm` → generic `ContentCard`/`ContentFilters`/`ContentForm` parameterized by content type) and add the three remaining browse/detail/form page sets from there.
