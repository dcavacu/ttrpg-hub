# Fantasy-Inspired Redesign & Faceted Filters — Design Spec

**Status:** Approved direction (visual mockup reviewed live via a design canvas); data model and scope confirmed in conversation. This spec is the write-up of that conversation for the implementation plan to argue from.

## 1. Overview

Two related changes to ttrpg-hub, requested together but separable in risk:

1. **Visual redesign** of the front page and login page (currently nearly bare/generic) into a more distinctive, fantasy-inspired direction — richer per-category color, custom line-icon set, a display/body font pairing (Cinzel + EB Garamond) in place of the generic system sans, torn-edge card treatment instead of uniform rounded rectangles. Low risk: CSS/markup only, no data changes.
2. **Faceted filtering** for all four content types, replacing (for Monsters/Spells) or supplementing (for Items/Rules) the current single flat `tags` list with real, structured, filterable fields specific to each content type. Higher risk for Monsters/Spells: requires new database columns and backfilling existing rows; low risk for Items/Rules: the data already exists as typed columns, this is exposing it as filters.

A working visual direction for #1 was built and reviewed as a design canvas (four static artboards: Home, Login, a Monsters browse mockup, a Spells browse mockup) and approved. This spec focuses on making that direction and the faceted-filter data model precise enough to plan from — it does not re-litigate the visual direction, which is already settled.

## 2. Goals

- Give every content type (Monsters, Items, Spells, Rules) its own set of real, structured filter facets — not just a flat tag cloud — using data that's either already there or worth adding.
- Apply the approved fantasy-inspired visual direction to the front page, login page, and (by extension of the same design tokens) the rest of the app's chrome.
- Keep card/list description text visually bounded (line-clamped) so browse pages stay scannable regardless of how long an individual entry's description is — this applies today and will matter more once Legendary-tier Nimble monsters (some of the longest descriptions in the dataset) show up in the same grid as terse SRD stat blocks.

## 3. Non-goals

- No new content types, no new game systems.
- No change to the Items/Rules *schema* — their new facets are existing columns (`item_type`, `rarity`, `category`) getting exposed as filters, not new data.
- No redesign of the add/edit form *layout* beyond adding the new facet fields where the data model requires them (Monsters, Spells).
- No dark-mode/theme-toggle work — the redesign stays within one committed light, parchment-based direction, matching the earlier "lighter/brighter" decision for this app.

## 4. Visual redesign

Already prototyped and approved (design canvas artboards: Home, Login, Monsters-with-facets, Spells-with-facets). Key decisions to carry into implementation:

- **Typography:** Cinzel (Google Fonts) for display/headings, EB Garamond (Google Fonts) for body/reading text, replacing the current Georgia fallback stack for headings and the system-sans body font. `ui-monospace` stays reserved for genuine numeric/mechanical data (stat values, counts), unchanged from the earlier design-audit work.
- **Category accent colors:** each content type gets its own accent hue instead of the single brass/teal/crimson set reused everywhere — Monsters crimson, Items gold, Spells arcane violet, Rules verdigris teal. These become new CSS custom properties alongside the existing `--seal-*`/`--brass*` tokens, not a replacement of them (the existing tokens still cover official/homebrew badges, focus rings, hairlines).
- **Shape language:** torn/deckle top edges on cards and tiles (CSS `clip-path`) in place of uniform rounded rectangles; a wax-seal circular badge motif for "Official" content and the login page's emblem; a shield-shaped badge for Legendary-tier monsters, a small chevron-circle for Minion-tier.
- **Iconography:** a small custom line-icon set (stroke-based, one consistent grid/weight) for each category (sword-ish icon for Monsters, potion for Items, wand for Spells, scroll for Rules) plus per-facet icons (melee/ranged, official/homebrew) — replacing the current lack of any iconography.
- **Front page:** goes from a single heading + one link to a real hub — hero with search, then a tile per content type (icon, live count, one-line description, accent color), matching the four categories that exist today.
- **Login page:** goes from a plain centered card to an atmospheric full-bleed background with a framed, wax-sealed card — same functional fields (username/password), no behavior change.
- **Line-clamping:** card and tile description text capped at 2–3 lines (`-webkit-line-clamp` plus standard `line-clamp`) with ellipsis overflow, so a browse grid's row heights stay predictable regardless of individual entry description length.

## 5. Data model changes

### 5.1 Monsters — 3 new columns

| Column | Type | Values | Notes |
|---|---|---|---|
| `combat_role` | `text`, nullable | `Melee`, `Ranged` | No existing data. Some monsters are genuinely ambiguous (pure support/caster) — nullable rather than forced. |
| `race` | `text`, nullable | D&D 5e's existing SRD creature-type vocabulary (`Aberration`, `Beast`, `Celestial`, `Construct`, `Dragon`, `Elemental`, `Fey`, `Fiend`, `Giant`, `Humanoid`, `Monstrosity`, `Ooze`, `Plant`, `Undead`) plus one Nimble-specific addition, `Giant Bug` | D&D SRD monsters already carry their official type as a `tags` entry today — those migrate directly, no guessing. Nimble content's tags are thematic groupings (e.g. "Kobolds", "Dungeon Denizens") rather than a clean race in every case — those need a judgment pass, reusing the same vocabulary. |
| `tier` | `text`, `NOT NULL DEFAULT 'Normal'` | `Normal`, `Legendary`, `Minion` | Derivable from the existing `rating_label` field for the whole current dataset: `Minion` appears literally in Nimble minion-tier labels, `Solo` appears in every Legendary boss's label. No AI pass needed — a deterministic parse. |

### 5.2 Spells — 2 new columns

| Column | Type | Values | Notes |
|---|---|---|---|
| `school` | `text`, nullable | `Fire`, `Ice`, `Lightning`, `Wind`, `Radiant`, `Necrotic`, `Utility` | The elemental `tags` already on every spell today already *are* the school — direct migration, no guessing, for the elemental schools. `Utility` spells (the non-elemental Core Rules utility list) map to their own value. |
| `mana_cost` | `integer`, nullable | `0` and up | No existing data anywhere. `0` is a real, valid value (Cantrips) distinct from `null` ("not yet assigned"). Filled via a judgment pass reading each spell's tier/action cost and description. |

### 5.3 Items — no new columns

`item_type` and `rarity` already exist as typed, populated columns (`lib/content/types.ts`'s `Item` interface). This work is exposing them as sidebar/filter facets, not adding data.

### 5.4 Rules — no new columns

`category` already exists as a typed, populated column. Same as Items: exposing it as a filter facet, not adding data.

## 6. Backfill strategy (Monsters, Spells only)

The genuinely-new fields (`combat_role`, the Nimble portion of `race`, `mana_cost`) get filled via an assisted pass: read each entry's existing description/stats/source material, write a value, apply via a batch update against the live database. Before treating any backfill as final, a random sample is shown to the user for spot-check, per the user's explicit approval of this approach in conversation. The deterministic portions (`tier` from `rating_label`, `race` for D&D SRD monsters, `school` for spells) don't need the assisted pass at all — they're a direct, scripted migration from data that already exists.

This mirrors the project's established pattern for content-affecting database writes: scripted where the mapping is deterministic, assisted-and-spot-checked where it requires judgment, never a blind bulk write with no verification step.

## 7. Filter/facet UI changes

Each content type's browse page gains filter groups for its own facets, alongside the existing System/Source(official-homebrew)/general-Tags filters already in place from the earlier design-audit work:

- **Monsters:** + Combat Role, + Race, + Tier
- **Items:** + Item Type, + Rarity
- **Spells:** + School, + Mana Cost (bucketed, e.g. `0`, `1–2`, `3+`, matching the reviewed mockup)
- **Rules:** + Category

The general `tags` field and its filter stay in place for all four types (flavor/thematic tags that don't fit a dedicated facet) — this is additive, not a replacement of the existing tag-filtering work.

Exact component boundaries (whether these live inside each type's existing `*Filters.tsx`, an extended `Sidebar`, or a new shared facet-group component reused across all four) are an implementation-planning decision, not a spec-level one — the constraint this spec sets is: each facet group is real, filterable, and visually distinct per the reviewed mockup (colored swatches/icons per value, a count per option), not a flat checkbox list indistinguishable from the general tags.

## 8. Forms

- **MonsterForm:** add Combat Role (select), Race (select/autocomplete), Tier (select) fields.
- **SpellForm:** add School (select) and Mana Cost (number input) fields.
- **ItemForm, RuleForm:** no new fields expected — `item_type`/`rarity`/`category` are already present as form fields (per the existing `Item`/`Rule` input types); confirm during implementation rather than assume.

## 9. Cards & detail pages

- Monster cards/detail pages show the new tier badge (shield for Legendary, chevron for Minion, unbadged for Normal), a race pill, and a combat-role icon chip, per the reviewed mockup.
- Spell cards/detail pages show a school-colored chip and a mana-cost droplet badge, per the reviewed mockup.
- Item cards already show `rarity` in their existing rating-slot position (from the earlier design-audit card work); `item_type` display is a minor addition, not a redesign.
- Rule cards already show `category` in their existing rating-slot position; no new card-level display work expected.

## 10. Open assumptions to verify during implementation

- Whether `ItemForm`/`RuleForm` genuinely already expose `item_type`/`rarity`/`category` as form fields (stated as expected in §8, not independently re-verified while writing this spec).
- The exact backfill sample size and spot-check format the user reviews before the assisted-pass values are treated as final.
- Whether `race`'s Nimble-side judgment calls should default to a narrower vocabulary (reusing the D&D SRD's 14 types) or need occasional new values beyond `Giant Bug` — to be resolved case-by-case during the backfill pass, not pre-decided here.
