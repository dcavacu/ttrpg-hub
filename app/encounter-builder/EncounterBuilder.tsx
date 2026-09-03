'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { levelLabelToNumber, extractLevelLabel, previewRescale } from '@/lib/content/monsterScaling';
import { assessEncounterDifficulty, suggestMinionDieSize, extractDescriptionMarker } from '@/lib/content/encounterBalance';
import { renderInlineMarkdown } from '@/lib/content/markdown';
import type { LeanMonster } from '@/lib/content/monsters';
import styles from './EncounterBuilder.module.css';

interface HeroEntry {
  id: string;
  name: string;
  level: number;
  hp: number;
}

interface RosterEntry {
  monsterId: string;
  quantity: number;
  /** A level label ("6", "1/2") to use instead of the monster's own
   * current level -- for reusing one compendium entry at a different
   * strength for this specific encounter, without editing its real
   * stats. Empty string means "use the monster's own level." */
  levelOverride: string;
}

interface CombatToken {
  key: string;
  name: string;
  kind: 'hero' | 'monster';
  levelLabel: string | null;
  maxHp: number;
  currentHp: number;
  initiative: number;
  bloodied: string | null;
  lastStand: string | null;
}

const STORAGE_KEY = 'ttrpg-hub-encounter-builder-v2';

let nextHeroId = 1;
function makeHero(level = 1): HeroEntry {
  return { id: `h${nextHeroId++}`, name: '', level, hp: 20 };
}

export function EncounterBuilder({ monsters }: { monsters: LeanMonster[] }) {
  const [heroes, setHeroes] = useState<HeroEntry[]>(() => [makeHero(), makeHero(), makeHero(), makeHero()]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tokens, setTokens] = useState<CombatToken[] | null>(null);
  const [round, setRound] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [restored, setRestored] = useState(false);
  const [previewMonster, setPreviewMonster] = useState<LeanMonster | null>(null);
  const searchId = useId();

  const monsterById = useMemo(() => new Map(monsters.map((m) => [m.id, m])), [monsters]);

  // Restore whatever the GM had set up last time, so an accidental
  // refresh mid-session doesn't lose the encounter. Deliberately local to
  // this browser only -- this tool's state is per-GM-device scratch
  // work, not something players or other sessions need to see.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          heroes?: HeroEntry[];
          roster?: RosterEntry[];
          tokens?: CombatToken[] | null;
          round?: number;
          activeIndex?: number;
        };
        if (Array.isArray(saved.heroes) && saved.heroes.length > 0) setHeroes(saved.heroes);
        if (Array.isArray(saved.roster)) setRoster(saved.roster);
        if (saved.tokens !== undefined) setTokens(saved.tokens);
        if (typeof saved.round === 'number') setRound(saved.round);
        if (typeof saved.activeIndex === 'number') setActiveIndex(saved.activeIndex);
      }
    } catch {
      // Storage unavailable or corrupt -- start fresh, silently.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return; // don't clobber saved state with initial defaults before restore runs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ heroes, roster, tokens, round, activeIndex }));
    } catch {
      // Storage full or unavailable -- the tool still works, it just won't survive a refresh.
    }
  }, [heroes, roster, tokens, round, activeIndex, restored]);

  const heroTotal = heroes.reduce((a, h) => a + h.level, 0);
  const partyAvgLevel = heroes.length ? Math.round(heroTotal / heroes.length) : 1;
  const monsterTotal = roster.reduce((sum, entry) => {
    const monster = monsterById.get(entry.monsterId);
    if (!monster) return sum;
    const levelLabel = entry.levelOverride || extractLevelLabel(monster.ratingLabel) || '';
    return sum + levelLabelToNumber(levelLabel) * entry.quantity;
  }, 0);
  // Only a real roster earns a difficulty rating -- an empty encounter
  // isn't meaningfully "Easy," it's just not built yet.
  const difficulty = roster.length > 0 ? assessEncounterDifficulty(monsterTotal, heroTotal) : null;
  const minionDie = suggestMinionDieSize(partyAvgLevel);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return monsters.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [search, monsters]);

  function addHero() {
    setHeroes((prev) => [...prev, makeHero(prev[prev.length - 1]?.level ?? 1)]);
  }
  function removeHero(id: string) {
    setHeroes((prev) => prev.filter((h) => h.id !== id));
  }
  function updateHero(id: string, patch: Partial<HeroEntry>) {
    setHeroes((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function addMonster(monster: LeanMonster) {
    setRoster((prev) => {
      const existing = prev.find((r) => r.monsterId === monster.id);
      if (existing) return prev.map((r) => (r.monsterId === monster.id ? { ...r, quantity: r.quantity + 1 } : r));
      return [...prev, { monsterId: monster.id, quantity: 1, levelOverride: '' }];
    });
    setSearch('');
  }
  function setQuantity(monsterId: string, quantity: number) {
    setRoster((prev) => prev.flatMap((r) => (r.monsterId === monsterId ? (quantity <= 0 ? [] : [{ ...r, quantity }]) : [r])));
  }
  function setLevelOverride(monsterId: string, levelOverride: string) {
    setRoster((prev) => prev.map((r) => (r.monsterId === monsterId ? { ...r, levelOverride } : r)));
  }
  function removeMonster(monsterId: string) {
    setRoster((prev) => prev.filter((r) => r.monsterId !== monsterId));
  }

  function startEncounter() {
    const newTokens: CombatToken[] = [];

    for (const hero of heroes) {
      newTokens.push({
        key: `hero-${hero.id}`,
        name: hero.name.trim() || `Hero (Lvl ${hero.level})`,
        kind: 'hero',
        levelLabel: String(hero.level),
        maxHp: hero.hp,
        currentHp: hero.hp,
        initiative: 0,
        bloodied: null,
        lastStand: null,
      });
    }

    for (const entry of roster) {
      const monster = monsterById.get(entry.monsterId);
      if (!monster) continue;
      const levelLabel = entry.levelOverride || extractLevelLabel(monster.ratingLabel);
      const preview = levelLabel ? previewRescale(monster.tier, monster.armor, monster.ratingLabel, levelLabel, monster.hp) : null;
      const maxHp = preview ? preview.hp : Number(monster.hp) || 0;
      const bloodied = extractDescriptionMarker(monster.description, 'BLOODIED');
      const lastStand = extractDescriptionMarker(monster.description, 'LAST STAND');
      for (let i = 1; i <= entry.quantity; i++) {
        newTokens.push({
          key: `${entry.monsterId}-${i}`,
          name: entry.quantity > 1 ? `${monster.name} #${i}` : monster.name,
          kind: 'monster',
          levelLabel: levelLabel ?? null,
          maxHp,
          currentHp: maxHp,
          initiative: 0,
          bloodied,
          lastStand,
        });
      }
    }

    setTokens(newTokens);
    setRound(1);
    setActiveIndex(0);
  }

  function endEncounter() {
    setTokens(null);
  }

  function adjustHp(key: string, delta: number) {
    setTokens((prev) => (prev ? prev.map((t) => (t.key === key ? { ...t, currentHp: Math.max(0, Math.min(t.maxHp, t.currentHp + delta)) } : t)) : prev));
  }
  function setHp(key: string, value: number) {
    setTokens((prev) => (prev ? prev.map((t) => (t.key === key ? { ...t, currentHp: Math.max(0, Math.min(t.maxHp, value)) } : t)) : prev));
  }
  function setInitiative(key: string, value: number) {
    setTokens((prev) => (prev ? prev.map((t) => (t.key === key ? { ...t, initiative: value } : t)) : prev));
  }
  function sortByInitiative() {
    setTokens((prev) => (prev ? [...prev].sort((a, b) => b.initiative - a.initiative) : prev));
    setActiveIndex(0);
  }
  function nextTurn() {
    if (!tokens || tokens.length === 0) return;
    setActiveIndex((i) => {
      const next = i + 1;
      if (next >= tokens.length) {
        setRound((r) => r + 1);
        return 0;
      }
      return next;
    });
  }
  function prevTurn() {
    if (!tokens || tokens.length === 0) return;
    setActiveIndex((i) => (i - 1 < 0 ? tokens.length - 1 : i - 1));
  }

  const previewModal = previewMonster && (
    <div className={styles.modalOverlay} onClick={() => setPreviewMonster(null)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalName}>{previewMonster.name}</h3>
            <p className={styles.modalSubtitle}>
              {[previewMonster.ratingLabel, previewMonster.tier !== 'Normal' ? previewMonster.tier : null, previewMonster.combatRole, previewMonster.race]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <button type="button" className={styles.modalClose} onClick={() => setPreviewMonster(null)} aria-label="Close">
            &times;
          </button>
        </div>
        {Object.keys(previewMonster.stats).length > 0 && (
          <dl className={styles.modalStats}>
            {Object.entries(previewMonster.stats).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {previewMonster.description && <p className={styles.modalDescription}>{renderInlineMarkdown(previewMonster.description)}</p>}
        <button
          type="button"
          className={styles.startButton}
          onClick={() => {
            addMonster(previewMonster);
            setPreviewMonster(null);
          }}
        >
          Add to encounter
        </button>
      </div>
    </div>
  );

  if (tokens) {
    return (
      <div className={styles.tracker}>
        <div className={styles.trackerHeader}>
          <h2 className={styles.trackerHeading}>Combat Tracker</h2>
          <button type="button" className={styles.ghostButton} onClick={endEncounter}>
            Back to builder
          </button>
        </div>

        <div className={styles.turnBar}>
          <span className={styles.roundLabel}>Round {round}</span>
          <button type="button" className={styles.ghostButton} onClick={prevTurn}>
            &larr; Prev turn
          </button>
          <span className={styles.activeName}>
            {tokens[activeIndex] ? `${tokens[activeIndex].name}'s turn` : ''}
          </span>
          <button type="button" className={styles.ghostButton} onClick={nextTurn}>
            Next turn &rarr;
          </button>
          <button type="button" className={styles.ghostButton} onClick={sortByInitiative}>
            Sort by initiative
          </button>
        </div>
        <p className={styles.turnHint}>
          Enter each combatant&apos;s initiative from your own roll, then &quot;Sort by initiative&quot; to order the
          list -- Prev/Next turn just steps through whatever order the list is in.
        </p>

        <ul className={styles.tokenList}>
          {tokens.map((t, i) => {
            const defeated = t.maxHp > 0 && t.currentHp <= 0;
            const bloodiedNow = t.bloodied && t.maxHp > 0 && t.currentHp <= t.maxHp / 2;
            return (
              <li
                key={t.key}
                className={`${styles.token} ${t.kind === 'hero' ? styles.tokenHero : ''} ${defeated ? styles.tokenDefeated : ''} ${i === activeIndex ? styles.tokenActive : ''}`}
              >
                <div className={styles.tokenTop}>
                  <span className={styles.tokenName}>
                    {i === activeIndex && <span className={styles.turnMarker}>&#9654;</span>}
                    {t.name}
                    {t.kind === 'hero' && <span className={styles.tokenKind}>Hero</span>}
                    {t.levelLabel && <span className={styles.tokenLevel}>Lvl {t.levelLabel}</span>}
                  </span>
                  {defeated && <span className={styles.tokenDefeatedLabel}>Defeated</span>}
                </div>

                <label className={styles.fieldLabel}>
                  Initiative
                  <input
                    type="number"
                    className={styles.initInput}
                    value={t.initiative}
                    onChange={(e) => setInitiative(t.key, Number(e.target.value) || 0)}
                  />
                </label>

                <div className={styles.hpBlock}>
                  <span className={styles.fieldLabel}>HP</span>
                  <div className={styles.tokenHpRow}>
                    <button type="button" title="Deal 5 damage" onClick={() => adjustHp(t.key, -5)} disabled={t.maxHp === 0}>
                      &minus;5
                    </button>
                    <button type="button" title="Deal 1 damage" onClick={() => adjustHp(t.key, -1)} disabled={t.maxHp === 0}>
                      &minus;1
                    </button>
                    <input
                      type="number"
                      title="Current HP"
                      className={styles.hpInput}
                      value={t.currentHp}
                      min={0}
                      max={t.maxHp || undefined}
                      onChange={(e) => setHp(t.key, Number(e.target.value) || 0)}
                    />
                    <span className={styles.hpMax}>/ {t.maxHp || '—'}</span>
                    <button type="button" title="Heal 1" onClick={() => adjustHp(t.key, 1)} disabled={t.maxHp === 0}>
                      +1
                    </button>
                    <button type="button" title="Heal 5" onClick={() => adjustHp(t.key, 5)} disabled={t.maxHp === 0}>
                      +5
                    </button>
                  </div>
                  <span className={styles.hpHint}>&minus; damage &middot; + heal</span>
                </div>

                {t.bloodied && (
                  <p className={`${styles.marker} ${bloodiedNow ? styles.markerActive : ''}`}>
                    <strong>Bloodied{bloodiedNow ? ' — now!' : ''}:</strong> {t.bloodied}
                  </p>
                )}
                {t.lastStand && (
                  <p className={`${styles.marker} ${defeated ? styles.markerActive : ''}`}>
                    <strong>Last Stand{defeated ? ' — now!' : ''}:</strong> {t.lastStand}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {previewModal}
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Party</h2>
        <div className={styles.heroList}>
          <div className={styles.heroHeadings}>
            <span>Name</span>
            <span>Level</span>
            <span>HP</span>
            <span />
          </div>
          {heroes.map((hero, i) => (
            <div key={hero.id} className={styles.heroRow}>
              <input
                type="text"
                placeholder={`Hero ${i + 1}`}
                value={hero.name}
                onChange={(e) => updateHero(hero.id, { name: e.target.value })}
              />
              <input
                type="number"
                min={1}
                max={20}
                value={hero.level}
                onChange={(e) => updateHero(hero.id, { level: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
              />
              <input
                type="number"
                min={0}
                value={hero.hp}
                onChange={(e) => updateHero(hero.id, { hp: Math.max(0, Number(e.target.value) || 0) })}
              />
              <button type="button" className={styles.removeButton} onClick={() => removeHero(hero.id)} disabled={heroes.length <= 1}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={styles.ghostButton} onClick={addHero}>
          + Add hero
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Monsters</h2>
        <div className={styles.searchWrap}>
          <label htmlFor={searchId} className={styles.srOnly}>
            Search Nimble monsters
          </label>
          <input
            id={searchId}
            type="text"
            className={styles.searchInput}
            placeholder="Search Nimble monsters by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((m) => (
                <li key={m.id} className={styles.searchResultRow}>
                  <button type="button" className={styles.searchResultInfo} onClick={() => setPreviewMonster(m)} title="View abilities">
                    {m.name} <span className={styles.searchMeta}>{m.ratingLabel ?? '—'}</span>
                  </button>
                  <button type="button" className={styles.quickAddButton} onClick={() => addMonster(m)} title="Add to encounter">
                    + Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {roster.length > 0 && (
          <div className={styles.rosterList}>
            <div className={styles.rosterHeadings}>
              <span>Monster</span>
              <span>Level</span>
              <span>Qty</span>
              <span />
            </div>
            {roster.map((entry) => {
              const monster = monsterById.get(entry.monsterId);
              if (!monster) return null;
              const ownLevel = extractLevelLabel(monster.ratingLabel) ?? '?';
              return (
                <div key={entry.monsterId} className={styles.rosterRow}>
                  <button
                    type="button"
                    className={styles.rosterName}
                    onClick={() => setPreviewMonster(monster)}
                    title="View abilities"
                  >
                    {monster.name}
                  </button>
                  <input
                    type="text"
                    className={styles.levelInput}
                    placeholder={ownLevel}
                    title={`Compendium level: ${ownLevel}. Leave blank to use it, or set a custom level for just this encounter (HP scales the same way the monster's own Rescale tool does).`}
                    value={entry.levelOverride}
                    onChange={(e) => setLevelOverride(entry.monsterId, e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    value={entry.quantity}
                    onChange={(e) => setQuantity(entry.monsterId, Number(e.target.value) || 0)}
                  />
                  <button type="button" className={styles.removeButton} onClick={() => removeMonster(entry.monsterId)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.readout}`}>
        <h2 className={styles.sectionHeading}>Difficulty</h2>
        <div className={styles.readoutRow}>
          <div>
            <span className={styles.readoutLabel}>Party total</span>
            <span className={styles.readoutValue}>{heroTotal}</span>
          </div>
          <div>
            <span className={styles.readoutLabel}>Monster total</span>
            <span className={styles.readoutValue}>{monsterTotal}</span>
          </div>
          <div>
            <span className={styles.readoutLabel}>Rating</span>
            <span className={styles.readoutValue} style={difficulty ? { color: difficultyColor(difficulty) } : undefined}>
              {difficulty ?? '—'}
            </span>
          </div>
          <div>
            <span className={styles.readoutLabel}>Suggested minion die</span>
            <span className={styles.readoutValue}>d{minionDie}</span>
          </div>
        </div>
        <button type="button" className={styles.startButton} onClick={startEncounter} disabled={roster.length === 0}>
          Start encounter
        </button>
      </section>
      {previewModal}
    </div>
  );
}

function difficultyColor(difficulty: ReturnType<typeof assessEncounterDifficulty>): string | undefined {
  switch (difficulty) {
    case 'Easy':
      return 'var(--seal-teal)';
    case 'Medium':
      return 'var(--brass-dim)';
    case 'Hard':
      return 'var(--cat-items)';
    case 'Deadly':
      return 'var(--cat-monsters)';
    case 'Very Deadly':
      return 'var(--seal-crimson)';
    default:
      return undefined;
  }
}
