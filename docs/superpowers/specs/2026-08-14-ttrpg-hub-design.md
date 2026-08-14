# ttrpg-hub — Design Spec

Date: 2026-08-14
Status: Approved for implementation planning

## Purpose

A personal, invite-only web app that aggregates TTRPG reference content —
monsters, items, spells, and rules — from official books (any system,
any publisher) alongside custom homebrew, so the user and their table
(or other GMs) can search and filter everything from one place instead
of flipping between books and PDFs.

## Non-goals (v1)

- No live syncing against external game APIs during play — official
  content is imported once and then lives entirely in the database.
- No automated OCR/PDF-parsing pipeline. PDF content is transcribed
  manually (by the user, optionally assisted) into the database.
- No per-user accounts or granular permissions.
- No public signup — the app is invite-only via a single shared
  password.

## Architecture

- **Frontend/backend**: Next.js (React), deployed on Vercel (free tier).
- **Database**: Postgres via Supabase (free tier), also used for
  storing entry images.
- **Access control**: a single shared password gates the whole app.
  Entering it sets a signed cookie; no per-user accounts. View and
  edit share the same gate in v1 — splitting them into separate
  view/edit passwords is a straightforward later addition, not built
  now.

This is a single deployable app (one Vercel project + one Supabase
project), chosen over a static-site-plus-headless-CMS split or a
spreadsheet-backed (Airtable/Notion) approach because it needs one
real relational database that can be edited two different ways
(in-app form, or Supabase's own table editor) without keeping two
systems in sync, and because TTRPG stat blocks don't fit spreadsheet
rows cleanly.

## Data model

Content is system-agnostic: the same tables hold entries for any
TTRPG system, distinguished by foreign keys rather than per-system
tables.

- **`systems`** — `id`, `name`, `slug` (e.g. "D&D 5e", "Pathfinder 2e")
- **`sources`** — `id`, `name`, `system_id`, `is_homebrew` (bool),
  `publisher`. `is_homebrew` is the single flag that drives the
  official-vs-custom filter across the whole site — no separate
  "homebrew" tables or sections.
- **`monsters`**, **`items`**, **`spells`**, **`rules`** — each has:
  - `id`, `name`, `system_id` (FK), `source_id` (FK)
  - `tags text[]` — free-form tags for filtering (e.g. "undead",
    "cursed", "core-rule")
  - `description text` — human-readable body/flavor text
  - `stats jsonb` — system-specific structured data (a 5e monster's
    stat block and a Call of Cthulhu one don't share a shape; JSON
    avoids a schema fork per system)
- Full-text search index (Postgres `tsvector`) on `name` +
  `description` across all four content tables, backing the global
  search bar.

## Site structure

- **Home** — search bar plus recently-added entries.
- **Browse pages** (one per content type: Monsters, Items, Spells,
  Rules) — filter sidebar (system, official/homebrew via
  `is_homebrew`, tags, level/CR range) combined with live search.
- **Detail page** — rendered view of a single entry's stat block.
- **Add/Edit form** — reachable via "Edit" on a detail page or "+ Add"
  on a browse page; gated behind the shared password.

## Content ingestion

- **Official SRD content**: one-time seed script pulls from the free
  Open5e API, tagging imported rows `is_homebrew = false`. Runs once
  during setup; the running app never calls external game APIs.
- **Official non-SRD content from owned PDFs**: no automated parser —
  transcribed by hand into the admin form or directly via Supabase's
  table editor, since PDF stat-block extraction is unreliable enough
  to not be worth automating for v1.
- **Homebrew**: added directly via the admin form or Supabase's table
  editor — both write to the same tables, so either is usable
  interchangeably at any time.

## Deployment

- Vercel free tier hosts the Next.js app.
- Supabase free tier hosts Postgres and entry images.
- Shared password stored as an environment variable (hashed at rest),
  checked server-side to set the access cookie.

## Open items for later (explicitly deferred, not v1)

- Splitting the shared password into separate view/edit passwords.
- Per-user accounts if the group grows beyond a shared-password level
  of trust.
- Any assisted/semi-automated PDF transcription workflow, if manual
  entry proves too slow in practice.
- Project/site naming — currently generic (`ttrpg-hub`), to be
  renamed later.
