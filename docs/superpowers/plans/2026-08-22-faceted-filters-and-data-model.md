# Faceted Filters & Data Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Task 5 is a manual, human-approval-gated step — do not let a subagent auto-complete it. It must not run until the human has reviewed Task 4's spot-check output and explicitly said to proceed.**

**Goal:** Give every content type (Monsters, Items, Spells, Rules) real, structured, filterable facets — new `combat_role`/`race`/`tier` columns on Monsters, new `school`/`mana_cost` columns on Spells, and exposed-as-filters existing columns (`item_type`/`rarity` on Items, `category` on Rules) — wired into the sidebar, forms, cards, and detail pages.

**Architecture:** Additive columns on `monsters`/`spells` (nullable except `tier`, which gets a `NOT NULL DEFAULT 'Normal'`). A shared `ContentFilters` type and `applyContentFilters` query helper (already used by all four content types) grow new optional fields, each translated to a Supabase `.eq()` (or, for the bucketed `mana_cost`, `.gte()`/`.lte()`) call. A new generic `listFacetCounts` helper (sibling to the existing `listTagCounts`) computes per-value counts for the sidebar. The `Sidebar` component — already the single shared, category-aware component that renders the Tags section for all four pages — grows an optional `facets` prop so each page can pass its own facet groups without duplicating sidebar-rendering code. Per-type files (`page.tsx`, `*Filters.tsx`, `*Form.tsx`, `*Card.tsx`, `[id]/page.tsx`) are edited individually per type, matching this codebase's existing per-type-duplication convention — this plan does not introduce a new shared abstraction across those files, since none exists today and inventing one now would be an unrequested refactor.

**Tech Stack:** Next.js 14 (app router, server components + server actions), Supabase (`@supabase/supabase-js`), Vitest + Testing Library, plain CSS Modules.

**Spec:** `docs/superpowers/specs/2026-08-18-fantasy-redesign-and-facets-design.md` (sections 5-9 specifically — sections 1-4 were the visual redesign, already implemented and merged).

## Global Constraints

- Test command: `npm test` (maps to `vitest run`). All existing tests in the files this plan touches use a **mocked** `SupabaseClient` (see `lib/content/monsters.test.ts`, `lib/content/filters.test.ts`, `lib/content/sidebar.test.ts` for the exact mock shape) — never write a test that hits a live Supabase instance.
- **Schema changes are applied manually.** This repo has no migration runner (`schema.sql` is a single hand-applied file, per its own header comments about the Supabase SQL editor) and no `supabase/` CLI project. Task 1's SQL must be run by a human in the Supabase SQL editor before Tasks 4/5's scripts (which hit the live DB) can run. Automated tests are unaffected either way since they mock the client.
- **Never write the judgment-pass backfill values to the live database without human review first.** This is spec §6's explicit requirement, and it is a hard-to-reverse action against shared production data. Task 4 only generates and prints a spot-check sample — it does not call any `update`/`insert`. Task 5 is the only task that writes to the live DB, and it must not start until a human has seen Task 4's spot-check sample and said to proceed.
- Preserve each per-type file's existing duplication pattern (`MonsterFilters.tsx`/`SpellFilters.tsx`/`ItemFilters.tsx`/`RuleFilters.tsx` are near-identical siblings, as are the four `page.tsx` files, as are the four `read-input.ts` files) — extend each one individually with only the fields relevant to its content type. Do not unify them into a shared generic component; that convention doesn't exist in this codebase today.
- New facet-group swatches in the Sidebar and new badges on cards/detail pages reuse the **existing, already-WCAG-verified** `--cat-monsters` / `--cat-items` / `--cat-spells` / `--cat-rules` tokens from `app/globals.css` (all ≥4.5:1 on the white `--panel` background — `--cat-spells` at #4b3a7a measures ~9.6:1). Do not introduce new hardcoded colors for this work; introducing an unvetted color was the exact mistake the visual-redesign plan had to fix once already (`--cat-items` originally failed contrast).
- Icons follow the established pattern in `app/content/icons.tsx`: a function component spreading a shared `defaults` object (24x24 viewBox, stroke-based) then `{...props}`.

---

## File Structure

**New files:**
- `lib/content/facets.ts` — `listFacetCounts` (generic single-column value+count) and `listManaCostBucketCounts` (spell-specific bucket counts), both mirroring `lib/content/sidebar.ts`'s `listTagCounts`.
- `lib/content/facets.test.ts` — tests for the above.
- `scripts/derive-deterministic-facets.ts` — pure functions (`deriveMonsterTier`, `deriveMonsterRaceFromTags`, `deriveSpellSchoolFromTags`) used by both the backfill script and their own unit tests.
- `scripts/derive-deterministic-facets.test.ts` — tests for the pure functions.
- `scripts/backfill-deterministic-facets.ts` — applies the deterministic derivations (tier, D&D-SRD/exact-match race, spell school) to the live DB. Safe to run any time after Task 1's migration; idempotent.
- `scripts/backfill-judgment-facets-data.ts` — the judgment-pass lookup table (`combat_role` for every monster, `race` for the Nimble monsters whose tags are thematic groupings rather than a clean creature type, `mana_cost` for every spell), populated by reading each entry's description/stats, plus a `printSpotCheckSample()` export.
- `scripts/print-facet-spot-check.ts` — CLI entry point that imports `backfill-judgment-facets-data.ts` and prints a random 20-row sample for human review. Writes nothing.
- `scripts/apply-judgment-facets.ts` — CLI entry point that applies `backfill-judgment-facets-data.ts`'s values to the live DB. **Only run after human approval of the spot-check.**
- `app/content/FacetGroup.tsx` shape is NOT a new file — facet-group rendering is added directly inside `app/Sidebar.tsx` (see Task 6), since `Sidebar` is already the one shared, category-aware component all four pages use for the Tags section.

**Modified files (grouped by task):**
- Task 1: `lib/supabase/schema.sql`, `lib/content/types.ts`, `lib/content/monsters.ts`, `lib/content/spells.ts`
- Task 2: `lib/content/filters.ts`, `lib/content/filters.test.ts`
- Task 3: `lib/content/facets.ts` (new, see above), `lib/content/facets.test.ts` (new)
- Task 6: `app/Sidebar.tsx`, `app/Sidebar.module.css`, `app/content/icons.tsx`
- Task 7: `app/monsters/MonsterForm.tsx`, `app/monsters/read-input.ts`, `app/monsters/read-input.test.ts`
- Task 8: `app/monsters/page.tsx`, `app/monsters/MonsterFilters.tsx`
- Task 9: `app/spells/SpellForm.tsx`, `app/spells/read-input.ts`, `app/spells/read-input.test.ts`
- Task 10: `app/spells/page.tsx`, `app/spells/SpellFilters.tsx`
- Task 11: `app/items/page.tsx`
- Task 12: `app/rules/page.tsx`
- Task 13: `app/monsters/MonsterCard.tsx`, `app/monsters/MonsterCard.module.css`, `app/monsters/MonsterCard.test.tsx`, `app/monsters/[id]/page.tsx`, `app/monsters/[id]/page.module.css`
- Task 14: `app/spells/SpellCard.tsx`, `app/spells/SpellCard.module.css`, `app/spells/SpellCard.test.tsx`, `app/spells/[id]/page.tsx`, `app/spells/[id]/page.module.css`

---

### Task 1: Schema migration, types, and query-layer columns

**Files:**
- Modify: `lib/supabase/schema.sql`
- Modify: `lib/content/types.ts`
- Modify: `lib/content/monsters.ts`
- Modify: `lib/content/spells.ts`

**Interfaces:**
- Produces: `CombatRole = 'Melee' | 'Ranged'`, `MonsterTier = 'Normal' | 'Legendary' | 'Minion'`, `ManaCostBucket = '0' | '1-2' | '3+'` (all exported from `lib/content/types.ts`). `Monster.combat_role: CombatRole | null`, `Monster.race: string | null`, `Monster.tier: MonsterTier`. `Spell.school: string | null`, `Spell.mana_cost: number | null`. `MonsterInput.combat_role?/.race?/.tier?`, `SpellInput.school?/.mana_cost?`.

- [ ] **Step 1: Add the migration to `schema.sql`**

Append after the existing `create table rules (...)` block (before the indexes section), so a fresh database and an already-seeded one both work from the same file:

```sql
-- Faceted-filter columns (2026-08-22). Safe to re-run: IF NOT EXISTS guards
-- both the column adds and the tier default backfills existing rows to
-- 'Normal' automatically as part of the ALTER (Postgres applies a constant
-- DEFAULT to existing rows in the same statement that adds a NOT NULL column).
alter table monsters add column if not exists combat_role text;
alter table monsters add column if not exists race text;
alter table monsters add column if not exists tier text not null default 'Normal';

alter table spells add column if not exists school text;
alter table spells add column if not exists mana_cost integer;
```

Add a comment above it noting this must be run manually in the Supabase SQL editor (matching this file's existing self-documentation style for the GRANT statements above).

- [ ] **Step 2: Add the new types**

In `lib/content/types.ts`, add above `Monster`:

```ts
export type CombatRole = 'Melee' | 'Ranged';
export type MonsterTier = 'Normal' | 'Legendary' | 'Minion';
export type ManaCostBucket = '0' | '1-2' | '3+';
```

Update `Monster`:

```ts
export interface Monster {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  rating_label: string | null;
  combat_role: CombatRole | null;
  race: string | null;
  tier: MonsterTier;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}
```

Update `Spell`:

```ts
export interface Spell {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  level: string | null;
  school: string | null;
  mana_cost: number | null;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}
```

Update `ContentFilters`:

```ts
export interface ContentFilters {
  systemId?: string;
  sourceType?: SourceType;
  search?: string;
  tags?: string[];
  combatRole?: CombatRole;
  race?: string;
  tier?: MonsterTier;
  itemType?: string;
  rarity?: string;
  school?: string;
  manaCostBucket?: ManaCostBucket;
  category?: string;
}
```

- [ ] **Step 3: Update the Monster query layer**

In `lib/content/monsters.ts`, change `MONSTER_SELECT`:

```ts
const MONSTER_SELECT =
  'id, name, is_homebrew, rating_label, combat_role, race, tier, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';
```

Update `MonsterInput`:

```ts
export interface MonsterInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  rating_label?: string;
  combat_role?: CombatRole;
  race?: string;
  tier?: MonsterTier;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}
```

Add `CombatRole` and `MonsterTier` to the existing `import type { ContentFilters, Monster } from './types';` line.

- [ ] **Step 4: Update the Spell query layer**

In `lib/content/spells.ts`, change `SPELL_SELECT`:

```ts
const SPELL_SELECT =
  'id, name, is_homebrew, level, school, mana_cost, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';
```

Update `SpellInput`:

```ts
export interface SpellInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  level?: string;
  school?: string;
  mana_cost?: number;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}
```

- [ ] **Step 5: Run the existing test suite to confirm nothing broke**

Run: `npm test`
Expected: PASS. `lib/content/monsters.test.ts` and `lib/content/spells.test.ts` assert structural pass-through against mocked rows (`toEqual`), so they're unaffected by the new optional fields — this step is a regression check, not new coverage. (New-column coverage comes from Tasks 7-10's `read-input` tests and Task 2's `filters` tests.)

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/schema.sql lib/content/types.ts lib/content/monsters.ts lib/content/spells.ts
git commit -m "Add combat_role/race/tier and school/mana_cost columns and types"
```

---

### Task 2: Extend `applyContentFilters` for the new facets

**Files:**
- Modify: `lib/content/filters.ts`
- Modify: `lib/content/filters.test.ts`

**Interfaces:**
- Consumes: `ContentFilters` (Task 1) — `combatRole`, `race`, `tier`, `itemType`, `rarity`, `school`, `category` (all plain equality), `manaCostBucket` (bucketed range).
- Produces: `FilterableQuery` gains `gte`/`lte`; `applyContentFilters` applies all new fields. Used by every `list*` function in `lib/content/{monsters,items,spells,rules}.ts` (no changes needed there — they already call `applyContentFilters`).

- [ ] **Step 1: Write the failing tests**

Add to `lib/content/filters.test.ts`, extending `createMockQuery`'s return type to include `gte`/`lte`, and the function itself:

```ts
function createMockQuery(): FilterableQuery & { eq: any; ilike: any; overlaps: any; gte: any; lte: any } {
  const query: any = {};
  query.eq = vi.fn(() => query);
  query.ilike = vi.fn(() => query);
  query.overlaps = vi.fn(() => query);
  query.gte = vi.fn(() => query);
  query.lte = vi.fn(() => query);
  return query;
}
```

Add new `describe` blocks:

```ts
describe('applyContentFilters — new facets', () => {
  it('filters by combatRole', () => {
    const query = createMockQuery();
    applyContentFilters(query, { combatRole: 'Melee' });
    expect(query.eq).toHaveBeenCalledWith('combat_role', 'Melee');
  });

  it('filters by race', () => {
    const query = createMockQuery();
    applyContentFilters(query, { race: 'Dragon' });
    expect(query.eq).toHaveBeenCalledWith('race', 'Dragon');
  });

  it('filters by tier', () => {
    const query = createMockQuery();
    applyContentFilters(query, { tier: 'Legendary' });
    expect(query.eq).toHaveBeenCalledWith('tier', 'Legendary');
  });

  it('filters by itemType', () => {
    const query = createMockQuery();
    applyContentFilters(query, { itemType: 'Weapon' });
    expect(query.eq).toHaveBeenCalledWith('item_type', 'Weapon');
  });

  it('filters by rarity', () => {
    const query = createMockQuery();
    applyContentFilters(query, { rarity: 'Rare' });
    expect(query.eq).toHaveBeenCalledWith('rarity', 'Rare');
  });

  it('filters by school', () => {
    const query = createMockQuery();
    applyContentFilters(query, { school: 'Fire' });
    expect(query.eq).toHaveBeenCalledWith('school', 'Fire');
  });

  it('filters by category', () => {
    const query = createMockQuery();
    applyContentFilters(query, { category: 'Combat' });
    expect(query.eq).toHaveBeenCalledWith('category', 'Combat');
  });

  it('filters manaCostBucket "0" as an equality check', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '0' });
    expect(query.eq).toHaveBeenCalledWith('mana_cost', 0);
  });

  it('filters manaCostBucket "1-2" as a gte/lte range', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '1-2' });
    expect(query.gte).toHaveBeenCalledWith('mana_cost', 1);
    expect(query.lte).toHaveBeenCalledWith('mana_cost', 2);
  });

  it('filters manaCostBucket "3+" as a gte-only range', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '3+' });
    expect(query.gte).toHaveBeenCalledWith('mana_cost', 3);
    expect(query.lte).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- filters.test.ts`
Expected: FAIL — `applyContentFilters` doesn't yet read these fields, and `FilterableQuery` doesn't yet declare `gte`/`lte` (TypeScript compile error on the mock as well as assertion failures).

- [ ] **Step 3: Implement**

Replace the full contents of `lib/content/filters.ts`:

```ts
import type { ContentFilters } from './types';

export interface FilterableQuery {
  eq(column: string, value: unknown): FilterableQuery;
  ilike(column: string, pattern: string): FilterableQuery;
  overlaps(column: string, value: unknown[]): FilterableQuery;
  gte(column: string, value: unknown): FilterableQuery;
  lte(column: string, value: unknown): FilterableQuery;
}

function applyManaCostBucket(query: FilterableQuery, bucket: ContentFilters['manaCostBucket']): FilterableQuery {
  if (bucket === '0') return query.eq('mana_cost', 0);
  if (bucket === '1-2') return query.gte('mana_cost', 1).lte('mana_cost', 2);
  if (bucket === '3+') return query.gte('mana_cost', 3);
  return query;
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
  if (filters.tags && filters.tags.length > 0) {
    result = result.overlaps('tags', filters.tags);
  }
  if (filters.combatRole) {
    result = result.eq('combat_role', filters.combatRole);
  }
  if (filters.race) {
    result = result.eq('race', filters.race);
  }
  if (filters.tier) {
    result = result.eq('tier', filters.tier);
  }
  if (filters.itemType) {
    result = result.eq('item_type', filters.itemType);
  }
  if (filters.rarity) {
    result = result.eq('rarity', filters.rarity);
  }
  if (filters.school) {
    result = result.eq('school', filters.school);
  }
  if (filters.category) {
    result = result.eq('category', filters.category);
  }
  if (filters.manaCostBucket) {
    result = applyManaCostBucket(result, filters.manaCostBucket);
  }
  return result as Q;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- filters.test.ts`
Expected: PASS (all existing tests plus the new ones).

- [ ] **Step 5: Commit**

```bash
git add lib/content/filters.ts lib/content/filters.test.ts
git commit -m "Extend applyContentFilters for the new per-type facets"
```

---

### Task 3: Facet-count query helpers

**Files:**
- Create: `lib/content/facets.ts`
- Create: `lib/content/facets.test.ts`

**Interfaces:**
- Consumes: `SupabaseClient` (from `@supabase/supabase-js`), same shape `lib/content/sidebar.ts`'s `listTagCounts` consumes.
- Produces: `listFacetCounts(client, table, column, systemId?): Promise<FacetCount[]>` where `FacetCount = { value: string; count: number }`; `listManaCostBucketCounts(client, systemId?): Promise<ManaCostBucketCount[]>` where `ManaCostBucketCount = { bucket: ManaCostBucket; count: number }`. Consumed by Tasks 8/10/11/12's `page.tsx` changes.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/facets.test.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { listFacetCounts, listManaCostBucketCounts } from './facets';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(resultsByTable: Record<string, any>) {
  const from = vi.fn((table: string) => ({
    select: vi.fn(() => Promise.resolve(resultsByTable[table])),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from } as any;
}

describe('listFacetCounts', () => {
  it('counts how many rows carry each value in the given column', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ tier: 'Normal' }, { tier: 'Legendary' }, { tier: 'Normal' }],
        error: null,
      },
    });

    const result = await listFacetCounts(client, 'monsters', 'tier');

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([
      { value: 'Legendary', count: 1 },
      { value: 'Normal', count: 2 },
    ]);
  });

  it('skips null and empty values', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ combat_role: 'Melee' }, { combat_role: null }, { combat_role: '' }],
        error: null,
      },
    });

    const result = await listFacetCounts(client, 'monsters', 'combat_role');

    expect(result).toEqual([{ value: 'Melee', count: 1 }]);
  });

  it('returns an empty array when there is no data', async () => {
    const client = createMockClient({ monsters: { data: [], error: null } });
    const result = await listFacetCounts(client, 'monsters', 'tier');
    expect(result).toEqual([]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({ monsters: { data: null, error: { message: 'boom' } } });
    await expect(listFacetCounts(client, 'monsters', 'tier')).rejects.toThrow('boom');
  });

  it('scopes the query by systemId when provided', async () => {
    const eq = vi.fn(() => Promise.resolve({ data: [{ tier: 'Normal' }], error: null }));
    const from = vi.fn(() => ({ select: vi.fn(() => ({ eq })) }));
    const client = { from } as unknown as SupabaseClient;

    await listFacetCounts(client, 'monsters', 'tier', 'system-123');

    expect(eq).toHaveBeenCalledWith('system_id', 'system-123');
  });
});

describe('listManaCostBucketCounts', () => {
  it('buckets 0, 1-2, and 3+ separately', async () => {
    const client = createMockClient({
      spells: {
        data: [{ mana_cost: 0 }, { mana_cost: 1 }, { mana_cost: 2 }, { mana_cost: 3 }, { mana_cost: 8 }],
        error: null,
      },
    });

    const result = await listManaCostBucketCounts(client);

    expect(client.from).toHaveBeenCalledWith('spells');
    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 2 },
      { bucket: '3+', count: 2 },
    ]);
  });

  it('skips null mana_cost values', async () => {
    const client = createMockClient({
      spells: { data: [{ mana_cost: null }, { mana_cost: 0 }], error: null },
    });

    const result = await listManaCostBucketCounts(client);

    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 0 },
      { bucket: '3+', count: 0 },
    ]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({ spells: { data: null, error: { message: 'boom' } } });
    await expect(listManaCostBucketCounts(client)).rejects.toThrow('boom');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- facets.test.ts`
Expected: FAIL with "Cannot find module './facets'".

- [ ] **Step 3: Implement**

Create `lib/content/facets.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ManaCostBucket } from './types';

export interface FacetCount {
  value: string;
  count: number;
}

export async function listFacetCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  column: string,
  systemId?: string,
): Promise<FacetCount[]> {
  let query = client.from(table).select(column);
  if (systemId) query = query.eq('system_id', systemId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ${table} ${column} counts: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Record<string, string | null>[]) {
    const value = row[column];
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export interface ManaCostBucketCount {
  bucket: ManaCostBucket;
  count: number;
}

export async function listManaCostBucketCounts(
  client: SupabaseClient,
  systemId?: string,
): Promise<ManaCostBucketCount[]> {
  let query = client.from('spells').select('mana_cost');
  if (systemId) query = query.eq('system_id', systemId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list spell mana cost counts: ${error.message}`);
  const buckets: Record<ManaCostBucket, number> = { '0': 0, '1-2': 0, '3+': 0 };
  for (const row of (data ?? []) as { mana_cost: number | null }[]) {
    if (row.mana_cost === null || row.mana_cost === undefined) continue;
    if (row.mana_cost === 0) buckets['0'] += 1;
    else if (row.mana_cost <= 2) buckets['1-2'] += 1;
    else buckets['3+'] += 1;
  }
  return (['0', '1-2', '3+'] as const).map((bucket) => ({ bucket, count: buckets[bucket] }));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- facets.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/facets.ts lib/content/facets.test.ts
git commit -m "Add generic facet-count and mana-cost-bucket-count query helpers"
```

---

### Task 4: Deterministic backfill — pure functions, script, and judgment-pass data generation (no DB writes)

This task covers everything that can run and be verified **without touching the live database**: the deterministic derivation logic (with unit tests), the deterministic-backfill script (writes to the DB — see Step 5's guard), and the judgment-pass data file plus its spot-check printer (writes nothing).

**Files:**
- Create: `scripts/derive-deterministic-facets.ts`
- Create: `scripts/derive-deterministic-facets.test.ts`
- Create: `scripts/backfill-deterministic-facets.ts`
- Create: `scripts/backfill-judgment-facets-data.ts`
- Create: `scripts/print-facet-spot-check.ts`

**Interfaces:**
- Produces: `deriveMonsterTier(name: string, tags: string[]): MonsterTier`, `deriveMonsterRaceFromTags(tags: string[]): string | undefined`, `deriveSpellSchoolFromTags(tags: string[]): string | undefined`. Consumed by `backfill-deterministic-facets.ts` (this task) and nothing else.
- Produces: `JUDGMENT_MONSTER_DATA: Record<string, { combat_role: CombatRole; race?: string }>` and `JUDGMENT_SPELL_MANA_COST: Record<string, number>` (both keyed by monster/spell `name`, since the seed scripts don't expose stable slugs and names are unique within this dataset), exported from `backfill-judgment-facets-data.ts`. Consumed by Task 5's `apply-judgment-facets.ts` and this task's `print-facet-spot-check.ts`.

**Design notes carried into this task (verified against the actual seeded data in `scripts/seed-nimble-monsters.ts` and `scripts/seed-nimble-spells.ts`, not just the spec's prose, which turned out to be imprecise on two points):**

- **Tier is NOT reliably derivable from `rating_label`.** The spec says `"Solo"` appears in every Legendary boss's label — but `Razzle, Gremlin Iconoclast` (rating_label `'Level 7 Small, Insufferable Rascal'`, tags `['Fey', 'Legendary']`) has no `"Solo"` in its label. The spec also says `"Minion"` appears in Nimble minion-tier labels — but `Kobold Minion` and `Goblin Minion` have `rating_label: 'Lvl 1/4'`, no `"Minion"` substring at all. The reliable signals actually present in every row: the literal tag `'Legendary'` (100% of Legendary rows carry it), and the monster's `name` ending in `" Minion"` (100% of the 5 minion-tier monsters are named that way — `Bug Minion`, `Kobold Minion`, `Goblin Minion`, `Bandit Minion`, `Snakeman Minion`). Use those instead.
- **`school` is not simply `tags[0]`.** 18 of the 76 Nimble spells are tagged `['Utility', <element>]` (e.g. `Firebrand` is `['Utility', 'Fire']`), where `'Utility'` marks a non-damage effect but the spell is still elementally flavored (per its name and description). No spell in the current dataset has `'Utility'` as its only tag. So: scan every tag for one of the six elemental values and use whichever one matches; `'Utility'` as a standalone `school` value never actually applies to current data (the type still allows it, for future non-elemental utility spells).
- **D&D SRD monster `race`** comes from `lib/content/open5e-mapper.ts`, which sets `tags: [raw.type]` from Open5e's `type` field — that field is lowercase (`"beast"`, `"humanoid"`, etc.), so migrating it to `race` means capitalizing it, not just copying it verbatim.
- **Nimble monster `race`** — tags that already exactly match the target vocabulary (`Fiend`, `Giant Bug`, `Undead`, `Fey`, `Dragon`) copy directly. Thematic-grouping tags (`Dungeon Denizens`, `Hill & Field`, `Forest Denizens`, `Bandits`, `Underground`, `Kobolds`, `Goblins`, `Snakemen`, `Cultists/Horrors`) are not creature types and need the judgment pass — most map straightforwardly to `Humanoid` (Kobolds/Goblins/Bandits/Snakemen), but the terrain-based groupings (`Dungeon Denizens`/`Hill & Field`/`Forest Denizens`/`Underground`) can mix creature types within the same tag and need a per-monster read.

- [ ] **Step 1: Write the failing tests for the pure derivation functions**

Create `scripts/derive-deterministic-facets.test.ts`:

```ts
import { deriveMonsterTier, deriveMonsterRaceFromTags, deriveSpellSchoolFromTags } from './derive-deterministic-facets';

describe('deriveMonsterTier', () => {
  it('returns Legendary when tags include Legendary', () => {
    expect(deriveMonsterTier('Mav, The Winter Queen', ['Fey', 'Legendary'])).toBe('Legendary');
  });

  it('returns Legendary even when the rating label has no "Solo" in it', () => {
    expect(deriveMonsterTier('Razzle, Gremlin Iconoclast', ['Fey', 'Legendary'])).toBe('Legendary');
  });

  it('returns Minion when the name ends with " Minion"', () => {
    expect(deriveMonsterTier('Kobold Minion', ['Kobolds'])).toBe('Minion');
    expect(deriveMonsterTier('Goblin Minion', ['Goblins'])).toBe('Minion');
  });

  it('returns Normal otherwise', () => {
    expect(deriveMonsterTier('Kobold', ['Kobolds'])).toBe('Normal');
  });

  it('does not mistake a Minion-named monster with a Legendary tag as anything but Legendary', () => {
    expect(deriveMonsterTier('Some Minion', ['Legendary'])).toBe('Legendary');
  });
});

describe('deriveMonsterRaceFromTags', () => {
  it('returns the tag directly when it already matches the vocabulary', () => {
    expect(deriveMonsterRaceFromTags(['Fiend'])).toBe('Fiend');
    expect(deriveMonsterRaceFromTags(['Giant Bug', 'Legendary', 'Dragon'])).toBe('Giant Bug');
    expect(deriveMonsterRaceFromTags(['Undead'])).toBe('Undead');
  });

  it('returns undefined for thematic-grouping tags that need the judgment pass', () => {
    expect(deriveMonsterRaceFromTags(['Kobolds'])).toBeUndefined();
    expect(deriveMonsterRaceFromTags(['Dungeon Denizens'])).toBeUndefined();
  });

  it('returns undefined for an empty tag list', () => {
    expect(deriveMonsterRaceFromTags([])).toBeUndefined();
  });

  it('capitalizes a lowercase single tag that matches the vocabulary (Open5e SRD monsters)', () => {
    expect(deriveMonsterRaceFromTags(['beast'])).toBe('Beast');
    expect(deriveMonsterRaceFromTags(['humanoid'])).toBe('Humanoid');
  });

  it('does not capitalize-match when there is more than one tag', () => {
    expect(deriveMonsterRaceFromTags(['beast', 'Legendary'])).toBeUndefined();
  });
});

describe('deriveSpellSchoolFromTags', () => {
  it('returns the elemental tag when it is the only tag', () => {
    expect(deriveSpellSchoolFromTags(['Fire'])).toBe('Fire');
  });

  it('finds the elemental tag even when Utility comes first', () => {
    expect(deriveSpellSchoolFromTags(['Utility', 'Fire'])).toBe('Fire');
    expect(deriveSpellSchoolFromTags(['Utility', 'Wind'])).toBe('Wind');
  });

  it('finds the elemental tag alongside Class-Restricted', () => {
    expect(deriveSpellSchoolFromTags(['Necrotic', 'Class-Restricted'])).toBe('Necrotic');
  });

  it('returns undefined when no elemental tag is present', () => {
    expect(deriveSpellSchoolFromTags(['Class-Restricted'])).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- derive-deterministic-facets.test.ts`
Expected: FAIL with "Cannot find module './derive-deterministic-facets'".

- [ ] **Step 3: Implement the pure functions**

Create `scripts/derive-deterministic-facets.ts`:

```ts
import type { MonsterTier } from '../lib/content/types';

export function deriveMonsterTier(name: string, tags: string[]): MonsterTier {
  if (tags.includes('Legendary')) return 'Legendary';
  if (name.endsWith(' Minion')) return 'Minion';
  return 'Normal';
}

const EXACT_MATCH_RACES = new Set([
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
  'Giant Bug',
]);

const EXACT_MATCH_RACES_LOWER = new Map(Array.from(EXACT_MATCH_RACES).map((race) => [race.toLowerCase(), race]));

export function deriveMonsterRaceFromTags(tags: string[]): string | undefined {
  const exact = tags.find((tag) => EXACT_MATCH_RACES.has(tag));
  if (exact) return exact;
  // Open5e's `type` field (mapped straight into tags by open5e-mapper.ts) is lowercase
  // ("beast", "humanoid", ...) — this handles that case without a second pass.
  if (tags.length === 1) {
    const lower = tags[0].toLowerCase();
    if (EXACT_MATCH_RACES_LOWER.has(lower)) return EXACT_MATCH_RACES_LOWER.get(lower);
  }
  return undefined;
}

const ELEMENTAL_SCHOOLS = new Set(['Fire', 'Ice', 'Lightning', 'Wind', 'Radiant', 'Necrotic']);

export function deriveSpellSchoolFromTags(tags: string[]): string | undefined {
  return tags.find((tag) => ELEMENTAL_SCHOOLS.has(tag));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- derive-deterministic-facets.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the deterministic backfill script**

Create `scripts/backfill-deterministic-facets.ts`. This writes to the live DB — do not run it until Task 1's migration has been applied in the Supabase SQL editor.

```ts
import { createSupabaseClient } from '../lib/supabase/client';
import { deriveMonsterTier, deriveMonsterRaceFromTags, deriveSpellSchoolFromTags } from './derive-deterministic-facets';

async function backfillMonsters() {
  const client = createSupabaseClient();
  const { data, error } = await client.from('monsters').select('id, name, tags');
  if (error) throw new Error(`Failed to load monsters: ${error.message}`);

  let tierUpdates = 0;
  let raceUpdates = 0;
  for (const row of (data ?? []) as { id: string; name: string; tags: string[] }[]) {
    const tier = deriveMonsterTier(row.name, row.tags);
    const race = deriveMonsterRaceFromTags(row.tags);
    const patch: Record<string, string> = {};
    if (tier !== 'Normal') patch.tier = tier;
    if (race) patch.race = race;
    if (Object.keys(patch).length === 0) continue;
    const { error: updateError } = await client.from('monsters').update(patch).eq('id', row.id);
    if (updateError) throw new Error(`Failed to update monster ${row.name}: ${updateError.message}`);
    if (patch.tier) tierUpdates += 1;
    if (patch.race) raceUpdates += 1;
  }
  console.log(`Monsters: set tier on ${tierUpdates} rows, race on ${raceUpdates} rows.`);
}

async function backfillSpells() {
  const client = createSupabaseClient();
  const { data, error } = await client.from('spells').select('id, name, tags');
  if (error) throw new Error(`Failed to load spells: ${error.message}`);

  let schoolUpdates = 0;
  for (const row of (data ?? []) as { id: string; name: string; tags: string[] }[]) {
    const school = deriveSpellSchoolFromTags(row.tags);
    if (!school) continue;
    const { error: updateError } = await client.from('spells').update({ school }).eq('id', row.id);
    if (updateError) throw new Error(`Failed to update spell ${row.name}: ${updateError.message}`);
    schoolUpdates += 1;
  }
  console.log(`Spells: set school on ${schoolUpdates} rows.`);
}

async function main() {
  await backfillMonsters();
  await backfillSpells();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Note: D&D SRD monsters' `race` (capitalized Open5e `type`) is handled by `deriveMonsterRaceFromTags` itself (Step 3 above already covers both the exact-match case for Nimble's pre-capitalized tags like `'Fiend'` and the lowercase-single-tag case for Open5e's `"beast"`/`"humanoid"` — no second pass needed here).

- [ ] **Step 6: Write the judgment-pass data file**

Create `scripts/backfill-judgment-facets-data.ts`. This is the content-authoring deliverable: read every monster's and spell's `name`/`tags`/`description`/`stats` from `scripts/seed-nimble-monsters.ts`, `scripts/seed-srd-monsters.ts` (via the live DB, not the seed file, since Open5e SRD monsters aren't in a local seed file — query `combat_role is null` rows from the live `monsters` table after Task 1's migration and Task 5's deterministic pass have run), and `scripts/seed-nimble-spells.ts`, and assign values using the worked examples below as calibration.

```ts
import type { CombatRole } from '../lib/content/types';

export interface MonsterJudgment {
  combat_role: CombatRole;
  race?: string; // only for monsters whose tags are thematic groupings (Kobolds, Goblins, Bandits, Snakemen, Dungeon Denizens, Hill & Field, Forest Denizens, Underground, Cultists/Horrors) — deriveMonsterRaceFromTags already handles the rest.
}

// Keyed by monster name (unique within this dataset — no stable slug exists elsewhere).
export const JUDGMENT_MONSTER_DATA: Record<string, MonsterJudgment> = {
  // Worked examples (fill in the rest reading each monster's description/stats):
  Sprite: { combat_role: 'Ranged' }, // "Fae Trick: deals 1d4+4 damage" — no melee attack described, ranged fey trick.
  Gremlin: { combat_role: 'Melee' }, // "Weeee!" is a melee grapple/ride attack, no range given.
  'Kobold Trapper': { combat_role: 'Ranged', race: 'Humanoid' }, // "Throw Scorpion (2x, Range 8)" — ranged; Kobolds tag → Humanoid.
  'Bug Minion': { combat_role: 'Melee', race: 'Giant Bug' }, // "Bite" is melee; race already handled deterministically via the 'Giant Bug' tag, listed here only as a worked example — do not duplicate rows the deterministic pass already covers.
  // ... continue for every monster in scripts/seed-nimble-monsters.ts and every SRD monster.
};

// Keyed by spell name (unique within scripts/seed-nimble-spells.ts).
export const JUDGMENT_SPELL_MANA_COST: Record<string, number> = {
  // Worked examples:
  'Flame Dart': 0, // level: 'Cantrip' — cantrips are the free/at-will tier in Nimble, mana_cost 0.
  Ignite: 1, // level: 'Tier 1' — first paid tier.
  'Enchant Weapon': 2, // level: 'Tier 2'.
  // ... continue for every spell in scripts/seed-nimble-spells.ts, reading its level/description/stats
  // for anything that deviates from the tier-implies-cost pattern (e.g. a Tier 1 spell explicitly
  // costing more mana per its own description).
};
```

- [ ] **Step 7: Write the spot-check printer**

Create `scripts/print-facet-spot-check.ts`. Writes nothing — prints a random sample for a human to review before Task 5 runs.

```ts
import { JUDGMENT_MONSTER_DATA, JUDGMENT_SPELL_MANA_COST } from './backfill-judgment-facets-data';

function sample<T>(entries: [string, T][], size: number): [string, T][] {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

function main() {
  console.log('=== Monster combat_role / race spot-check (20 random rows) ===');
  for (const [name, judgment] of sample(Object.entries(JUDGMENT_MONSTER_DATA), 20)) {
    console.log(`${name}: combat_role=${judgment.combat_role}${judgment.race ? `, race=${judgment.race}` : ''}`);
  }

  console.log('\n=== Spell mana_cost spot-check (20 random rows) ===');
  for (const [name, manaCost] of sample(Object.entries(JUDGMENT_SPELL_MANA_COST), 20)) {
    console.log(`${name}: mana_cost=${manaCost}`);
  }
}

main();
```

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add scripts/derive-deterministic-facets.ts scripts/derive-deterministic-facets.test.ts scripts/backfill-deterministic-facets.ts scripts/backfill-judgment-facets-data.ts scripts/print-facet-spot-check.ts
git commit -m "Add deterministic facet derivation + judgment-pass data and spot-check printer"
```

**Do not run `backfill-deterministic-facets.ts` or `print-facet-spot-check.ts` against the live DB as part of this task's automated review.** The deterministic script is safe to run once Task 1's migration is applied (it's idempotent and only touches rows that need a non-default value), but running it and reviewing the judgment-pass spot-check output are Task 5's job, gated on human approval — see Task 5.

---

### Task 5: [MANUAL GATE — human approval required] Apply the backfill to the live database

**This task is not a normal subagent task. Do not dispatch it through the automated fresh-subagent-plus-reviewer loop.** Per spec §6 and this plan's Global Constraints, the judgment-pass values must be shown to the human and explicitly approved before they're written to the live database. The controller (you, running this plan) performs this task directly:

- [ ] **Step 1:** Confirm Task 1's `schema.sql` migration has been applied in the Supabase SQL editor. If unsure, ask the human to confirm rather than assuming.
- [ ] **Step 2:** Run `npx tsx scripts/backfill-deterministic-facets.ts` and report the row counts it prints. This part needs no approval — it's a direct, verified migration from existing data (see Task 4's design notes for why each rule is reliable), not a judgment call.
- [ ] **Step 3:** Run `npx tsx scripts/print-facet-spot-check.ts` and show its full output to the human.
- [ ] **Step 4:** Wait for the human to explicitly approve the sample (or to flag specific rows to fix in `scripts/backfill-judgment-facets-data.ts` before re-running Step 3). Do not proceed on an ambiguous or implied response.
- [ ] **Step 5:** Only after explicit approval, run `npx tsx scripts/apply-judgment-facets.ts` (create this file first — it doesn't exist yet):

```ts
import { createSupabaseClient } from '../lib/supabase/client';
import { JUDGMENT_MONSTER_DATA, JUDGMENT_SPELL_MANA_COST } from './backfill-judgment-facets-data';

async function main() {
  const client = createSupabaseClient();

  let monsterUpdates = 0;
  for (const [name, judgment] of Object.entries(JUDGMENT_MONSTER_DATA)) {
    const patch: Record<string, string> = { combat_role: judgment.combat_role };
    if (judgment.race) patch.race = judgment.race;
    const { error } = await client.from('monsters').update(patch).eq('name', name);
    if (error) throw new Error(`Failed to update monster ${name}: ${error.message}`);
    monsterUpdates += 1;
  }
  console.log(`Applied combat_role/race to ${monsterUpdates} monsters.`);

  let spellUpdates = 0;
  for (const [name, manaCost] of Object.entries(JUDGMENT_SPELL_MANA_COST)) {
    const { error } = await client.from('spells').update({ mana_cost: manaCost }).eq('name', name);
    if (error) throw new Error(`Failed to update spell ${name}: ${error.message}`);
    spellUpdates += 1;
  }
  console.log(`Applied mana_cost to ${spellUpdates} spells.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6:** Report the final counts to the human.
- [ ] **Step 7: Commit**

```bash
git add scripts/apply-judgment-facets.ts
git commit -m "Add judgment-pass apply script"
```

(The data written by this task lives in the live Supabase database, not in a commit — there's nothing else to commit here.)

---

### Task 6: Sidebar facet-group rendering and new icons

**Files:**
- Modify: `app/Sidebar.tsx`
- Modify: `app/Sidebar.module.css`
- Modify: `app/content/icons.tsx`

**Interfaces:**
- Produces: `Sidebar` gains an optional `facets?: FacetGroup[]` prop, where `FacetGroup = { key: keyof ContentFilters; label: string; color: string; options: { value: string; label: string; count: number }[] }`. Consumed by Tasks 8/10/11/12's `page.tsx` changes.
- Produces: `RangedIcon`, `ShieldIcon`, `ChevronIcon`, `DropletIcon` added to `app/content/icons.tsx`, same signature as the existing icons there. Consumed by Tasks 13/14.

- [ ] **Step 1: Add the new icons**

In `app/content/icons.tsx`, add after `SealIcon`:

```tsx
export function RangedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 4c8 0 14 6 16 16" />
      <path d="M20 20l-5-1M20 20l1-5" />
      <path d="M4 4l6 6" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10l3 3 3-3" />
    </svg>
  );
}

export function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3c4 5 6.5 8.5 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.5 8 8 12 3z" />
    </svg>
  );
}
```

- [ ] **Step 2: Extend `Sidebar` with a `facets` prop**

Replace the full contents of `app/Sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CategoryCounts, TagCount } from '@/lib/content/sidebar';
import type { ContentFilters } from '@/lib/content/types';
import styles from './Sidebar.module.css';

type Category = 'monsters' | 'items' | 'spells' | 'rules';

export interface FacetGroupOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: keyof ContentFilters;
  label: string;
  color: string;
  options: FacetGroupOption[];
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'monsters', label: 'Monsters' },
  { key: 'items', label: 'Items' },
  { key: 'spells', label: 'Spells' },
  { key: 'rules', label: 'Rules' },
];

function pushTagFilters(router: ReturnType<typeof useRouter>, category: Category, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.combatRole) params.set('combatRole', filters.combatRole);
  if (filters.race) params.set('race', filters.race);
  if (filters.tier) params.set('tier', filters.tier);
  if (filters.itemType) params.set('itemType', filters.itemType);
  if (filters.rarity) params.set('rarity', filters.rarity);
  if (filters.school) params.set('school', filters.school);
  if (filters.manaCostBucket) params.set('manaCostBucket', filters.manaCostBucket);
  if (filters.category) params.set('category', filters.category);
  const query = params.toString();
  router.push(query ? `/${category}?${query}` : `/${category}`);
}

export function Sidebar({
  counts,
  tags,
  facets,
  initial,
  category,
}: {
  counts: CategoryCounts;
  tags: TagCount[];
  facets?: FacetGroup[];
  initial: ContentFilters;
  category: Category;
}) {
  const router = useRouter();

  function toggleTag(tag: string, checked: boolean) {
    const current = initial.tags ?? [];
    const next = checked ? [...current, tag] : current.filter((t) => t !== tag);
    pushTagFilters(router, category, { ...initial, tags: next });
  }

  function selectFacetOption(key: keyof ContentFilters, value: string) {
    const current = initial[key];
    const next = { ...initial, [key]: current === value ? undefined : value };
    pushTagFilters(router, category, next);
  }

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h2 className={styles.heading}>Categories</h2>
        <ul className={styles.categoryList}>
          {CATEGORIES.map(({ key, label }) => (
            <li key={key}>
              <Link
                href={`/${key}`}
                className={key === category ? `${styles.categoryLink} ${styles.categoryActive}` : styles.categoryLink}
              >
                {label} <span className={styles.count}>({counts[key]})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {facets?.map((facet) => (
        <section key={facet.key} className={styles.section}>
          <h2 className={styles.heading}>{facet.label}</h2>
          <ul className={styles.tagList}>
            {facet.options.map((option) => {
              const active = initial[facet.key] === option.value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={active ? `${styles.facetOption} ${styles.facetOptionActive}` : styles.facetOption}
                    onClick={() => selectFacetOption(facet.key, option.value)}
                  >
                    <span className={styles.swatch} style={{ background: facet.color }} />
                    {option.label} <span className={styles.tagCount}>({option.count})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <section className={styles.section}>
        <h2 className={styles.heading}>Tags</h2>
        <ul className={styles.tagList}>
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <label className={styles.tagLabel}>
                <input
                  type="checkbox"
                  aria-label={tag}
                  checked={initial.tags?.includes(tag) ?? false}
                  onChange={(e) => toggleTag(tag, e.target.checked)}
                />
                {tag} <span className={styles.tagCount}>({count})</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
```

- [ ] **Step 3: Add the new CSS**

Append to `app/Sidebar.module.css`:

```css
.facetOption {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--parchment-dim);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.facetOption:hover {
  color: var(--parchment);
}

.facetOptionActive {
  color: var(--parchment);
  font-weight: 600;
}

.swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
```

- [ ] **Step 4: Run the existing Sidebar-adjacent tests**

Run: `npm test`
Expected: PASS — no test file exercises `Sidebar.tsx` directly yet (confirm via `Glob` for `Sidebar.test.tsx` before assuming; if one exists, verify it still passes since `facets` is optional and every other prop is unchanged).

- [ ] **Step 5: Commit**

```bash
git add app/Sidebar.tsx app/Sidebar.module.css app/content/icons.tsx
git commit -m "Add generic facet-group rendering to Sidebar and four new icons"
```

---

### Task 7: MonsterForm — Combat Role, Race, Tier fields

**Files:**
- Modify: `app/monsters/MonsterForm.tsx`
- Modify: `app/monsters/read-input.ts`
- Modify: `app/monsters/read-input.test.ts`

**Interfaces:**
- Consumes: `MonsterInput.combat_role/.race/.tier` (Task 1).
- Produces: `readInput(formData)` returns `combat_role`/`race`/`tier` alongside the existing fields. Consumed by `app/monsters/actions.ts` (already generic — no change needed there, it just forwards whatever `readInput` returns).

- [ ] **Step 1: Write the failing tests**

Add to `app/monsters/read-input.test.ts`:

```ts
describe('readInput facet fields', () => {
  it('reads combat_role, race, and tier when present', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['combat_role', 'Ranged'],
      ['race', 'Fey'],
      ['tier', 'Normal'],
    ]);
    const input = readInput(fd);
    expect(input.combat_role).toBe('Ranged');
    expect(input.race).toBe('Fey');
    expect(input.tier).toBe('Normal');
  });

  it('leaves combat_role, race, and tier undefined when not submitted', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
    ]);
    const input = readInput(fd);
    expect(input.combat_role).toBeUndefined();
    expect(input.race).toBeUndefined();
    expect(input.tier).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/monsters/read-input.test.ts`
Expected: FAIL — `readInput` doesn't read these fields yet.

- [ ] **Step 3: Implement `readInput`**

In `app/monsters/read-input.ts`, add to the returned object in `readInput`:

```ts
combat_role: (String(formData.get('combat_role') ?? '') || undefined) as MonsterInput['combat_role'],
race: String(formData.get('race') ?? '') || undefined,
tier: (String(formData.get('tier') ?? '') || undefined) as MonsterInput['tier'],
```

(Insert these three lines after the existing `rating_label:` line.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- app/monsters/read-input.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the form fields**

In `app/monsters/MonsterForm.tsx`, insert after the `rating_label` label block:

```tsx
<label htmlFor="combat_role">
  Combat role
  <select id="combat_role" name="combat_role" defaultValue={monster?.combat_role ?? ''}>
    <option value="">Not set</option>
    <option value="Melee">Melee</option>
    <option value="Ranged">Ranged</option>
  </select>
</label>
<label htmlFor="race">
  Race
  <select id="race" name="race" defaultValue={monster?.race ?? ''}>
    <option value="">Not set</option>
    <option value="Aberration">Aberration</option>
    <option value="Beast">Beast</option>
    <option value="Celestial">Celestial</option>
    <option value="Construct">Construct</option>
    <option value="Dragon">Dragon</option>
    <option value="Elemental">Elemental</option>
    <option value="Fey">Fey</option>
    <option value="Fiend">Fiend</option>
    <option value="Giant">Giant</option>
    <option value="Giant Bug">Giant Bug</option>
    <option value="Humanoid">Humanoid</option>
    <option value="Monstrosity">Monstrosity</option>
    <option value="Ooze">Ooze</option>
    <option value="Plant">Plant</option>
    <option value="Undead">Undead</option>
  </select>
</label>
<label htmlFor="tier">
  Tier
  <select id="tier" name="tier" defaultValue={monster?.tier ?? 'Normal'}>
    <option value="Normal">Normal</option>
    <option value="Legendary">Legendary</option>
    <option value="Minion">Minion</option>
  </select>
</label>
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/monsters/MonsterForm.tsx app/monsters/read-input.ts app/monsters/read-input.test.ts
git commit -m "Add Combat Role, Race, and Tier fields to MonsterForm"
```

---

### Task 8: Monsters browse page — facet filters and chips

**Files:**
- Modify: `app/monsters/page.tsx`
- Modify: `app/monsters/MonsterFilters.tsx`

**Interfaces:**
- Consumes: `listFacetCounts` (Task 3), `Sidebar`'s `facets` prop (Task 6).

- [ ] **Step 1: Update `MonsterFilters.tsx`'s URL serialization**

In `app/monsters/MonsterFilters.tsx`, extend `pushFilters`'s param-building to match `Sidebar.tsx`'s `pushTagFilters` (Task 6) — add after the existing `tags` line:

```ts
if (filters.combatRole) params.set('combatRole', filters.combatRole);
if (filters.race) params.set('race', filters.race);
if (filters.tier) params.set('tier', filters.tier);
```

(This keeps the two URL-building functions in this file and in `Sidebar.tsx` consistent — both must serialize the same fields, since either one can be the last filter change before a page load reads `searchParams`.)

- [ ] **Step 2: Update `page.tsx`**

In `app/monsters/page.tsx`:

Add to the imports:

```ts
import { listFacetCounts } from '@/lib/content/facets';
```

Update the `searchParams` type and `filters` construction:

```ts
export default async function MonstersPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    systemId?: string;
    sourceType?: string;
    tags?: string;
    combatRole?: string;
    race?: string;
    tier?: string;
  };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
    combatRole: searchParams.combatRole as ContentFilters['combatRole'],
    race: searchParams.race,
    tier: searchParams.tier as ContentFilters['tier'],
  };

  const [{ data: systems }, monsters, counts, tags, combatRoleCounts, raceCounts, tierCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listMonsters(client, filters),
    getCategoryCounts(client),
    listTagCounts(client, 'monsters', filters.systemId),
    listFacetCounts(client, 'monsters', 'combat_role', filters.systemId),
    listFacetCounts(client, 'monsters', 'race', filters.systemId),
    listFacetCounts(client, 'monsters', 'tier', filters.systemId),
  ]);
```

Update `FILTER_LABELS` and `activeFilterChips`'s `build` helper and chip list:

```ts
const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
  combatRole: (value) => value,
  race: (value) => value,
  tier: (value) => value,
};

function activeFilterChips(filters: ContentFilters, systems: System[]) {
  const chips: { key: string; label: string; href: string }[] = [];
  const build = (overrides: Partial<ContentFilters>) => {
    const params = new URLSearchParams();
    const next = { ...filters, ...overrides };
    if (next.search) params.set('search', next.search);
    if (next.systemId) params.set('systemId', next.systemId);
    if (next.sourceType) params.set('sourceType', next.sourceType);
    if (next.tags && next.tags.length > 0) params.set('tags', next.tags.join(','));
    if (next.combatRole) params.set('combatRole', next.combatRole);
    if (next.race) params.set('race', next.race);
    if (next.tier) params.set('tier', next.tier);
    const query = params.toString();
    return query ? `/monsters?${query}` : '/monsters';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  if (filters.combatRole) chips.push({ key: 'combatRole', label: FILTER_LABELS.combatRole(filters.combatRole, systems), href: build({ combatRole: undefined }) });
  if (filters.race) chips.push({ key: 'race', label: FILTER_LABELS.race(filters.race, systems), href: build({ race: undefined }) });
  if (filters.tier) chips.push({ key: 'tier', label: FILTER_LABELS.tier(filters.tier, systems), href: build({ tier: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}
```

Update the `<Sidebar>` call:

```tsx
<Sidebar
  counts={counts}
  tags={tags}
  facets={[
    { key: 'combatRole', label: 'Combat Role', color: 'var(--cat-monsters)', options: combatRoleCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
    { key: 'race', label: 'Race', color: 'var(--cat-monsters)', options: raceCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
    { key: 'tier', label: 'Tier', color: 'var(--cat-monsters)', options: tierCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
  ]}
  initial={filters}
  category="monsters"
/>
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/monsters/page.tsx app/monsters/MonsterFilters.tsx
git commit -m "Wire Combat Role, Race, and Tier facets into the Monsters browse page"
```

---

### Task 9: SpellForm — School and Mana Cost fields

**Files:**
- Modify: `app/spells/SpellForm.tsx`
- Modify: `app/spells/read-input.ts`
- Modify: `app/spells/read-input.test.ts`

**Interfaces:**
- Consumes: `SpellInput.school/.mana_cost` (Task 1).
- Produces: `readInput(formData)` returns `school`/`mana_cost` alongside existing fields.

- [ ] **Step 1: Write the failing tests**

Add to `app/spells/read-input.test.ts` (following the same `formDataWith` helper pattern already in that file):

```ts
describe('readInput facet fields', () => {
  it('reads school and mana_cost when present', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['school', 'Fire'],
      ['mana_cost', '2'],
    ]);
    const input = readInput(fd);
    expect(input.school).toBe('Fire');
    expect(input.mana_cost).toBe(2);
  });

  it('reads mana_cost of 0 as 0, not undefined', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['mana_cost', '0'],
    ]);
    expect(readInput(fd).mana_cost).toBe(0);
  });

  it('leaves school and mana_cost undefined when not submitted', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
    ]);
    const input = readInput(fd);
    expect(input.school).toBeUndefined();
    expect(input.mana_cost).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/spells/read-input.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `readInput`**

In `app/spells/read-input.ts`, add to the returned object after the existing `level:` line:

```ts
school: String(formData.get('school') ?? '') || undefined,
mana_cost: (() => {
  const raw = String(formData.get('mana_cost') ?? '').trim();
  if (raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
})(),
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- app/spells/read-input.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the form fields**

In `app/spells/SpellForm.tsx`, insert after the `level` label block:

```tsx
<label htmlFor="school">
  School
  <select id="school" name="school" defaultValue={spell?.school ?? ''}>
    <option value="">Not set</option>
    <option value="Fire">Fire</option>
    <option value="Ice">Ice</option>
    <option value="Lightning">Lightning</option>
    <option value="Wind">Wind</option>
    <option value="Radiant">Radiant</option>
    <option value="Necrotic">Necrotic</option>
    <option value="Utility">Utility</option>
  </select>
</label>
<label htmlFor="mana_cost">
  Mana cost
  <input id="mana_cost" name="mana_cost" type="number" min="0" defaultValue={spell?.mana_cost ?? ''} />
</label>
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/spells/SpellForm.tsx app/spells/read-input.ts app/spells/read-input.test.ts
git commit -m "Add School and Mana Cost fields to SpellForm"
```

---

### Task 10: Spells browse page — facet filters and chips

**Files:**
- Modify: `app/spells/page.tsx`
- Modify: `app/spells/SpellFilters.tsx`

**Interfaces:**
- Consumes: `listFacetCounts`, `listManaCostBucketCounts` (Task 3), `Sidebar`'s `facets` prop (Task 6).

- [ ] **Step 1: Update `SpellFilters.tsx`'s URL serialization**

In `app/spells/SpellFilters.tsx`, add after the existing `tags` line in `pushFilters`:

```ts
if (filters.school) params.set('school', filters.school);
if (filters.manaCostBucket) params.set('manaCostBucket', filters.manaCostBucket);
```

- [ ] **Step 2: Update `page.tsx`**

In `app/spells/page.tsx`, add to imports:

```ts
import { listFacetCounts, listManaCostBucketCounts } from '@/lib/content/facets';
```

Update `searchParams` type and `filters`:

```ts
export default async function SpellsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    systemId?: string;
    sourceType?: string;
    tags?: string;
    school?: string;
    manaCostBucket?: string;
  };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
    school: searchParams.school,
    manaCostBucket: searchParams.manaCostBucket as ContentFilters['manaCostBucket'],
  };

  const [{ data: systems }, spells, counts, tags, schoolCounts, manaCostCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSpells(client, filters),
    getCategoryCounts(client),
    listTagCounts(client, 'spells', filters.systemId),
    listFacetCounts(client, 'spells', 'school', filters.systemId),
    listManaCostBucketCounts(client, filters.systemId),
  ]);
```

Update `FILTER_LABELS` and `activeFilterChips` the same way as Task 8 (mirror its structure exactly, substituting `school`/`manaCostBucket` for `combatRole`/`race`/`tier`, and `/spells` for `/monsters`):

```ts
const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
  school: (value) => value,
  manaCostBucket: (value) => `Mana: ${value}`,
};

function activeFilterChips(filters: ContentFilters, systems: System[]) {
  const chips: { key: string; label: string; href: string }[] = [];
  const build = (overrides: Partial<ContentFilters>) => {
    const params = new URLSearchParams();
    const next = { ...filters, ...overrides };
    if (next.search) params.set('search', next.search);
    if (next.systemId) params.set('systemId', next.systemId);
    if (next.sourceType) params.set('sourceType', next.sourceType);
    if (next.tags && next.tags.length > 0) params.set('tags', next.tags.join(','));
    if (next.school) params.set('school', next.school);
    if (next.manaCostBucket) params.set('manaCostBucket', next.manaCostBucket);
    const query = params.toString();
    return query ? `/spells?${query}` : '/spells';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  if (filters.school) chips.push({ key: 'school', label: FILTER_LABELS.school(filters.school, systems), href: build({ school: undefined }) });
  if (filters.manaCostBucket) chips.push({ key: 'manaCostBucket', label: FILTER_LABELS.manaCostBucket(filters.manaCostBucket, systems), href: build({ manaCostBucket: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}
```

Update the `<Sidebar>` call:

```tsx
<Sidebar
  counts={counts}
  tags={tags}
  facets={[
    { key: 'school', label: 'School', color: 'var(--cat-spells)', options: schoolCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
    { key: 'manaCostBucket', label: 'Mana Cost', color: 'var(--cat-spells)', options: manaCostCounts.map((c) => ({ value: c.bucket, label: c.bucket, count: c.count })) },
  ]}
  initial={filters}
  category="spells"
/>
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/spells/page.tsx app/spells/SpellFilters.tsx
git commit -m "Wire School and Mana Cost facets into the Spells browse page"
```

---

### Task 11: Items browse page — Item Type and Rarity facets

**Files:**
- Modify: `app/items/page.tsx`
- Modify: `app/items/ItemFilters.tsx`

No `ItemForm`/type changes — `item_type`/`rarity` already exist as form fields and typed columns (verified directly in `app/items/ItemForm.tsx` and `lib/content/types.ts` — this resolves spec §10's open assumption for Items).

**Interfaces:**
- Consumes: `listFacetCounts` (Task 3), `Sidebar`'s `facets` prop (Task 6).

- [ ] **Step 1: Update `ItemFilters.tsx`'s URL serialization**

In `app/items/ItemFilters.tsx`, add after the existing `tags` line in `pushFilters`:

```ts
if (filters.itemType) params.set('itemType', filters.itemType);
if (filters.rarity) params.set('rarity', filters.rarity);
```

- [ ] **Step 2: Update `page.tsx`**

Mirror Task 8's `page.tsx` changes exactly, substituting for Items: add `import { listFacetCounts } from '@/lib/content/facets';`; extend `searchParams` with `itemType?: string; rarity?: string;`; extend `filters` with `itemType: searchParams.itemType, rarity: searchParams.rarity,`; fetch `itemTypeCounts`/`rarityCounts` via `listFacetCounts(client, 'items', 'item_type', filters.systemId)` and `listFacetCounts(client, 'items', 'rarity', filters.systemId)`; extend `FILTER_LABELS`/`activeFilterChips`/`build` with `itemType`/`rarity` (same shape as Task 8's `race`/`tier`, base path `/items`); pass:

```tsx
<Sidebar
  counts={counts}
  tags={tags}
  facets={[
    { key: 'itemType', label: 'Item Type', color: 'var(--cat-items)', options: itemTypeCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
    { key: 'rarity', label: 'Rarity', color: 'var(--cat-items)', options: rarityCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
  ]}
  initial={filters}
  category="items"
/>
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/items/page.tsx app/items/ItemFilters.tsx
git commit -m "Wire Item Type and Rarity facets into the Items browse page"
```

---

### Task 12: Rules browse page — Category facet

**Files:**
- Modify: `app/rules/page.tsx`
- Modify: `app/rules/RuleFilters.tsx`

No `RuleForm`/type changes — `category` already exists as a form field and typed column (resolves spec §10's open assumption for Rules).

**Interfaces:**
- Consumes: `listFacetCounts` (Task 3), `Sidebar`'s `facets` prop (Task 6).

- [ ] **Step 1: Update `RuleFilters.tsx`'s URL serialization**

In `app/rules/RuleFilters.tsx`, add after the existing `tags` line in `pushFilters`:

```ts
if (filters.category) params.set('category', filters.category);
```

- [ ] **Step 2: Update `page.tsx`**

Mirror Task 8's `page.tsx` changes, substituting for Rules: add the `listFacetCounts` import; extend `searchParams` with `category?: string;`; extend `filters` with `category: searchParams.category,`; fetch `categoryCounts` via `listFacetCounts(client, 'rules', 'category', filters.systemId)`; extend `FILTER_LABELS`/`activeFilterChips`/`build` with `category` (base path `/rules`); pass:

```tsx
<Sidebar
  counts={counts}
  tags={tags}
  facets={[
    { key: 'category', label: 'Category', color: 'var(--cat-rules)', options: categoryCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
  ]}
  initial={filters}
  category="rules"
/>
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/rules/page.tsx app/rules/RuleFilters.tsx
git commit -m "Wire Category facet into the Rules browse page"
```

---

### Task 13: Monster cards and detail page — tier badge, race pill, combat-role chip

**Files:**
- Modify: `app/monsters/MonsterCard.tsx`
- Modify: `app/monsters/MonsterCard.module.css`
- Modify: `app/monsters/MonsterCard.test.tsx`
- Modify: `app/monsters/[id]/page.tsx`
- Modify: `app/monsters/[id]/page.module.css`

- [ ] **Step 1: Write the failing card tests**

Add to `app/monsters/MonsterCard.test.tsx` (the existing `monster` fixture needs `combat_role`, `race`, `tier` added — set `combat_role: 'Ranged', race: 'Beast', tier: 'Normal'` on the base fixture so existing tests keep passing unmodified):

```ts
it('shows a race pill and combat-role label when present', () => {
  render(<MonsterCard monster={monster} />);
  expect(screen.getByText('Beast')).toBeInTheDocument();
  expect(screen.getByText('Ranged')).toBeInTheDocument();
});

it('shows a Legendary tier badge for Legendary monsters', () => {
  render(<MonsterCard monster={{ ...monster, tier: 'Legendary' }} />);
  expect(screen.getByText('Legendary')).toBeInTheDocument();
});

it('shows a Minion tier badge for Minion monsters', () => {
  render(<MonsterCard monster={{ ...monster, tier: 'Minion' }} />);
  expect(screen.getByText('Minion')).toBeInTheDocument();
});

it('shows no tier badge for Normal monsters', () => {
  render(<MonsterCard monster={{ ...monster, tier: 'Normal' }} />);
  expect(screen.queryByText('Legendary')).not.toBeInTheDocument();
  expect(screen.queryByText('Minion')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/monsters/MonsterCard.test.tsx`
Expected: FAIL — `MonsterCard` doesn't render these yet, and TypeScript will also flag the fixture missing `combat_role`/`race`/`tier` until Step 1's fixture update is in place.

- [ ] **Step 3: Implement the card**

In `app/monsters/MonsterCard.tsx`, add imports:

```tsx
import { ShieldIcon, ChevronIcon, SwordIcon, RangedIcon } from '../content/icons';
```

Insert after the existing `<div className={styles.meta}>` line and before the `official`/`homebrew` span:

```tsx
<div className={styles.badgeRow}>
  {monster.tier === 'Legendary' && (
    <span className={styles.tierBadge}>
      <ShieldIcon className={styles.badgeIcon} /> Legendary
    </span>
  )}
  {monster.tier === 'Minion' && (
    <span className={styles.tierBadge}>
      <ChevronIcon className={styles.badgeIcon} /> Minion
    </span>
  )}
  {monster.combat_role && (
    <span className={styles.roleBadge}>
      {monster.combat_role === 'Melee' ? <SwordIcon className={styles.badgeIcon} /> : <RangedIcon className={styles.badgeIcon} />}
      {monster.combat_role}
    </span>
  )}
  {monster.race && <span className={styles.racePill}>{monster.race}</span>}
</div>
```

- [ ] **Step 4: Add the CSS**

Append to `app/monsters/MonsterCard.module.css`:

```css
.badgeRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tierBadge,
.roleBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-2xs);
  color: var(--cat-monsters);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badgeIcon {
  width: 13px;
  height: 13px;
  flex: none;
}

.racePill {
  display: inline-block;
  font-size: var(--text-2xs);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--cat-monsters-soft);
  color: var(--cat-monsters);
}
```

- [ ] **Step 5: Run the card tests to verify they pass**

Run: `npm test -- app/monsters/MonsterCard.test.tsx`
Expected: PASS.

- [ ] **Step 6: Add the same badges to the detail page**

In `app/monsters/[id]/page.tsx`, add the same import and insert after the `<p className={styles.subtitle}>` block:

```tsx
<div className={styles.badgeRow}>
  {monster.tier === 'Legendary' && (
    <span className={styles.tierBadge}>
      <ShieldIcon className={styles.badgeIcon} /> Legendary
    </span>
  )}
  {monster.tier === 'Minion' && (
    <span className={styles.tierBadge}>
      <ChevronIcon className={styles.badgeIcon} /> Minion
    </span>
  )}
  {monster.combat_role && (
    <span className={styles.roleBadge}>
      {monster.combat_role === 'Melee' ? <SwordIcon className={styles.badgeIcon} /> : <RangedIcon className={styles.badgeIcon} />}
      {monster.combat_role}
    </span>
  )}
  {monster.race && <span className={styles.racePill}>{monster.race}</span>}
</div>
```

Append the same CSS block from Step 4 to `app/monsters/[id]/page.module.css`.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/monsters/MonsterCard.tsx app/monsters/MonsterCard.module.css app/monsters/MonsterCard.test.tsx app/monsters/[id]/page.tsx app/monsters/[id]/page.module.css
git commit -m "Show tier badge, race pill, and combat-role chip on monster cards and detail pages"
```

---

### Task 14: Spell cards and detail page — school chip and mana-cost droplet badge

**Files:**
- Modify: `app/spells/SpellCard.tsx`
- Modify: `app/spells/SpellCard.module.css`
- Modify: `app/spells/SpellCard.test.tsx`
- Modify: `app/spells/[id]/page.tsx`
- Modify: `app/spells/[id]/page.module.css`

- [ ] **Step 1: Write the failing card tests**

Add to `app/spells/SpellCard.test.tsx` (extend the existing `spell` fixture with `school: 'Fire', mana_cost: 2` so existing tests keep passing unmodified):

```ts
it('shows a school chip and mana-cost badge when present', () => {
  render(<SpellCard spell={spell} />);
  expect(screen.getByText('Fire')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
});

it('shows a mana-cost badge for a mana_cost of 0', () => {
  render(<SpellCard spell={{ ...spell, mana_cost: 0 }} />);
  expect(screen.getByText('0')).toBeInTheDocument();
});

it('shows no mana-cost badge when mana_cost is null', () => {
  render(<SpellCard spell={{ ...spell, mana_cost: null }} />);
  expect(screen.queryByTestId('mana-cost-badge')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/spells/SpellCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement the card**

In `app/spells/SpellCard.tsx`, add import:

```tsx
import { DropletIcon } from '../content/icons';
```

Insert after the existing `<div className={styles.meta}>` line and before the `official`/`homebrew` span:

```tsx
<div className={styles.badgeRow}>
  {spell.school && <span className={styles.schoolChip}>{spell.school}</span>}
  {spell.mana_cost !== null && (
    <span className={styles.manaBadge} data-testid="mana-cost-badge">
      <DropletIcon className={styles.badgeIcon} /> {spell.mana_cost}
    </span>
  )}
</div>
```

- [ ] **Step 4: Add the CSS**

Append to `app/spells/SpellCard.module.css`:

```css
.badgeRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.schoolChip {
  display: inline-block;
  font-size: var(--text-2xs);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--cat-spells-soft);
  color: var(--cat-spells);
}

.manaBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-2xs);
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  color: var(--cat-spells);
}

.badgeIcon {
  width: 13px;
  height: 13px;
  flex: none;
}
```

- [ ] **Step 5: Run the card tests to verify they pass**

Run: `npm test -- app/spells/SpellCard.test.tsx`
Expected: PASS.

- [ ] **Step 6: Add the same badges to the detail page**

In `app/spells/[id]/page.tsx`, add the same import and insert after the `<p className={styles.subtitle}>` block:

```tsx
<div className={styles.badgeRow}>
  {spell.school && <span className={styles.schoolChip}>{spell.school}</span>}
  {spell.mana_cost !== null && (
    <span className={styles.manaBadge}>
      <DropletIcon className={styles.badgeIcon} /> {spell.mana_cost}
    </span>
  )}
</div>
```

Append the same CSS block from Step 4 to `app/spells/[id]/page.module.css`.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/spells/SpellCard.tsx app/spells/SpellCard.module.css app/spells/SpellCard.test.tsx app/spells/[id]/page.tsx app/spells/[id]/page.module.css
git commit -m "Show school chip and mana-cost badge on spell cards and detail pages"
```

---

## Self-Review

**Spec coverage:**
- §5.1/5.2 (new columns) → Task 1.
- §5.3/5.4 (no Items/Rules schema change) → confirmed, no task adds columns there; Task 11/12 note the resolved open assumption.
- §6 (backfill strategy: deterministic vs. judgment-pass, spot-check before final) → Tasks 4/5, with Task 5 explicitly gated on human approval and Task 4's design notes documenting where the spec's proposed heuristics didn't match the real seeded data and what was used instead.
- §7 (filter/facet UI, all four types, visually distinct from flat tags) → Tasks 6/8/10/11/12; distinctness achieved via a colored swatch per facet group (reusing existing WCAG-verified category tokens) plus button-style single-select, not checkboxes.
- §8 (forms) → Tasks 7/9 (Monster/Spell); Tasks 11/12 confirm Item/Rule forms already have the fields, resolving §10's open assumption.
- §9 (cards & detail pages) → Tasks 13/14 (Monster/Spell); Items/Rules explicitly confirmed to need no card changes (their rating-slot and meta-line already show `rarity`/`item_type`/`category`, verified by reading the current `ItemCard.tsx`/`RuleCard.tsx`).
- §10 open assumptions → all three resolved during planning: Item/Rule forms confirmed to already have the fields (Tasks 11/12); backfill sample format is Task 4/5's `print-facet-spot-check.ts` printing 20 random rows per type; Nimble race judgment defaults to the 15-word D&D SRD vocabulary per Task 4's design notes, with terrain-based tags needing a per-monster read rather than a blanket default.

**Placeholder scan:** No TBD/"add validation"/"similar to Task N" patterns. The one place values are legitimately not pre-written is Task 4/5's judgment-pass data file, which is a spec-mandated content-authoring deliverable (§6), not a code placeholder — its mechanism, data shape, and acceptance gate (human-reviewed spot-check) are fully specified, and worked examples are given for calibration.

**Type consistency:** `ContentFilters` (Task 1) fields (`combatRole`, `race`, `tier`, `itemType`, `rarity`, `school`, `manaCostBucket`, `category`) are used identically in `applyContentFilters` (Task 2), `Sidebar`'s `FacetGroup.key` (Task 6), and every `page.tsx`/`*Filters.tsx` pair (Tasks 8/10/11/12). `FacetCount`/`ManaCostBucketCount` (Task 3) field names (`value`/`count`, `bucket`/`count`) match their usage in every `page.tsx`'s `.map()` calls. `CombatRole`/`MonsterTier`/`ManaCostBucket` (Task 1) are the same three string-union types referenced in `MonsterForm`/`SpellForm` (Tasks 7/9), `MonsterCard`/`SpellCard` (Tasks 13/14), and the backfill scripts (Task 4/5).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-22-faceted-filters-and-data-model.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration. Task 5 is excluded from this loop and handled directly by me once Task 4 is reviewed and you've approved the spot-check.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
