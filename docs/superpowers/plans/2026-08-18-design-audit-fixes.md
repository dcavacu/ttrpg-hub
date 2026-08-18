# Design Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply every actionable finding from the `Compendium Design Audit` (33 findings across typography, contrast, filtering, cards, detail pages, forms, empty/loading states, login, and accessibility) to ttrpg-hub, without a database schema migration.

**Architecture:** ttrpg-hub is a Next.js 14 App Router site with four structurally-identical content-type verticals (Monsters/Items/Spells/Rules), each with its own `page.tsx` (browse), `[id]/page.tsx` (detail), `new/page.tsx` + `[id]/edit/page.tsx` (forms), `*Card.tsx`, `*Filters.tsx`, `*Form.tsx`, matching CSS Modules, and a shared `Sidebar.tsx`. Design tokens live in `app/globals.css`. Content queries live in `lib/content/*.ts`, one file per type plus shared helpers (`filters.ts`, `sidebar.ts`). Server actions (`actions.ts`) call `lib/content/*.ts` mutators; `read-input.ts` per type parses `FormData`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, plain CSS Modules, Supabase (Postgres) via `@supabase/supabase-js`, Vitest + Testing Library.

**Spec:** The `Compendium Design Audit` artifact (published this session) is the spec — every finding it raises is either implemented by a task below or explicitly scoped out with a stated reason (see "Deliberately out of scope").

## Global Constraints

- No Tailwind, no component library — plain CSS Modules only, matching the existing codebase.
- No new dependencies. Every fix uses what's already in `package.json`.
- No database schema changes or migrations. `stats` stays a flat `jsonb` key-value map; content-model improvements work within that shape (see Task 7's `format-description.ts` and Task 8's stats editor), not by adding new tables/columns for "actions" or "phases" as first-class entities.
- Every content-type-specific change (Monsters/Items/Spells/Rules) must be applied identically to all four verticals — they are separate files with identical structure, not a shared component, so "one fix" always means four edits.
- Preserve all existing passing tests; update test fixtures where an interface changes (noted per task).
- Follow the existing card-based finding severity language only in commit messages/plan tracking — no visual "severity" UI is introduced into the product itself.

## Deliberately out of scope (with reasons)

- **Full relational "Actions"/"Phases" schema** (audit §6): would require a DB migration and rewriting all four Nimble seed scripts. Task 7 instead adds lightweight text-parsing that renders existing ALL-CAPS phase labels (e.g. "BLOODIED:", "LAST STAND:") as real sub-headings — a working equivalent within the current schema.
- **Sidebar tag "taxonomy sub-grouping"** (audit §4): there is no data field distinguishing "creature type" from "encounter group" tags, so a labeled-subgroup UI would require guessing at an unreliable heuristic. Task 4 instead implements the two parts of that finding that *are* data-grounded: scoping the tag list to the selected system, and showing a real count per tag.
- **Cascading system→source select** in forms (audit §7): with ~7 sources total across both systems, a single flat dropdown labeled "System · Source" is simpler than a two-step cascading select and fully resolves the "raw UUID" defect. Revisit if source count grows substantially.
- **True server-side pagination (reduced network payload)** for the Monsters browse page (audit §5): Task 5 adds a client-side "Show more" reveal that caps *rendered* DOM nodes at 60 initially (fixing the actual worst-measured symptom — 71,356px of mobile scrollHeight and rendering all 449 cards at once) without changing `lib/content/monsters.ts`'s query shape. It still fetches the full filtered result set from the server on every page load, so it does not reduce network payload the way real `range()`-based pagination would. Full server-side pagination would require adding an offset/limit parameter through `ContentFilters` and every `list*` function in `lib/content/*.ts`, which is a large enough cross-cutting change to warrant its own follow-up plan rather than folding into this one.
- **A newly-commissioned display serif font** (audit §1, "type pairing"): no font asset is available to this plan to self-host via `next/font/local` the way Geist already is. The data-free part of that finding — no longer setting monospace on prose UI labels (as opposed to genuinely tabular/numeric data) — is applied in Task 4 instead.
- **Removing the stray "Test Fireball" spell / other leftover test rows** (audit §4): this is a data DELETE, blocked for the agent by the platform's safety classifier (established precedent earlier in this project). Flag to the user with the SQL to run themselves; not a task in this plan.
- **Per-system card accent for content types with only one system** (Items/Spells/Rules currently only have Nimble+D&D mixed on Monsters): the token and CSS rule are added generically in Task 1/6 so it activates automatically if/when other types gain multi-system content, but there's no visual difference to verify today outside Monsters.

---

## Task 1: Design tokens — contrast fix, type scale, focus states, system accents

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS custom properties `--link-on-ink`, `--focus-ring`, `--text-2xs` through `--text-display`, `--system-accent-dnd`, `--system-accent-nimble`, `--system-accent-default`. All later tasks that touch CSS consume these by name.

This task is pure CSS with no unit-testable logic; verification is a computed-contrast check (shown below) plus a visual check once other tasks land.

- [ ] **Step 1: Add the new tokens and fix the failing link contrast**

Replace the full contents of `app/globals.css` with:

```css
:root {
  /* Thumb Index palette, light variant. Token names come from the
     original dark "archive" concept (see the design preview artifact)
     and are kept for continuity, but their roles are now inverted:
     --ink holds the light page-ground color and --parchment holds the
     dark ink-brown text color — background and text swapped materials.
     --brass stays as a fill color (buttons/badges); --brass-dim is used
     wherever brass appears as text/links on a white --panel, since raw
     --brass is too low-contrast on a light ground. --link-on-ink is a
     further-darkened variant (5.07:1 on --ink, verified) for links that
     sit directly on the --ink page background rather than inside a
     white panel, where --brass-dim itself falls to 4.11:1 and fails
     WCAG AA. --seal-teal/--seal-crimson are deepened slightly from the
     dark-theme values for the same reason. */
  --ink: #f2ecde;
  --ink-2: #ffffff;
  --panel: #ffffff;
  --panel-2: #f7f2e6;
  --parchment: #221d15;
  --parchment-dim: #6b6152;
  --brass: #c19a5b;
  --brass-dim: #8a6d3f;
  --link-on-ink: #7a5f34;
  --seal-teal: #3f6b62;
  --seal-teal-dim: #2e504a;
  --seal-crimson: #963f3f;
  --seal-crimson-dim: #7a3535;
  --hairline: rgba(34, 29, 21, 0.14);
  --hairline-strong: rgba(34, 29, 21, 0.26);
  --focus-ring: var(--seal-teal);

  /* Type scale. Introduced for new/touched CSS in this plan; existing
     untouched files keep their historical hardcoded rem values rather
     than being mass-migrated as an unrelated drive-by change. */
  --text-2xs: 0.75rem;
  --text-xs: 0.8rem;
  --text-sm: 0.9rem;
  --text-base: 1rem;
  --text-lg: 1.15rem;
  --text-xl: 1.8rem;
  --text-display: 2.4rem;

  /* Per-system card accents. Falls back to --system-accent-default for
     any system name not explicitly matched. */
  --system-accent-dnd: var(--seal-crimson-dim);
  --system-accent-nimble: var(--seal-teal-dim);
  --system-accent-default: var(--hairline-strong);
}

body {
  color: var(--parchment);
  background: var(--ink);
  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

a {
  color: var(--link-on-ink);
}

a:hover {
  color: var(--parchment);
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 2: Verify the contrast fix numerically**

Run (from the worktree root):

```bash
node -e "
function relLum(hex){const c=hex.replace('#','');const r=parseInt(c.slice(0,2),16)/255,g=parseInt(c.slice(2,4),16)/255,b=parseInt(c.slice(4,6),16)/255;const lin=x=>x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);}
function ratio(h1,h2){const L1=relLum(h1),L2=relLum(h2);const [a,b]=L1>L2?[L1,L2]:[L2,L1];return (a+0.05)/(b+0.05);}
console.log('link-on-ink vs ink:', ratio('#7a5f34','#f2ecde').toFixed(2));
"
```

Expected: `link-on-ink vs ink: 5.07` (must read ≥ 4.50 — WCAG AA for normal text).

- [ ] **Step 3: Run the existing test suite to confirm nothing broke**

Run: `npx vitest run`
Expected: all existing tests still pass (this task changes no component logic, only CSS values).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "Fix link contrast on page background, add type scale and focus-visible tokens"
```

---

## Task 2: Branding — real page metadata and a styled 404

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/not-found.tsx`
- Create: `app/not-found.module.css`

**Interfaces:**
- Consumes: Task 1's tokens (`--link-on-ink`, `--hairline-strong`, etc.)

- [ ] **Step 1: Replace the stock metadata in `app/layout.tsx`**

Change lines 16-19 from:

```ts
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

to:

```ts
export const metadata: Metadata = {
  title: "The Compendium",
  description: "A personal, invite-only reference compendium for monsters, items, spells, and rules across your TTRPG systems.",
};
```

- [ ] **Step 2: Create the styled not-found page**

Create `app/not-found.module.css`:

```css
.page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  gap: 12px;
}

.page h1 {
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
  font-size: var(--text-xl);
  margin: 0;
}

.page p {
  color: var(--parchment-dim);
  margin: 0;
}

.page a {
  margin-top: 8px;
}
```

Create `app/not-found.tsx`:

```tsx
import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1>This page isn&apos;t on the shelf</h1>
      <p>Whatever you were looking for isn&apos;t here — it may have been moved or never existed.</p>
      <Link href="/monsters">Back to the compendium</Link>
    </main>
  );
}
```

- [ ] **Step 3: Manually verify**

Start the dev server (`npm run dev`), navigate to `/monsters/00000000-0000-0000-0000-000000000000` while logged in, and confirm the styled not-found page renders instead of the stock Next.js 404.

- [ ] **Step 4: Run the test suite**

Run: `npx vitest run`
Expected: all existing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/not-found.tsx app/not-found.module.css
git commit -m "Add real page metadata and a styled 404 page"
```

---

## Task 3: Persistent app header with logout

**Files:**
- Create: `app/AppHeader.tsx`
- Create: `app/AppHeader.module.css`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/page.module.css`

**Interfaces:**
- Consumes: `SESSION_COOKIE_NAME`, `verifySessionToken` from `lib/auth/session.ts` (already exported — used identically by `middleware.ts`); `logout` from `app/login/actions.ts` (already exported).
- Produces: `AppHeader` component, rendered from `app/layout.tsx` whenever a valid session exists.

- [ ] **Step 1: Create the header component**

Create `app/AppHeader.module.css`:

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--panel);
  border-bottom: 1px solid var(--hairline-strong);
}

.brand {
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--parchment);
  text-decoration: none;
}

.brand:hover {
  color: var(--brass-dim);
}

.logoutButton {
  background: transparent;
  border: 1px solid var(--hairline-strong);
  border-radius: 3px;
  padding: 6px 14px;
  font-size: var(--text-sm);
  color: var(--parchment-dim);
  cursor: pointer;
}

.logoutButton:hover {
  border-color: var(--brass-dim);
  color: var(--parchment);
}
```

Create `app/AppHeader.tsx`:

```tsx
import Link from 'next/link';
import { logout } from './login/actions';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/monsters" className={styles.brand}>
        The Compendium
      </Link>
      <form action={logout}>
        <button type="submit" className={styles.logoutButton}>
          Log out
        </button>
      </form>
    </header>
  );
}
```

- [ ] **Step 2: Render it from the root layout only when a session is present**

In `app/layout.tsx`, add these imports alongside the existing ones:

```ts
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AppHeader } from "./AppHeader";
```

Change the `RootLayout` function to be `async` and check the session:

```tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const secret = process.env.SITE_PASSWORD ?? "";
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token, secret) : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session && <AppHeader />}
        {children}
      </body>
    </html>
  );
}
```

This duplicates a small amount of the session check `middleware.ts` already performs — deliberate, to avoid a route-group restructuring (which would move every content-type folder and conflict with the parallel tasks below) just to hide the header on `/login`.

- [ ] **Step 3: Remove the now-redundant logout UI from the homepage**

Replace `app/page.tsx` with:

```tsx
import styles from './page.module.css';

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>The Compendium</h1>
      <p>
        <a href="/monsters">Browse monsters</a>
      </p>
    </main>
  );
}
```

In `app/page.module.css`, delete the `.logoutForm` rule if present (check the file first — remove only that rule, leave `.page` and any heading rules untouched).

- [ ] **Step 4: Manually verify**

Start the dev server, confirm `/login` shows no header, and that after logging in every page (`/monsters`, `/items`, `/spells`, `/rules`, `/`) shows the header with a working "Log out" button that returns you to `/login`.

- [ ] **Step 5: Run the test suite**

Run: `npx vitest run`
Expected: all existing tests still pass. If `app/page.test.tsx` asserts on the removed logout form, update it to match the simplified homepage (it should now only assert the heading and the "Browse monsters" link).

- [ ] **Step 6: Commit**

```bash
git add app/AppHeader.tsx app/AppHeader.module.css app/layout.tsx app/page.tsx app/page.module.css app/page.test.tsx
git commit -m "Add persistent app header with logout, remove duplicate homepage logout"
```

---

## Task 4: Sidebar — tag counts and system-scoped tag list

**Files:**
- Modify: `lib/content/sidebar.ts`
- Modify: `lib/content/sidebar.test.ts`
- Modify: `app/Sidebar.tsx`
- Modify: `app/Sidebar.module.css`
- Modify: `app/Sidebar.test.tsx`

**Interfaces:**
- Produces: `TagCount { tag: string; count: number }`, `listTagCounts(client, table, systemId?): Promise<TagCount[]>` — replaces `listDistinctTags` (Task 5 updates the only call sites, in the four `page.tsx` files, to match).
- Produces: `Sidebar` now takes `tags: TagCount[]` instead of `tags: string[]`.

- [ ] **Step 1: Replace `listDistinctTags` with `listTagCounts` in `lib/content/sidebar.ts`**

Replace the `listDistinctTags` function (keep `CategoryCounts`/`getCategoryCounts` unchanged) with:

```ts
export interface TagCount {
  tag: string;
  count: number;
}

export async function listTagCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  systemId?: string,
): Promise<TagCount[]> {
  let query = client.from(table).select('tags');
  if (systemId) query = query.eq('system_id', systemId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ${table} tag counts: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { tags: string[] }[]) {
    for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
```

- [ ] **Step 2: Update `lib/content/sidebar.test.ts`**

Read the existing test file first to match its exact Supabase-client mocking style (it already tests `getCategoryCounts`). Add/replace the `listDistinctTags` tests with:

```ts
describe('listTagCounts', () => {
  it('counts how many rows carry each tag', async () => {
    const client = {
      from: () => ({
        select: () => ({
          data: [{ tags: ['Dragon', 'Beast'] }, { tags: ['Dragon'] }, { tags: [] }],
          error: null,
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await listTagCounts(client, 'monsters');
    expect(result).toEqual([
      { tag: 'Beast', count: 1 },
      { tag: 'Dragon', count: 2 },
    ]);
  });

  it('scopes the query by systemId when provided', async () => {
    const eq = vi.fn().mockReturnValue({ data: [{ tags: ['Dragon'] }], error: null });
    const client = {
      from: () => ({ select: () => ({ eq }) }),
    } as unknown as SupabaseClient;

    await listTagCounts(client, 'monsters', 'system-123');
    expect(eq).toHaveBeenCalledWith('system_id', 'system-123');
  });
});
```

Adjust the mock shape if the file you read uses a different chaining style than shown here (e.g. if `getCategoryCounts`'s existing tests mock `.select` returning a thenable directly) — match whatever pattern is already established in that file rather than introducing a second style.

- [ ] **Step 3: Run the sidebar lib test**

Run: `npx vitest run lib/content/sidebar.test.ts`
Expected: PASS.

- [ ] **Step 4: Update `Sidebar.tsx` to render counts and use `TagCount`**

Change the import and prop type:

```tsx
import type { TagCount } from '@/lib/content/sidebar';
```

```tsx
export function Sidebar({
  counts,
  tags,
  initial,
  category,
}: {
  counts: CategoryCounts;
  tags: TagCount[];
  initial: ContentFilters;
  category: Category;
}) {
```

Update `toggleTag` and the tag list rendering:

```tsx
  function toggleTag(tag: string, checked: boolean) {
    const current = initial.tags ?? [];
    const next = checked ? [...current, tag] : current.filter((t) => t !== tag);
    pushTagFilters(router, category, { ...initial, tags: next });
  }
```

(unchanged — still takes a plain `tag: string`)

```tsx
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
```

The explicit `aria-label={tag}` keeps the checkbox's accessible name as just the tag (e.g. `"Dragon"`), not `"Dragon (36)"`, so `getByLabelText('Dragon')` in the existing tests still resolves correctly.

- [ ] **Step 5: Add the count style, and stop monospacing the section headings**

Add:

```css
.tagCount {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-2xs);
  color: var(--parchment-dim);
}
```

Find the existing `.heading` rule (styles the "Categories"/"Tags" section labels) — it currently sets `font-family: ui-monospace, "Cascadia Code", Consolas, monospace;` and `text-transform: uppercase;`. These are UI chrome labels, not tabular/numeric data, so per the audit's typography finding (monospace should be reserved for actual mechanical values, not prose labels), remove the monospace font-family and change the rule to:

```css
.heading {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--parchment-dim);
  margin: 0;
}
```

(`.count` — the per-category number next to "Monsters (449)" — stays monospace; that one *is* a genuine number, not a prose label, so it's left unchanged.)

- [ ] **Step 6: Update `Sidebar.test.tsx` fixtures**

Change the `tags` fixture from a string array to:

```ts
const tags = [
  { tag: 'Aberration', count: 2 },
  { tag: 'Beast', count: 5 },
  { tag: 'Dragon', count: 36 },
];
```

Add one new test after the existing ones:

```ts
  it('shows a count next to each tag', () => {
    render(<Sidebar counts={counts} tags={tags} initial={{}} category="monsters" />);
    expect(screen.getByText('(36)')).toBeInTheDocument();
  });
```

- [ ] **Step 7: Run the Sidebar tests**

Run: `npx vitest run app/Sidebar.test.tsx`
Expected: all tests PASS, including the new one.

- [ ] **Step 8: Commit**

```bash
git add lib/content/sidebar.ts lib/content/sidebar.test.ts app/Sidebar.tsx app/Sidebar.module.css app/Sidebar.test.tsx
git commit -m "Add per-tag counts to the sidebar and support scoping tags to a system"
```

---

## Task 5: Browse pages — filters bar above the grid, results count, active-filter summary, debounced search, real empty/loading states

**Files:**
- Modify: `app/monsters/page.tsx`, `app/monsters/page.module.css`, `app/monsters/MonsterFilters.tsx`
- Modify: `app/items/page.tsx`, `app/items/page.module.css`, `app/items/ItemFilters.tsx`
- Modify: `app/spells/page.tsx`, `app/spells/page.module.css`, `app/spells/SpellFilters.tsx`
- Modify: `app/rules/page.tsx`, `app/rules/page.module.css`, `app/rules/RuleFilters.tsx`
- Create: `lib/hooks/useDebouncedCallback.ts`
- Create: `lib/hooks/useDebouncedCallback.test.ts`
- Create: `app/content/RevealGrid.tsx`
- Create: `app/content/RevealGrid.module.css`
- Create: `app/monsters/loading.tsx`, `app/items/loading.tsx`, `app/spells/loading.tsx`, `app/rules/loading.tsx` (all identical content)

**Interfaces:**
- Consumes: `listTagCounts` and `TagCount` from Task 4 (`lib/content/sidebar.ts`).
- Produces: `useDebouncedCallback<T>(callback: T, delayMs: number): T` — a generic debounce hook, reused by all four `*Filters.tsx`.
- Produces: `RevealGrid` — `{ children: React.ReactNode; gridClassName: string; pageSize?: number }`, reused by all four `page.tsx` to cap the number of cards actually mounted in the DOM at once (fixes the 449-unpaginated-cards Severe finding — see "Deliberately out of scope" for why this is a render-cost fix rather than a network-payload fix).

This task's four content-type verticals are near-mechanical repeats of each other. Steps 1-2 build the shared piece once; Step 3 shows the full reference implementation for Monsters; Steps 4-6 apply the identical pattern (renamed per type) to Items, Spells, and Rules.

- [ ] **Step 1: Write the failing test for the debounce hook**

Create `lib/hooks/useDebouncedCallback.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls the callback once, after the delay, with the latest args', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 250));

    act(() => {
      result.current('a');
      result.current('ab');
      result.current('abc');
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(250));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('abc');
  });
});
```

- [ ] **Step 2: Run it to verify it fails, then implement**

Run: `npx vitest run lib/hooks/useDebouncedCallback.test.ts`
Expected: FAIL — `Cannot find module './useDebouncedCallback'`.

Create `lib/hooks/useDebouncedCallback.ts`:

```ts
import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: never[]) => void>(callback: T, delayMs: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  ) as T;
}
```

Run: `npx vitest run lib/hooks/useDebouncedCallback.test.ts`
Expected: PASS.

- [ ] **Step 3: Build the shared `RevealGrid` component**

Create `app/content/RevealGrid.module.css`:

```css
.showMore {
  display: block;
  margin: 20px auto 0;
  background: transparent;
  border: 1px solid var(--hairline-strong);
  border-radius: 4px;
  padding: 10px 20px;
  color: var(--link-on-ink);
  font-size: var(--text-sm);
  cursor: pointer;
}

.showMore:hover {
  border-color: var(--brass-dim);
  color: var(--parchment);
}
```

Create `app/content/RevealGrid.tsx`:

```tsx
'use client';

import { Children, useState } from 'react';
import styles from './RevealGrid.module.css';

export function RevealGrid({
  children,
  gridClassName,
  pageSize = 60,
}: {
  children: React.ReactNode;
  gridClassName: string;
  pageSize?: number;
}) {
  const items = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, items.length));
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  return (
    <>
      <div className={gridClassName}>{visible}</div>
      {remaining > 0 && (
        <button
          type="button"
          className={styles.showMore}
          onClick={() => setVisibleCount((count) => Math.min(count + pageSize, items.length))}
        >
          Show {Math.min(pageSize, remaining)} more ({remaining} left)
        </button>
      )}
    </>
  );
}
```

This is a Client Component boundary that receives already-server-rendered `MonsterCard` elements as `children` and slices the array — a standard RSC pattern, and it means `lib/content/monsters.ts`'s query itself is untouched (see "Deliberately out of scope" for why full server-side pagination isn't attempted here).

- [ ] **Step 4: Rebuild the Monsters browse page (reference implementation)**

Replace `app/monsters/MonsterFilters.tsx` with:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import type { ContentFilters, System } from '@/lib/content/types';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import styles from './MonsterFilters.module.css';

function pushFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  const query = params.toString();
  router.push(query ? `/monsters?${query}` : '/monsters');
}

export function MonsterFilters({ systems, initial }: { systems: System[]; initial: ContentFilters }) {
  const router = useRouter();
  const debouncedSearch = useDebouncedCallback(
    (value: string) => pushFilters(router, { ...initial, search: value || undefined }),
    250,
  );

  return (
    <div className={styles.filters}>
      <label htmlFor="monster-search">
        Search
        <input
          id="monster-search"
          type="text"
          defaultValue={initial.search ?? ''}
          onChange={(e) => debouncedSearch(e.target.value)}
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

`MonsterFilters.test.tsx` currently likely asserts that typing fires `push` synchronously — read it first; if so, wrap the relevant assertions in fake timers (`vi.useFakeTimers()` / `vi.advanceTimersByTime(250)`), matching the pattern from Step 1, rather than removing the debounce to keep the old test passing unchanged.

Replace `app/monsters/page.tsx` with:

```tsx
import { createSupabaseClient } from '@/lib/supabase/client';
import { listMonsters } from '@/lib/content/monsters';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { MonsterCard } from './MonsterCard';
import { MonsterFilters } from './MonsterFilters';
import { Sidebar } from '../Sidebar';
import { RevealGrid } from '../content/RevealGrid';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
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
    const query = params.toString();
    return query ? `/monsters?${query}` : '/monsters';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}

export default async function MonstersPage({
  searchParams,
}: {
  searchParams: { search?: string; systemId?: string; sourceType?: string; tags?: string };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
  };

  const [{ data: systems }, monsters, counts, tags] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listMonsters(client, filters),
    getCategoryCounts(client),
    listTagCounts(client, 'monsters', filters.systemId),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);

  return (
    <main className={styles.page}>
      <h1>Monsters</h1>
      <a href="/monsters/new">+ Add entry</a>
      <MonsterFilters systems={systemList} initial={filters} />
      {chips.length > 0 && (
        <div className={styles.activeFilters}>
          {chips.map((chip) => (
            <a key={chip.key} href={chip.href} className={styles.filterChip}>
              {chip.label} &times;
            </a>
          ))}
          <a href="/monsters" className={styles.clearAll}>
            Clear all
          </a>
        </div>
      )}
      <p className={styles.resultsCount}>
        Showing {monsters.length} of {counts.monsters}
      </p>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="monsters" />
        <div className={styles.content}>
          {monsters.length === 0 ? (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that search.</p>
              <a href="/monsters">Clear filters</a>
            </div>
          ) : (
            <RevealGrid gridClassName={styles.grid}>
              {monsters.map((monster) => (
                <MonsterCard key={monster.id} monster={monster} />
              ))}
            </RevealGrid>
          )}
        </div>
      </div>
    </main>
  );
}
```

Replace `app/monsters/page.module.css` with:

```css
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 36px 24px 64px;
}

.page h1 {
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
  font-size: var(--text-xl);
  margin: 0 0 20px;
}

.page > a {
  display: inline-block;
  margin-bottom: 20px;
}

.activeFilters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 16px 0 0;
}

.filterChip {
  font-size: var(--text-2xs);
  padding: 4px 10px;
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  color: var(--parchment-dim);
  text-decoration: none;
}

.filterChip:hover {
  border-color: var(--brass-dim);
  color: var(--parchment);
}

.clearAll {
  font-size: var(--text-2xs);
  color: var(--link-on-ink);
  text-decoration: underline;
}

.resultsCount {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-2xs);
  color: var(--parchment-dim);
  margin: 12px 0 0;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
  margin-top: 12px;
}

.content {
  min-width: 0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 48px 24px;
  color: var(--parchment-dim);
  font-size: var(--text-lg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

Note the search field now lives in `MonsterFilters`, which renders above `.layout` (and therefore above the Sidebar) in both the JSX order and the DOM — on narrow viewports this alone puts Search within the first screen instead of ~1,192px down, without touching Sidebar's own internal order or tab order.

Create `app/monsters/loading.tsx`:

```tsx
export default function Loading() {
  return <p style={{ padding: '36px 24px', color: 'var(--parchment-dim)' }}>Loading…</p>;
}
```

- [ ] **Step 5: Run the Monsters tests**

Run: `npx vitest run app/monsters`
Expected: PASS (update `MonsterFilters.test.tsx` for the debounce as noted in Step 4 if needed; `app/monsters/page.tsx` has no dedicated test file per the current glob, so no other fixture changes are expected here).

- [ ] **Step 6: Apply the identical pattern to Items**

Repeat Step 4 exactly for the Items vertical: `app/items/ItemFilters.tsx` (rename `MonsterFilters` → `ItemFilters`, `/monsters` → `/items`, `monster-search`/`monster-system`/`monster-source` ids → `item-search`/`item-system`/`item-source`), `app/items/page.tsx` (rename `MonsterCard`/`MonsterFilters` imports to `ItemCard`/`ItemFilters`, `listMonsters` → `listItems`, `monsters` variable → `items`, `counts.monsters` → `counts.items`, `'monsters'` table arg → `'items'`, all `/monsters` route strings → `/items`, and use the same `RevealGrid` import/usage), and `app/items/page.module.css` (identical content to the Monsters version above). Create `app/items/loading.tsx` with identical content to `app/monsters/loading.tsx`.

Run: `npx vitest run app/items`
Expected: PASS.

- [ ] **Step 7: Apply the identical pattern to Spells and Rules**

Repeat Step 4 for Spells (`app/spells/SpellFilters.tsx`, `app/spells/page.tsx` using `listSpells`/`SpellCard`/`'spells'`/`/spells`/`RevealGrid`, `app/spells/page.module.css`, `app/spells/loading.tsx`) and for Rules (`app/rules/RuleFilters.tsx`, `app/rules/page.tsx` using `listRules`/`RuleCard`/`'rules'`/`/rules`/`RevealGrid`, `app/rules/page.module.css`, `app/rules/loading.tsx`).

Run: `npx vitest run app/spells app/rules`
Expected: PASS.

- [ ] **Step 8: Run the full suite**

Run: `npx vitest run`
Expected: all tests PASS across the whole project.

- [ ] **Step 9: Commit**

```bash
git add lib/hooks app/content/RevealGrid.tsx app/content/RevealGrid.module.css app/monsters app/items app/spells app/rules
git commit -m "Restructure browse pages: filters above the grid, results count, active-filter chips, debounced search, capped initial card rendering, loading states"
```

---

## Task 6: Cards — fix header wrapping, add clickable tags and a system accent

**Files:**
- Modify: `app/monsters/MonsterCard.tsx`, `app/monsters/MonsterCard.module.css`, `app/monsters/MonsterCard.test.tsx`
- Modify: `app/items/ItemCard.tsx`, `app/items/ItemCard.module.css`, `app/items/ItemCard.test.tsx`
- Modify: `app/spells/SpellCard.tsx`, `app/spells/SpellCard.module.css`, `app/spells/SpellCard.test.tsx`
- Modify: `app/rules/RuleCard.tsx`, `app/rules/RuleCard.module.css`, `app/rules/RuleCard.test.tsx`

**Interfaces:**
- Consumes: Task 1's `--system-accent-*`, `--hairline-strong` tokens. Does not change any prop signature (`{ monster: Monster }` etc. stay the same), so this task has no interface impact on Task 5.

- [ ] **Step 1: Rebuild `MonsterCard.tsx` and its CSS (reference implementation)**

Replace `app/monsters/MonsterCard.tsx` with:

```tsx
import Link from 'next/link';
import type { Monster } from '@/lib/content/types';
import styles from './MonsterCard.module.css';

function systemAccentClass(systemName: string): string {
  if (systemName === 'D&D 5e') return styles.accentDnd;
  if (systemName === 'Nimble') return styles.accentNimble;
  return styles.accentDefault;
}

export function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <article className={`${styles.card} ${systemAccentClass(monster.system.name)}`}>
      <Link href={`/monsters/${monster.id}`} className={styles.cardLink}>
        <div className={styles.head}>
          <span className={styles.name}>{monster.name}</span>
          {monster.rating_label && <span className={styles.rating}>{monster.rating_label}</span>}
        </div>
        <div className={styles.meta}>{monster.system.name} &middot; {monster.source.name}</div>
        <span className={monster.is_homebrew ? styles.homebrew : styles.official}>
          {monster.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
      </Link>
      <ul className={styles.tags}>
        {monster.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/monsters?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
```

The card is no longer a single `<Link>` wrapping everything (tags need their own independent links now), so the click/focus target for "open this entry" becomes `.cardLink` — everything except the tag row. This is a deliberate, small trade from the audit's confirmed strength ("the entire card is one focusable unit"): tags must be independently clickable per §4's finding, and the two goals conflict for the exact area the tags occupy. The name/meta/badge area remains one large real link.

Replace `app/monsters/MonsterCard.module.css` with:

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--hairline-strong);
  border-left-width: 3px;
  border-radius: 4px;
  padding: 16px;
  transition: transform 140ms ease, border-color 140ms ease;
}

.card:hover {
  transform: translateY(-3px);
}

.accentDnd {
  border-left-color: var(--system-accent-dnd);
}

.accentNimble {
  border-left-color: var(--system-accent-nimble);
}

.accentDefault {
  border-left-color: var(--system-accent-default);
}

.cardLink {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--parchment);
}

.rating {
  align-self: flex-start;
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-xs);
  color: var(--parchment-dim);
}

.meta {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-xs);
  color: var(--parchment-dim);
}

.official,
.homebrew {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.official {
  color: var(--seal-teal);
}

.homebrew {
  color: var(--seal-crimson);
}

.official::before,
.homebrew::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.tags a {
  display: inline-block;
  font-size: var(--text-2xs);
  padding: 3px 8px;
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  color: var(--parchment-dim);
  text-decoration: none;
}

.tags a:hover {
  border-color: var(--brass-dim);
  color: var(--parchment);
}
```

The header no longer uses `justify-content: space-between` on a single row — `.name` renders full-width, `.rating` sits on its own line beneath it, so a long Nimble rating ("Level 20 Solo World-Ending Cataclysm") wraps freely without squeezing the name column or forcing multi-line flex wrapping.

- [ ] **Step 2: Update `MonsterCard.test.tsx`**

Read the existing test file first. It almost certainly renders a `Monster` fixture and asserts the card is a link to `/monsters/{id}` and that tags render as text — update assertions that relied on the whole card (including tags) being one `<a>` to instead query the specific link: `screen.getByRole('link', { name: /Sprite/i })` should still resolve (matches by accessible name derived from the link's text content, which is now name + rating + system/source + badge, still containing the monster's name). Add a new assertion that a tag renders as its own link:

```ts
  it('renders each tag as a link back into the filtered browse view', () => {
    render(<MonsterCard monster={monster} />);
    const tagLink = screen.getByRole('link', { name: 'Dragon' });
    expect(tagLink).toHaveAttribute('href', '/monsters?tags=Dragon');
  });
```

(Adjust the fixture's tag list/name to match whatever the existing fixture already uses.)

- [ ] **Step 3: Run the Monsters card test**

Run: `npx vitest run app/monsters/MonsterCard.test.tsx`
Expected: PASS.

- [ ] **Step 4: Apply the identical pattern to Items, Spells, and Rules**

For each of `ItemCard`/`SpellCard`/`RuleCard`: apply the same structural change (accent class via `systemAccentClass`, `.cardLink` wrapping everything but the tag list, tags as individual links to `/items?tags=...` / `/spells?tags=...` / `/rules?tags=...`, name/rating stacked instead of space-between) and the same CSS. `ItemCard` shows `rarity` where Monster shows `rating_label`, `SpellCard` shows `level`, `RuleCard` shows `category` — keep each type's existing field in the `.rating`-styled slot, only the layout/CSS changes. Update each `*Card.test.tsx` the same way as Step 2.

Run: `npx vitest run app/items/ItemCard.test.tsx app/spells/SpellCard.test.tsx app/rules/RuleCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite and commit**

Run: `npx vitest run`
Expected: all tests PASS.

```bash
git add app/monsters/MonsterCard.tsx app/monsters/MonsterCard.module.css app/monsters/MonsterCard.test.tsx \
        app/items/ItemCard.tsx app/items/ItemCard.module.css app/items/ItemCard.test.tsx \
        app/spells/SpellCard.tsx app/spells/SpellCard.module.css app/spells/SpellCard.test.tsx \
        app/rules/RuleCard.tsx app/rules/RuleCard.module.css app/rules/RuleCard.test.tsx
git commit -m "Fix card header wrapping, add clickable tags and a per-system accent border"
```

---

## Task 7: Detail pages — stats before prose, phase sub-headings, corner-placed edit link, clickable tags

**Files:**
- Create: `lib/content/format-description.ts`
- Create: `lib/content/format-description.test.ts`
- Modify: `app/monsters/[id]/page.tsx`, `app/monsters/[id]/page.module.css`
- Modify: `app/items/[id]/page.tsx`, `app/items/[id]/page.module.css`
- Modify: `app/spells/[id]/page.tsx`, `app/spells/[id]/page.module.css`
- Modify: `app/rules/[id]/page.tsx`, `app/rules/[id]/page.module.css`

**Interfaces:**
- Produces: `DescriptionSection { heading: string | null; text: string }`, `splitDescriptionSections(description: string): DescriptionSection[]` — pure function, consumed by all four `[id]/page.tsx`.

- [ ] **Step 1: Write the failing tests for `splitDescriptionSections`**

Create `lib/content/format-description.test.ts`:

```ts
import { splitDescriptionSections } from './format-description';

describe('splitDescriptionSections', () => {
  it('returns a single unheaded section for plain prose', () => {
    expect(splitDescriptionSections('A minor fey that appears as a winged ball of light.')).toEqual([
      { heading: null, text: 'A minor fey that appears as a winged ball of light.' },
    ]);
  });

  it('returns an empty array for an empty description', () => {
    expect(splitDescriptionSections('')).toEqual([]);
  });

  it('splits out ALL-CAPS phase labels as their own headed sections', () => {
    const description =
      'Chitinous Plates. BLOODIED: At 45 HP, lose your Chitinous Plates ability! LAST STAND: Broodfly is dying! 90 more damage and he dies.';
    expect(splitDescriptionSections(description)).toEqual([
      { heading: null, text: 'Chitinous Plates.' },
      { heading: 'BLOODIED', text: 'At 45 HP, lose your Chitinous Plates ability!' },
      { heading: 'LAST STAND', text: 'Broodfly is dying! 90 more damage and he dies.' },
    ]);
  });

  it('handles a description that starts directly with a heading', () => {
    expect(splitDescriptionSections('ACTIONS: Move 4 then choose one.')).toEqual([
      { heading: 'ACTIONS', text: 'Move 4 then choose one.' },
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/content/format-description.test.ts`
Expected: FAIL — `Cannot find module './format-description'`.

- [ ] **Step 3: Implement `splitDescriptionSections`**

Create `lib/content/format-description.ts`:

```ts
export interface DescriptionSection {
  heading: string | null;
  text: string;
}

const PHASE_HEADING = /(?:^|\.\s+)([A-Z][A-Z '-]{2,30}):\s*/g;

export function splitDescriptionSections(description: string): DescriptionSection[] {
  if (!description) return [];

  const matches = Array.from(description.matchAll(PHASE_HEADING));
  if (matches.length === 0) return [{ heading: null, text: description }];

  const sections: DescriptionSection[] = [];
  const firstIndex = matches[0].index ?? 0;
  const leading = description.slice(0, firstIndex).trim();
  if (leading) sections.push({ heading: null, text: leading });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : description.length;
    const text = description.slice(start, end).trim();
    sections.push({ heading, text });
  }
  return sections;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/content/format-description.test.ts`
Expected: PASS. If the "starts directly with a heading" case fails because the leading empty string still gets pushed, confirm the `if (leading)` guard is present — an empty/whitespace-only leading segment must be skipped, not pushed as a blank unheaded section.

- [ ] **Step 5: Rebuild the Monsters detail page (reference implementation)**

Replace `app/monsters/[id]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { splitDescriptionSections } from '@/lib/content/format-description';
import styles from './page.module.css';

export default async function MonsterDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.topRow}>
        <a href="/monsters">&larr; Back to Monsters</a>
        <Link href={`/monsters/${monster.id}/edit`} className={styles.editLink}>
          Edit entry
        </Link>
      </div>
      <h1>{monster.name}</h1>
      <p className={styles.subtitle}>
        {monster.system.name} &middot; {monster.rating_label}
      </p>
      {Object.keys(monster.stats).length > 0 && (
        <dl className={styles.stats}>
          {Object.entries(monster.stats).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.description}>
        {splitDescriptionSections(monster.description).map((section, i) => (
          <div key={i} className={styles.descSection}>
            {section.heading && <h2 className={styles.phaseHeading}>{section.heading}</h2>}
            <p>{section.text}</p>
          </div>
        ))}
      </div>
      <ul className={styles.tags}>
        {monster.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/monsters?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

Replace `app/monsters/[id]/page.module.css` with:

```css
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 36px 24px 64px;
}

.topRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topRow > a:first-child {
  color: var(--parchment-dim);
  text-decoration: none;
  font-size: var(--text-sm);
}

.editLink {
  font-size: var(--text-sm);
}

.page h1 {
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
  font-size: var(--text-xl);
  margin: 12px 0 4px;
}

.subtitle {
  color: var(--parchment-dim);
  margin: 0 0 16px;
}

.stats {
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 12px 0;
  margin: 0 0 20px;
}

.stats div {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: var(--text-sm);
}

.stats dt {
  color: var(--parchment-dim);
}

.stats dd {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  margin: 0;
}

.description {
  max-width: 66ch;
}

.descSection {
  margin-bottom: 14px;
}

.descSection p {
  margin: 0;
  line-height: 1.6;
}

.phaseHeading {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-sm);
  letter-spacing: 0.04em;
  color: var(--seal-crimson-dim);
  margin: 0 0 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
}

.tags a {
  display: inline-block;
  font-size: var(--text-xs);
  padding: 3px 10px;
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  color: var(--parchment-dim);
  text-decoration: none;
}

.tags a:hover {
  border-color: var(--brass-dim);
  color: var(--parchment);
}
```

The stats block now renders directly under the subtitle, above the description, and is wrapped in `{Object.keys(monster.stats).length > 0 && ...}` so entries with an empty `stats` object (like the Aboleth) don't render an empty `<dl>` — a minor correctness fix alongside the reordering. `.description` is capped at `66ch` independent of the page's `760px` outer width, tightening the actual prose line length per the audit's typography finding.

- [ ] **Step 6: Manually verify against a real Legendary monster**

Start the dev server, open a Nimble Legendary monster whose description contains "BLOODIED:"/"LAST STAND:" (e.g. search "Caerys" or "Broodfly Drake"), and confirm: the stat block appears above the prose, "BLOODIED"/"LAST STAND" render as distinct sub-headings, and "Edit entry" sits in the top row next to the back link rather than inline before the description.

- [ ] **Step 7: Apply the identical pattern to Items, Spells, and Rules**

Repeat Step 5 for `app/items/[id]/page.tsx` + `.module.css` (using `getItemById`, `item.item_type`/`item.rarity` in the subtitle in place of `rating_label`, `/items` routes), `app/spells/[id]/page.tsx` + `.module.css` (`getSpellById`, `spell.level`, `/spells` routes), and `app/rules/[id]/page.tsx` + `.module.css` (`getRuleById`, `rule.category`, `/rules` routes). All four use the same `splitDescriptionSections` import and the same CSS.

- [ ] **Step 8: Run the full suite**

Run: `npx vitest run`
Expected: all tests PASS. (These detail pages have no dedicated `*.test.tsx` per the current file glob — if any test elsewhere imports from a detail page module, verify it still resolves.)

- [ ] **Step 9: Commit**

```bash
git add lib/content/format-description.ts lib/content/format-description.test.ts \
        app/monsters/\[id\]/page.tsx app/monsters/\[id\]/page.module.css \
        app/items/\[id\]/page.tsx app/items/\[id\]/page.module.css \
        app/spells/\[id\]/page.tsx app/spells/\[id\]/page.module.css \
        app/rules/\[id\]/page.tsx app/rules/\[id\]/page.module.css
git commit -m "Reorder detail pages to lead with stats, add phase sub-headings, move edit link to the top row"
```

---

## Task 8: Forms — real source dropdown, editable stats, tag autocomplete, auto-growing description

**Files:**
- Create: `lib/content/sources.ts`
- Create: `lib/content/sources.test.ts`
- Create: `app/content/StatsEditor.tsx`
- Create: `app/content/StatsEditor.module.css`
- Modify: `app/monsters/MonsterForm.tsx`, `app/monsters/MonsterForm.module.css`, `app/monsters/read-input.ts`, `app/monsters/new/page.tsx`, `app/monsters/[id]/edit/page.tsx`
- Modify: `app/items/ItemForm.tsx`, `app/items/ItemForm.module.css`, `app/items/read-input.ts`, `app/items/new/page.tsx`, `app/items/[id]/edit/page.tsx`
- Modify: `app/spells/SpellForm.tsx`, `app/spells/SpellForm.module.css`, `app/spells/read-input.ts`, `app/spells/new/page.tsx`, `app/spells/[id]/edit/page.tsx`
- Modify: `app/rules/RuleForm.tsx`, `app/rules/RuleForm.module.css`, `app/rules/read-input.ts`, `app/rules/new/page.tsx`, `app/rules/[id]/edit/page.tsx`

**Interfaces:**
- Produces: `SourceOption { id: string; name: string; is_homebrew: boolean; systemName: string }`, `listSources(client): Promise<SourceOption[]>` — used by all four `new/page.tsx` and `[id]/edit/page.tsx`.
- Produces: `StatsEditor` component — `{ defaultValue?: Record<string, string> }`, renders `stats_key`/`stats_value` form fields (repeatable rows), used by all four `*Form.tsx`.
- Produces: a `readStats(formData: FormData): Record<string, string> | undefined` helper, added to each type's `read-input.ts`.

- [ ] **Step 1: Write the failing test for `listSources`**

Create `lib/content/sources.test.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { listSources } from './sources';

describe('listSources', () => {
  it('returns each source labeled with its parent system name', async () => {
    const client = {
      from: () => ({
        select: () => ({
          order: () => ({
            data: [
              { id: 'src-1', name: 'SRD', is_homebrew: false, system: { name: 'D&D 5e' } },
              { id: 'src-2', name: 'Core Rules', is_homebrew: false, system: { name: 'Nimble' } },
            ],
            error: null,
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await listSources(client);
    expect(result).toEqual([
      { id: 'src-1', name: 'SRD', is_homebrew: false, systemName: 'D&D 5e' },
      { id: 'src-2', name: 'Core Rules', is_homebrew: false, systemName: 'Nimble' },
    ]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails, then implement**

Run: `npx vitest run lib/content/sources.test.ts`
Expected: FAIL — `Cannot find module './sources'`.

Create `lib/content/sources.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SourceOption {
  id: string;
  name: string;
  is_homebrew: boolean;
  systemName: string;
}

interface SourceRow {
  id: string;
  name: string;
  is_homebrew: boolean;
  system: { name: string } | null;
}

export async function listSources(client: SupabaseClient): Promise<SourceOption[]> {
  const { data, error } = await client
    .from('sources')
    .select('id, name, is_homebrew, system:systems(name)')
    .order('name');
  if (error) throw new Error(`Failed to list sources: ${error.message}`);
  return ((data ?? []) as unknown as SourceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    is_homebrew: row.is_homebrew,
    systemName: row.system?.name ?? 'Unknown system',
  }));
}
```

Run: `npx vitest run lib/content/sources.test.ts`
Expected: PASS.

- [ ] **Step 3: Write the failing test for `readStats`, then implement it in Monsters' `read-input.ts`**

Add to `app/monsters/read-input.ts` a new exported function and update the returned object. First, if a test file for `read-input.ts` doesn't exist, create `app/monsters/read-input.test.ts`:

```ts
import { readInput } from './read-input';

function formDataWith(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [key, value] of entries) fd.append(key, value);
  return fd;
}

describe('readInput stats parsing', () => {
  it('pairs stats_key/stats_value entries into a record', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', 'HP'],
      ['stats_value', '12'],
      ['stats_key', 'Speed'],
      ['stats_value', 'Fly'],
    ]);
    expect(readInput(fd).stats).toEqual({ HP: '12', Speed: 'Fly' });
  });

  it('omits stats entirely when no rows have a key', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toBeUndefined();
  });
});
```

Run: `npx vitest run app/monsters/read-input.test.ts`
Expected: FAIL (either the file doesn't exist yet as a target, or `stats` is currently always `undefined` since no `stats_key`/`stats_value` reading exists).

Update `app/monsters/read-input.ts`:

```ts
import type { MonsterInput } from '@/lib/content/monsters';

function readStats(formData: FormData): Record<string, string> | undefined {
  const keys = formData.getAll('stats_key').map(String);
  const values = formData.getAll('stats_value').map(String);
  const stats: Record<string, string> = {};
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    stats[trimmedKey] = (values[i] ?? '').trim();
  });
  return Object.keys(stats).length > 0 ? stats : undefined;
}

export function readInput(formData: FormData): Partial<MonsterInput> {
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
    stats: readStats(formData),
  };
}
```

Run: `npx vitest run app/monsters/read-input.test.ts`
Expected: PASS.

- [ ] **Step 4: Build the shared `StatsEditor` component**

Create `app/content/StatsEditor.module.css`:

```css
.editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: var(--text-sm);
  color: var(--parchment-dim);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.row input {
  background: var(--ink-2);
  border: 1px solid var(--hairline-strong);
  border-radius: 3px;
  padding: 8px 10px;
  color: var(--parchment);
  font-size: var(--text-sm);
}

.removeButton {
  background: transparent;
  border: 1px solid var(--hairline-strong);
  border-radius: 3px;
  padding: 0 12px;
  color: var(--parchment-dim);
  cursor: pointer;
}

.removeButton:hover {
  border-color: var(--seal-crimson);
  color: var(--seal-crimson);
}

.addButton {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed var(--hairline-strong);
  border-radius: 3px;
  padding: 8px 14px;
  color: var(--link-on-ink);
  cursor: pointer;
  font-size: var(--text-sm);
}

.addButton:hover {
  border-color: var(--brass-dim);
}
```

Create `app/content/StatsEditor.tsx`:

```tsx
'use client';

import { useState } from 'react';
import styles from './StatsEditor.module.css';

export function StatsEditor({ defaultValue }: { defaultValue?: Record<string, string> }) {
  const initialRows = Object.entries(defaultValue ?? {});
  const [rows, setRows] = useState<[string, string][]>(initialRows.length > 0 ? initialRows : [['', '']]);

  function updateKey(index: number, key: string) {
    setRows((current) => current.map((row, i) => (i === index ? [key, row[1]] : row)));
  }

  function updateValue(index: number, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? [row[0], value] : row)));
  }

  function addRow() {
    setRows((current) => [...current, ['', '']]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.editor}>
      <span className={styles.label}>Stats</span>
      {rows.map(([key, value], index) => (
        <div className={styles.row} key={index}>
          <input
            aria-label="Stat name"
            placeholder="e.g. HP"
            name="stats_key"
            value={key}
            onChange={(e) => updateKey(index, e.target.value)}
          />
          <input
            aria-label="Stat value"
            placeholder="e.g. 26"
            name="stats_value"
            value={value}
            onChange={(e) => updateValue(index, e.target.value)}
          />
          <button type="button" className={styles.removeButton} onClick={() => removeRow(index)} aria-label="Remove stat row">
            &times;
          </button>
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={addRow}>
        + Add stat
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Rebuild the Monsters form (reference implementation)**

Replace `app/monsters/MonsterForm.tsx` with:

```tsx
import type { Monster, System } from '@/lib/content/types';
import type { SourceOption } from '@/lib/content/sources';
import { StatsEditor } from '../content/StatsEditor';
import styles from './MonsterForm.module.css';

export function MonsterForm({
  action,
  systems,
  sources,
  tags,
  monster,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  sources: SourceOption[];
  tags: string[];
  monster?: Monster;
  error?: string;
}) {
  return (
    <form className={styles.form} action={action}>
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
        Source
        <select id="source_id" name="source_id" defaultValue={monster?.source.id} required>
          <option value="">Choose a source</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.systemName} &middot; {source.name}
            </option>
          ))}
        </select>
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
        <input id="tags" name="tags" defaultValue={monster?.tags.join(', ')} list="tag-suggestions" />
        <datalist id="tag-suggestions">
          {tags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={monster?.description} />
      </label>
      <StatsEditor defaultValue={monster?.stats} />
      <button type="submit">Save</button>
    </form>
  );
}
```

In `app/monsters/MonsterForm.module.css`, find the `textarea` rule (or the `.form input, .form textarea` combined rule if styled together) and add/change:

```css
.form textarea {
  min-height: 220px;
  field-sizing: content;
}
```

(`field-sizing: content` auto-grows in supporting browsers; the raised `220px` fallback min-height helps everywhere else. Do not remove any other existing textarea styling in that rule — only add these two properties.)

- [ ] **Step 6: Wire `sources` and `tags` into the Monsters new/edit pages**

Replace `app/monsters/new/page.tsx` with:

```tsx
import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createMonsterAction } from '../actions';
import { MonsterForm } from '../MonsterForm';
import type { System } from '@/lib/content/types';

export default async function NewMonsterPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'monsters'),
  ]);

  return (
    <main>
      <h1>Add a monster</h1>
      <MonsterForm
        action={createMonsterAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        error={searchParams.error}
      />
    </main>
  );
}
```

Replace `app/monsters/[id]/edit/page.tsx` with:

```tsx
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
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

  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'monsters'),
  ]);
  const boundAction = updateMonsterAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {monster.name}</h1>
      <MonsterForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        monster={monster}
        error={searchParams.error}
      />
    </main>
  );
}
```

- [ ] **Step 7: Manually verify the Monsters form end to end**

Start the dev server, open `/monsters/new`, confirm: Source renders as a dropdown labeled "System · Source Name" (no free-text UUID field), typing a tag shows autocomplete suggestions from existing tags, "+ Add stat" adds a new key/value row and the row's inputs are independently editable, and submitting with at least one stat row creates a monster whose detail page shows that stat in the stats block. Then edit that same monster and confirm its existing stats pre-populate the editor's rows correctly.

- [ ] **Step 8: Apply the identical pattern to Items, Spells, and Rules**

Repeat Steps 3, 5, and 6 for each remaining type:
- `app/items/read-input.ts` (add `readStats`, matching `ItemInput`), `app/items/ItemForm.tsx` (add `sources`/`tags` props, `StatsEditor`, source `<select>`, tag `<datalist>`), `app/items/ItemForm.module.css` (same textarea addition), `app/items/new/page.tsx` + `app/items/[id]/edit/page.tsx` (wire `listSources`/`listTagCounts(client, 'items')`).
- Same for `app/spells/read-input.ts`/`SpellForm.tsx`/`SpellForm.module.css`/`new/page.tsx`/`[id]/edit/page.tsx` with `listTagCounts(client, 'spells')`.
- Same for `app/rules/read-input.ts`/`RuleForm.tsx`/`RuleForm.module.css`/`new/page.tsx`/`[id]/edit/page.tsx` with `listTagCounts(client, 'rules')`.

Add the matching `read-input.test.ts` stats-parsing tests (Step 3's pattern) for Items, Spells, and Rules if a `read-input.test.ts` doesn't already exist for them.

Run: `npx vitest run app/items app/spells app/rules`
Expected: PASS.

- [ ] **Step 9: Run the full suite**

Run: `npx vitest run`
Expected: all tests PASS across the whole project.

- [ ] **Step 10: Commit**

```bash
git add lib/content/sources.ts lib/content/sources.test.ts app/content \
        app/monsters/MonsterForm.tsx app/monsters/MonsterForm.module.css app/monsters/read-input.ts \
        app/monsters/read-input.test.ts app/monsters/new/page.tsx "app/monsters/[id]/edit/page.tsx" \
        app/items app/spells app/rules
git commit -m "Replace raw source UUID field with a real dropdown, add an editable stats editor and tag autocomplete to all forms"
```

---

## Task 9: Login page brand accent

**Files:**
- Modify: `app/login/page.module.css`

**Interfaces:**
- Consumes: Task 1's `--brass` token (already imported globally, no new import needed).

- [ ] **Step 1: Add a small brand accent to the login card**

In `app/login/page.module.css`, add a top accent border to `.form` and a small rule under the heading. Change:

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
  background: var(--panel);
  border: 1px solid var(--hairline);
  border-radius: 6px;
  padding: 28px;
}
```

to:

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
  background: var(--panel);
  border: 1px solid var(--hairline);
  border-top: 3px solid var(--brass);
  border-radius: 6px;
  padding: 28px;
}
```

And add, after the `.page h1` rule:

```css
.page h1::after {
  content: "";
  display: block;
  width: 48px;
  height: 2px;
  background: var(--brass);
  margin: 12px auto 0;
}
```

- [ ] **Step 2: Manually verify**

Start the dev server, open `/login`, confirm a brass top border on the card and a small brass rule under the heading, and that the form still functions (log in with `test` / `1234`).

- [ ] **Step 3: Run the test suite**

Run: `npx vitest run`
Expected: all tests PASS (this task changes no markup or logic, only CSS).

- [ ] **Step 4: Commit**

```bash
git add app/login/page.module.css
git commit -m "Add a small brass accent to the login page"
```

---

## Suggested execution order

Tasks 1 → 2 → 3 are strictly sequential (each touches a file the next one also touches). After Task 3, Task 4 must run before Task 5 (Task 5 consumes Task 4's `listTagCounts`/`TagCount`). Tasks 6, 7, 8, and 9 are independent of 4/5 and of each other (distinct files, stable prop interfaces) and can be dispatched in parallel once Task 1 is done.

## Not covered by this plan

Remove the stray "Test Fireball" spell and any other leftover test rows found during the design audit — this requires a database DELETE, which the agent cannot run directly (blocked by the platform's safety classifier, same as an earlier incident in this project). Ask the user to run it directly in the Supabase SQL editor once this plan is complete.
