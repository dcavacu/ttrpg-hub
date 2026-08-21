# Fantasy Redesign — Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved fantasy-inspired visual direction (Cinzel/EB Garamond typography, per-category accent colors, a custom icon set, torn-edge card shapes) to the front page, login page, and card descriptions, using only data that already exists — no database changes.

**Architecture:** Next.js 14 App Router, CSS Modules, `next/font/google` for the two new typefaces (matching the existing `next/font/local` pattern already used for Geist). A new shared icon-component file lives at `app/content/icons.tsx`, alongside the existing shared `RevealGrid`/`StatsEditor` components. The four content-type browse/detail page CSS files are structurally identical across verticals (an established pattern from the earlier design-audit-fixes plan) — every per-vertical task in this plan applies the same change four times, once per file, not once with a "repeat for the others" shortcut.

**Tech Stack:** Next.js 14 (App Router), TypeScript, plain CSS Modules, `next/font/google`, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-18-fantasy-redesign-and-facets-design.md` — this plan implements only §4 (visual redesign) and the description/line-clamp part of §2's goals. §5–9 (faceted data model, backfill, filter UI, forms) are a separate follow-up plan, per that spec's own scope split.

## Global Constraints

- No Tailwind, no component library — plain CSS Modules only, matching the existing codebase.
- No new dependencies beyond `next/font/google`, which ships as part of Next.js itself (not a new package).
- No database schema changes — everything in this plan works with data that already exists today.
- Every content-type-specific change (Monsters/Items/Spells/Rules) must be applied identically to all four verticals — separate files with identical structure, not a shared component; each task's file list names all four explicitly.
- Preserve all existing passing tests; update fixtures only where a task's own change requires it.
- `AppHeader` already renders "The Compendium" brand and logout on every authenticated page from the root layout — the home page must not duplicate that chrome.

---

## Task 1: Design tokens — fonts, category accents, shared icon set

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/AppHeader.tsx`
- Modify: `app/AppHeader.module.css`
- Create: `app/content/icons.tsx`

**Interfaces:**
- Produces: CSS custom properties `--font-display`, `--font-body`, `--cat-monsters`, `--cat-monsters-soft`, `--cat-items`, `--cat-items-soft`, `--cat-spells`, `--cat-spells-soft`, `--cat-rules`, `--cat-rules-soft`. Tasks 3 and 4 consume the category tokens; Task 2 consumes `--font-display`.
- Produces: `app/content/icons.tsx` exporting `BookIcon`, `SwordIcon`, `PotionIcon`, `WandIcon`, `ScrollIcon`, `SearchIcon`, `SealIcon` — each a React function component accepting standard `React.SVGProps<SVGSVGElement>` (so callers can pass `className`, sizing via CSS). Tasks 3 and 4 import from here.

- [ ] **Step 1: Read the current `app/layout.tsx` and `app/globals.css` in full**

Both files were last touched by an earlier plan (design-audit fixes) — read them fresh rather than assuming line numbers, since this task edits both.

- [ ] **Step 2: Add the two Google fonts via `next/font/google`**

In `app/layout.tsx`, add these imports alongside the existing `localFont` import:

```ts
import { Cinzel, EB_Garamond } from "next/font/google";
```

Add two font instances alongside the existing `geistSans`/`geistMono` declarations:

```ts
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});
```

Add both `.variable` classes to the `<body>` element's existing `className` template string, alongside `geistSans.variable`/`geistMono.variable` (do not remove those — Geist stays in use for anywhere it's still referenced):

```tsx
className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${ebGaramond.variable} antialiased`}
```

- [ ] **Step 3: Add the font, category-accent, and icon-adjacent tokens to `app/globals.css`**

Add these to the existing `:root` block (do not remove any existing token — this is additive):

```css
--font-display: var(--font-cinzel), Georgia, "Times New Roman", serif;
--font-body: var(--font-garamond), Georgia, "Times New Roman", serif;

--cat-monsters: #8a2e2e;
--cat-monsters-soft: #f4e2df;
--cat-items: #96731f;
--cat-items-soft: #f6ecd7;
--cat-spells: #4b3a7a;
--cat-spells-soft: #e9e5f6;
--cat-rules: #285a4f;
--cat-rules-soft: #dfece7;
```

Change the existing `body` rule's `font-family` from the system-sans stack to the new body token:

```css
body {
  color: var(--parchment);
  background: var(--ink);
  font-family: var(--font-body);
}
```

- [ ] **Step 4: Create the shared icon set**

Create `app/content/icons.tsx`:

```tsx
import type { SVGProps } from 'react';

const defaults: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 6c-1.8-1.3-4-2-6.5-2S2 4.3 2 5v13c0 .5.3.8.8.6C4.5 17.9 6.3 17.5 8 17.5c1.5 0 3 .4 4 1.2" />
      <path d="M12 6c1.8-1.3 4-2 6.5-2S22 4.3 22 5v13c0 .5-.3.8-.8.6c-1.7-.7-3.5-1.1-5.2-1.1c-1.5 0-3 .4-4 1.2" />
      <path d="M12 6v12.7" />
    </svg>
  );
}

export function SwordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M14.5 3.5l6 6-9 9-3-3z" />
      <path d="M11.5 15.5L8 19l-4 1 1-4 3.5-3.5" />
      <path d="M17 6l2-2" />
    </svg>
  );
}

export function PotionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M10 2h4" />
      <path d="M11 2v5.5L6.5 15c-1 1.7.2 4 2.2 4h6.6c2 0 3.2-2.3 2.2-4L13 7.5V2" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function WandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 20L15 9" />
      <path d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <path d="M19 13l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L17 15l1.4-.6z" />
    </svg>
  );
}

export function ScrollIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M6 4h11a2 2 0 0 1 2 2v11" />
      <path d="M6 4a2 2 0 0 0-2 2v13a1 1 0 0 0 1.6.8L7 19" />
      <path d="M6 4v14" />
      <path d="M19 17a2 2 0 0 1-2 2H7" />
      <path d="M9 8h6M9 11h6" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function SealIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 6c-1.8-1.3-4-2-6.5-2S2 4.3 2 5v13c0 .5.3.8.8.6C4.5 17.9 6.3 17.5 8 17.5c1.5 0 3 .4 4 1.2" />
      <path d="M12 6c1.8-1.3 4-2 6.5-2S22 4.3 22 5v13c0 .5-.3.8-.8.6c-1.7-.7-3.5-1.1-5.2-1.1c-1.5 0-3 .4-4 1.2" />
      <path d="M12 6v12.7" />
    </svg>
  );
}
```

`SealIcon` and `BookIcon` are deliberately the same open-book glyph — the login page uses it as a wax-seal emblem, the header uses it as a brand mark; keeping them as two named exports (rather than one export used twice) keeps each call site free to diverge visually later without a shared-component refactor forcing them to stay identical.

- [ ] **Step 5: Add the brand mark to `AppHeader`**

In `app/AppHeader.tsx`, import `BookIcon` and add it before the brand text:

```tsx
import Link from 'next/link';
import { logout } from './login/actions';
import { BookIcon } from './content/icons';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/monsters" className={styles.brand}>
        <BookIcon className={styles.brandMark} />
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

In `app/AppHeader.module.css`, find the existing `.brand` rule and add `gap: 10px;` if it isn't already a flex row with a gap (read the file first — it was written in the earlier design-audit-fixes plan as `display: flex; align-items: center;` with no `gap` since it only ever held text before). Add a new rule:

```css
.brandMark {
  width: 20px;
  height: 20px;
  color: var(--brass-dim);
  flex: none;
}
```

- [ ] **Step 6: Verify**

Run: `npx vitest run`
Expected: all existing tests still pass (this task adds new exports and tokens; it doesn't change any tested behavior except `AppHeader`'s rendered markup, which no existing test asserts against by exact structure — confirm this by reading `app/AppHeader.test.tsx` if one exists, and only update it if it does and breaks).

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/globals.css app/AppHeader.tsx app/AppHeader.module.css app/content/icons.tsx
git commit -m "Add Cinzel/EB Garamond fonts, category accent tokens, and a shared icon set"
```

---

## Task 2: Apply the new display font site-wide

**Files:**
- Modify: `app/monsters/page.module.css`
- Modify: `app/items/page.module.css`
- Modify: `app/spells/page.module.css`
- Modify: `app/rules/page.module.css`
- Modify: `app/monsters/[id]/page.module.css`
- Modify: `app/items/[id]/page.module.css`
- Modify: `app/spells/[id]/page.module.css`
- Modify: `app/rules/[id]/page.module.css`

**Interfaces:**
- Consumes: `--font-display` from Task 1.

This task is one mechanical substitution repeated in 8 files — every one of these currently has the identical rule (confirmed present in all four verticals' browse and detail CSS by the earlier design-audit-fixes plan, which established these files as byte-identical in structure across verticals). `app/page.module.css` and `app/login/page.module.css` are deliberately **excluded** from this task — Tasks 3 and 4 replace those two files' content entirely, using the new token from the start, so editing them here would just be overwritten.

- [ ] **Step 1: Apply the same one-line substitution to all 8 files**

In each of the 8 files listed above, find:

```css
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
```

and replace with:

```css
  font-family: var(--font-display);
```

This appears exactly once per file, inside that file's `.page h1` rule. Read each file first to confirm the line is present verbatim before editing — if any file's text differs from this (it shouldn't, per the established byte-identical pattern, but confirm rather than assume), stop and report the discrepancy rather than guessing at a fix.

- [ ] **Step 2: Verify**

Run: `npx vitest run`
Expected: all existing tests still pass (pure CSS value change, no markup or logic touched).

- [ ] **Step 3: Commit**

```bash
git add app/monsters/page.module.css app/items/page.module.css app/spells/page.module.css app/rules/page.module.css \
        "app/monsters/[id]/page.module.css" "app/items/[id]/page.module.css" "app/spells/[id]/page.module.css" "app/rules/[id]/page.module.css"
git commit -m "Apply the new display font token to every browse and detail page heading"
```

---

## Task 3: Rebuild the home page as a real hub

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/page.module.css`
- Modify: `app/page.test.tsx`
- Create: `app/HomeSearch.tsx`
- Create: `app/HomeSearch.module.css`

**Interfaces:**
- Consumes: `getCategoryCounts(client): Promise<CategoryCounts>` from `lib/content/sidebar.ts` (already exported, returns `{ monsters, items, spells, rules }` as numbers). Consumes `SwordIcon`, `PotionIcon`, `WandIcon`, `ScrollIcon` from `app/content/icons.tsx` (Task 1). Consumes `--font-display`, `--cat-*` tokens (Task 1).

- [ ] **Step 1: Read the current `app/page.test.tsx`**

It currently tests the old bare page (`h1` text, one link). This task replaces that page's content entirely — read the existing test first so the rewritten version keeps whatever conventions it already follows (render helpers, query style) rather than introducing a new style.

- [ ] **Step 2: Build the search box as its own client component**

Create `app/HomeSearch.module.css`:

```css
.searchBar {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 520px;
  margin: 0 auto;
  padding: 14px 20px;
  background: var(--panel);
  border: 1px solid var(--hairline-strong);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--hairline), 0 10px 24px -18px rgba(34, 29, 21, 0.5);
}

.searchIcon {
  width: 18px;
  height: 18px;
  color: var(--parchment-dim);
  flex: none;
}

.searchBar input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-family: var(--font-body);
  font-size: 1.05rem;
  color: var(--parchment);
}

.searchBar input::placeholder {
  color: var(--parchment-dim);
  opacity: 0.7;
}
```

Create `app/HomeSearch.tsx`:

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './content/icons';
import styles from './HomeSearch.module.css';

export function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = value.trim();
    router.push(query ? `/monsters?search=${encodeURIComponent(query)}` : '/monsters');
  }

  return (
    <form className={styles.searchBar} role="search" onSubmit={handleSubmit}>
      <SearchIcon className={styles.searchIcon} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the compendium — try “Caerys” or “Frost Shield”"
        aria-label="Search the compendium"
      />
    </form>
  );
}
```

Submitting sends the visitor to the Monsters browse page with the query pre-filled — the same `search` query-string convention `MonsterFilters` already reads on that page. This doesn't search across all four content types at once; that would be a new cross-table search feature, out of scope for a visual redesign plan.

- [ ] **Step 3: Rebuild `app/page.tsx`**

Replace its full contents:

```tsx
import { createSupabaseClient } from '@/lib/supabase/client';
import { getCategoryCounts } from '@/lib/content/sidebar';
import { HomeSearch } from './HomeSearch';
import { SwordIcon, PotionIcon, WandIcon, ScrollIcon } from './content/icons';
import styles from './page.module.css';

export default async function Page() {
  const client = createSupabaseClient();
  const counts = await getCategoryCounts(client);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>A Personal, Invite-Only Archive</p>
        <h1>
          Every creature, item, spell &amp; rule
          <br />
          you keep at the table
        </h1>
        <p className={styles.lede}>
          Gathered from official rulebooks and homebrewed by hand — searchable in the middle of a session, not
          buried in a PDF.
        </p>
        <HomeSearch />
      </section>

      <section className={styles.shelf}>
        <a className={`${styles.tile} ${styles.monsters}`} href="/monsters">
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <SwordIcon />
            </div>
            <span className={styles.tileCount}>{counts.monsters} entries</span>
          </div>
          <h2>Monsters</h2>
          <p>
            Stat blocks and lore for every creature you&apos;ll throw at your table — from lowly minions to
            world-ending legendaries.
          </p>
          <span className={styles.tileCta}>Browse the bestiary</span>
        </a>

        <a className={`${styles.tile} ${styles.items}`} href="/items">
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <PotionIcon />
            </div>
            <span className={styles.tileCount}>{counts.items} entries</span>
          </div>
          <h2>Items</h2>
          <p>Weapons, armor and the loot lining ancient vaults — with the exact modifiers you&apos;ll actually roll.</p>
          <span className={styles.tileCta}>Raid the vault</span>
        </a>

        <a className={`${styles.tile} ${styles.spells}`} href="/spells">
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <WandIcon />
            </div>
            <span className={styles.tileCount}>{counts.spells} entries</span>
          </div>
          <h2>Spells</h2>
          <p>
            Every element and school, with cost and effect laid out so you&apos;re not flipping pages mid-fight.
          </p>
          <span className={styles.tileCta}>Open the grimoire</span>
        </a>

        <a className={`${styles.tile} ${styles.rules}`} href="/rules">
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <ScrollIcon />
            </div>
            <span className={styles.tileCount}>{counts.rules} entries</span>
          </div>
          <h2>Rules</h2>
          <p>Core mechanics, conditions and the fine print that keeps an argument at the table short.</p>
          <span className={styles.tileCta}>Read the fine print</span>
        </a>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Rewrite `app/page.module.css`**

Replace its full contents:

```css
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 32px 80px;
}

.hero {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 48px;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--brass-dim);
  margin: 0 0 18px;
}

.hero h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4.5vw, 2.8rem);
  margin: 0 0 18px;
  letter-spacing: 0.01em;
}

.lede {
  font-size: var(--text-lg);
  line-height: 1.6;
  color: var(--parchment-dim);
  font-style: italic;
  margin: 0 0 28px;
}

.shelf {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .shelf {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--panel);
  border: 1px solid var(--hairline-strong);
  padding: 24px 20px 22px;
  color: inherit;
  text-decoration: none;
  clip-path: polygon(0 8px, 4% 0, 96% 0, 100% 8px, 100% 100%, 0 100%);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 26px -20px rgba(34, 29, 21, 0.5);
}

.tileTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.tileIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tile-soft);
  color: var(--tile-strong);
}

.tileIcon svg {
  width: 20px;
  height: 20px;
}

.tileCount {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: var(--text-2xs);
  color: var(--parchment-dim);
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  padding: 3px 10px;
  align-self: flex-start;
}

.tile h2 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 2px 0 0;
  color: var(--tile-strong);
}

.tile p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--parchment-dim);
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tileCta {
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tile-strong);
}

.monsters {
  --tile-soft: var(--cat-monsters-soft);
  --tile-strong: var(--cat-monsters);
}

.items {
  --tile-soft: var(--cat-items-soft);
  --tile-strong: var(--cat-items);
}

.spells {
  --tile-soft: var(--cat-spells-soft);
  --tile-strong: var(--cat-spells);
}

.rules {
  --tile-soft: var(--cat-rules-soft);
  --tile-strong: var(--cat-rules);
}
```

- [ ] **Step 5: Update `app/page.test.tsx`**

Rewrite to match the new page. `getCategoryCounts` and `createSupabaseClient` need mocking — follow whatever mocking convention `app/monsters/page.test.tsx` uses if one exists (check first — the browse pages are also async server components hitting Supabase), otherwise use this pattern:

```tsx
import { render, screen } from '@testing-library/react';
import Page from './page';

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({}),
}));
vi.mock('@/lib/content/sidebar', () => ({
  getCategoryCounts: async () => ({ monsters: 450, items: 123, spells: 77, rules: 103 }),
}));

describe('Home page', () => {
  it('shows a tile for each content type with its live count', async () => {
    render(await Page());
    expect(screen.getByRole('link', { name: /Monsters/i })).toHaveAttribute('href', '/monsters');
    expect(screen.getByText('450 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Items/i })).toHaveAttribute('href', '/items');
    expect(screen.getByText('123 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Spells/i })).toHaveAttribute('href', '/spells');
    expect(screen.getByText('77 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rules/i })).toHaveAttribute('href', '/rules');
    expect(screen.getByText('103 entries')).toBeInTheDocument();
  });

  it('has a search box that submits to the monsters browse page', () => {
    render(<HomeSearch />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});
```

The second test needs `import { HomeSearch } from './HomeSearch';` added — or, better, move it to its own `app/HomeSearch.test.tsx` file following the project's one-test-file-per-component convention (every other component in this codebase has its own `*.test.tsx`, not a test folded into an unrelated file) — create `app/HomeSearch.test.tsx` with that second test instead, and keep `app/page.test.tsx` to the first test only.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run app/page.test.tsx app/HomeSearch.test.tsx`
Expected: PASS.

- [ ] **Step 7: Manually verify**

Start the dev server, log in, visit `/`, confirm: no duplicate header (only `AppHeader`'s), the hero renders with working search (typing a name and pressing Enter navigates to `/monsters?search=...` with results), all four tiles show real counts matching the Sidebar's own counts on the browse pages, and each tile links to its category.

- [ ] **Step 8: Run the full suite and commit**

Run: `npx vitest run`
Expected: all tests PASS.

```bash
git add app/page.tsx app/page.module.css app/page.test.tsx app/HomeSearch.tsx app/HomeSearch.module.css app/HomeSearch.test.tsx
git commit -m "Rebuild the home page as a real hub with live category counts and search"
```

---

## Task 4: Redesign the login page

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/login/page.module.css`

**Interfaces:**
- Consumes: `SealIcon` from `app/content/icons.tsx` (Task 1). Consumes `--font-display`, `--cat-*` are NOT used here (login stays on the neutral brass/parchment palette, not a category color) — only the existing tokens plus `--font-display`/`--font-body`.

No change to `login`'s server action, field names, or `redirectTo` handling — this task is markup/CSS only, adding the seal icon and an ornamental divider.

- [ ] **Step 1: Read the current `app/login/page.tsx`**

Confirm the exact current structure before editing (it was last touched in the earlier design-audit-fixes plan, which added the brass top-border and heading rule via CSS only — no markup changes yet).

- [ ] **Step 2: Add the seal and a divider to the markup**

Replace `app/login/page.tsx`'s contents:

```tsx
import { login } from './actions';
import { SealIcon } from '../content/icons';
import styles from './page.module.css';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.seal}>
          <SealIcon className={styles.sealIcon} />
        </div>
        <h1>Enter the Compendium</h1>
        <p className={styles.sub}>By invitation only</p>
        <form className={styles.form} action={login}>
          <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/monsters'} />
          <label>
            Username
            <input type="text" name="username" required autoFocus autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {searchParams.error && <p role="alert">That username or password isn&apos;t right. Try again.</p>}
          <button type="submit">Enter</button>
        </form>
      </div>
    </main>
  );
}
```

The `.form` and its inputs keep the exact same `name`/`type`/`required`/`autoComplete` attributes as before — only the wrapping markup (a `.card` div around the heading+form, the seal) is new.

- [ ] **Step 3: Rewrite `app/login/page.module.css`**

Replace its full contents:

```css
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
  background:
    radial-gradient(ellipse 1000px 700px at 50% 20%, rgba(90, 60, 30, 0), rgba(20, 14, 8, 0.55) 85%),
    linear-gradient(160deg, #2b2013 0%, #1c140c 55%, #140d08 100%);
  overflow: hidden;
}

.card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  background: var(--panel);
  border: 1px solid var(--hairline-strong);
  padding: 46px 38px 34px;
  clip-path: polygon(0 10px, 3% 0, 97% 0, 100% 10px, 100% 100%, 0 100%);
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.6);
}

.seal {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  margin: -80px auto 22px;
  background: radial-gradient(circle at 35% 30%, #e2bc7a, var(--brass-dim) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a1f10;
  box-shadow: 0 10px 22px -8px rgba(0, 0, 0, 0.55), inset 0 -3px 6px rgba(0, 0, 0, 0.25);
}

.sealIcon {
  width: 28px;
  height: 28px;
}

.page h1 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xl);
  text-align: center;
  margin: 0 0 6px;
}

.sub {
  text-align: center;
  color: var(--parchment-dim);
  font-style: italic;
  font-size: var(--text-sm);
  margin: 0 0 26px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-dim);
}

.form input {
  font-family: var(--font-body);
  background: var(--ink-2);
  border: 1px solid var(--hairline-strong);
  border-radius: 3px;
  padding: 10px 12px;
  color: var(--parchment);
  font-size: var(--text-base);
}

.form button {
  margin-top: 6px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--brass);
  color: var(--parchment);
  border: none;
  border-radius: 3px;
  padding: 12px;
  cursor: pointer;
}

.form button:hover {
  background: #d1ab6d;
}

.form [role="alert"] {
  color: var(--seal-crimson);
  font-size: var(--text-sm);
}
```

Note this drops the earlier plan's flat `min-height: 100vh; display: flex;` centering-only background (plain `--ink`) in favor of the atmospheric dark gradient from the reviewed mockup — the login page is the one screen in the app that deliberately breaks from the light parchment ground everywhere else, matching what was shown and approved.

- [ ] **Step 4: Manually verify**

Start the dev server, visit `/login` logged out, confirm: the seal renders centered above the card, the form still submits and authenticates correctly with real credentials, and an invalid login still shows the error message in the same place as before.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run`
Expected: all existing tests pass (check `app/login/page.test.tsx` or `app/login/actions.test.ts` if either exists — this task doesn't change the `login` action or field names, so any existing test on that behavior should be unaffected; if a test asserts on the page's exact DOM structure in a way the new wrapping `.card` div breaks, update it to match, not to work around it).

- [ ] **Step 6: Commit**

```bash
git add app/login/page.tsx app/login/page.module.css
git commit -m "Redesign the login page with an atmospheric background and wax-seal emblem"
```

---

## Task 5: Add clamped description snippets to browse cards

**Files:**
- Modify: `app/monsters/MonsterCard.tsx`, `app/monsters/MonsterCard.module.css`, `app/monsters/MonsterCard.test.tsx`
- Modify: `app/items/ItemCard.tsx`, `app/items/ItemCard.module.css`, `app/items/ItemCard.test.tsx`
- Modify: `app/spells/SpellCard.tsx`, `app/spells/SpellCard.module.css`, `app/spells/SpellCard.test.tsx`
- Modify: `app/rules/RuleCard.tsx`, `app/rules/RuleCard.module.css`, `app/rules/RuleCard.test.tsx`

**Interfaces:**
- No new exports — each card's existing `{ monster: Monster }`/`{ item: Item }`/etc. prop signature is unchanged; this only adds to what's rendered inside.

Cards today show name, rating/type, meta line, and the official/homebrew badge, but never the entry's `description` — that only appears on the detail page. This task adds a 2-line, clamped description preview to each card, guarded against empty strings (some SRD-imported monsters, e.g. the Aboleth, genuinely have an empty `description` — confirmed live during the earlier design-audit-fixes work — rendering nothing there is correct, not a bug to work around).

- [ ] **Step 1: Add the failing assertion to `MonsterCard.test.tsx` (reference implementation)**

Read the current file first. Add a description to the existing `monster` fixture (it currently has one: `'Half owl, half bear, all bad mood.'` — keep it) and add a new test:

```tsx
  it('shows a preview of the description when present', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByText('Half owl, half bear, all bad mood.')).toBeInTheDocument();
  });

  it('renders nothing extra when the description is empty', () => {
    render(<MonsterCard monster={{ ...monster, description: '' }} />);
    expect(screen.queryByText('Half owl, half bear, all bad mood.')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run it to verify the first new test fails**

Run: `npx vitest run app/monsters/MonsterCard.test.tsx`
Expected: FAIL on `shows a preview of the description when present` (the text isn't rendered anywhere yet).

- [ ] **Step 3: Add the description to `MonsterCard.tsx`**

Inside `.cardLink`, after the official/homebrew `<span>` and before the closing `</Link>`, add:

```tsx
        {monster.description && <p className={styles.desc}>{monster.description}</p>}
```

- [ ] **Step 4: Add the clamp CSS to `MonsterCard.module.css`**

Add:

```css
.desc {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--parchment-dim);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run app/monsters/MonsterCard.test.tsx`
Expected: PASS, all tests including the two new ones.

- [ ] **Step 6: Apply the identical pattern to Items, Spells, and Rules**

Repeat Steps 1–5 for `ItemCard`/`ItemCard.module.css`/`ItemCard.test.tsx` (using the `item` fixture's `description`), `SpellCard`/`SpellCard.module.css`/`SpellCard.test.tsx` (using `spell`), and `RuleCard`/`RuleCard.module.css`/`RuleCard.test.tsx` (using `rule`) — same `{x.description && <p className={styles.desc}>{x.description}</p>}` placement, same `.desc` CSS block, same two new test cases adapted to each fixture's variable name and existing description text (check each `*Card.test.tsx` file's fixture for what description text is already there, and use that exact text in the new assertions rather than inventing new copy).

Run: `npx vitest run app/items/ItemCard.test.tsx app/spells/SpellCard.test.tsx app/rules/RuleCard.test.tsx`
Expected: PASS.

- [ ] **Step 7: Manually verify against real long-description content**

Start the dev server, open `/monsters`, find a Nimble Legendary monster with a long description (e.g. Caerys or a similar boss-tier entry) and confirm its card shows exactly 2 lines of description with an ellipsis, not the full paragraph — the point of this task is that browse-grid row heights stay predictable regardless of how long an individual entry's description is.

- [ ] **Step 8: Run the full suite and commit**

Run: `npx vitest run`
Expected: all tests PASS.

```bash
git add app/monsters/MonsterCard.tsx app/monsters/MonsterCard.module.css app/monsters/MonsterCard.test.tsx \
        app/items/ItemCard.tsx app/items/ItemCard.module.css app/items/ItemCard.test.tsx \
        app/spells/SpellCard.tsx app/spells/SpellCard.module.css app/spells/SpellCard.test.tsx \
        app/rules/RuleCard.tsx app/rules/RuleCard.module.css app/rules/RuleCard.test.tsx
git commit -m "Add clamped description previews to browse cards"
```

---

## Suggested execution order

Task 1 first (everything else consumes its tokens/icons). Task 2 next (mechanical, low-risk, touches files no other task in this plan touches). Tasks 3, 4, and 5 are independent of each other after Task 1 — each touches its own distinct files — and can be dispatched in any order, or in parallel if running multiple implementers is available.

## Not covered by this plan

The existing Official/Homebrew card badge (a colored dot + text label) is deliberately left as-is — it's already accessible (color paired with a text label, not color alone, confirmed in the earlier whole-branch review) and a wax-seal icon replacement for it wasn't worked out at real-implementation fidelity, only sketched in passing in the reviewed mockup. `SealIcon` (Task 1) is used only for the login page in this plan.

The faceted-filter data model (new `combat_role`/`race`/`tier` columns on Monsters, `school`/`mana_cost` on Spells, exposing `item_type`/`rarity`/`category` as real filters on Items/Rules, the backfill pass, and the facet-specific colors/icons/badges shown in the reviewed mockup) is a separate follow-up plan per the design spec's own scope split — it touches the live database and carries real risk that shouldn't gate this visual work.
