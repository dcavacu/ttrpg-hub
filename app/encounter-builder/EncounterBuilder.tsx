'use client';

import { useEffect, useMemo, useState } from 'react';
import { levelLabelToNumber, extractLevelLabel } from '@/lib/content/monsterScaling';
import {
  assessEncounterDifficulty,
  suggestMinionDieSize,
  extractDescriptionMarker,
  type EncounterDifficulty,
} from '@/lib/content/encounterBalance';
import type { LeanMonster } from '@/lib/content/monsters';
import styles from './EncounterBuilder.module.css';

interface RosterEntry {
  monsterId: string;
  quantity: number;
}

interface CombatToken {
  key: string;
  name: string;
  maxHp: number;
  currentHp: number;
  bloodied: string | null;
  lastStand: string | null;
}

const STORAGE_KEY = 'ttrpg-hub-encounter-builder-v1';

export function EncounterBuilder({ monsters }: { monsters: LeanMonster[] }) {
  const [heroLevels, setHeroLevels] = useState<number[]>([1, 1, 1, 1]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tokens, setTokens] = useState<CombatToken[] | null>(null);
  const [restored, setRestored] = useState(false);

  const monsterById = useMemo(() => new Map(monsters.map((m) => [m.id, m])), [monsters]);

  // Restore whatever the GM had set up last time, so an accidental
  // refresh mid-session doesn't lose the encounter. Deliberately local to
  // this browser only (see artifact-capabilities guidance elsewhere in
  // this app for when shared state would need the DB instead -- this
  // tool's state is genuinely per-GM-device scratch work, not something
  // players or other sessions need to see).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { heroLevels?: number[]; roster?: RosterEntry[]; tokens?: CombatToken[] | null };
        if (Array.isArray(saved.heroLevels)) setHeroLevels(saved.heroLevels);
        if (Array.isArray(saved.roster)) setRoster(saved.roster);
        if (saved.tokens !== undefined) setTokens(saved.tokens);
      }
    } catch {
      // Storage unavailable or corrupt -- start fresh, silently.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return; // don't clobber saved state with initial defaults before restore runs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ heroLevels, roster, tokens }));
    } catch {
      // Storage full or unavailable -- the tool still works, it just won't survive a refresh.
    }
  }, [heroLevels, roster, tokens, restored]);

  const heroTotal = heroLevels.reduce((a, b) => a + b, 0);
  const partyAvgLevel = heroLevels.length ? Math.round(heroTotal / heroLevels.length) : 1;
  const monsterTotal = roster.reduce((sum, entry) => {
    const monster = monsterById.get(entry.monsterId);
    if (!monster) return sum;
    return sum + levelLabelToNumber(extractLevelLabel(monster.ratingLabel)) * entry.quantity;
  }, 0);
  const difficulty = assessEncounterDifficulty(monsterTotal, heroTotal);
  const minionDie = suggestMinionDieSize(partyAvgLevel);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return monsters.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [search, monsters]);

  function addHero() {
    setHeroLevels((prev) => [...prev, prev[prev.length - 1] ?? 1]);
  }
  function removeHero(index: number) {
    setHeroLevels((prev) => prev.filter((_, i) => i !== index));
  }
  function setHeroLevel(index: number, level: number) {
    setHeroLevels((prev) => prev.map((l, i) => (i === index ? level : l)));
  }

  function addMonster(monster: LeanMonster) {
    setRoster((prev) => {
      const existing = prev.find((r) => r.monsterId === monster.id);
      if (existing) return prev.map((r) => (r.monsterId === monster.id ? { ...r, quantity: r.quantity + 1 } : r));
      return [...prev, { monsterId: monster.id, quantity: 1 }];
    });
    setSearch('');
  }
  function setQuantity(monsterId: string, quantity: number) {
    setRoster((prev) => prev.flatMap((r) => (r.monsterId === monsterId ? (quantity <= 0 ? [] : [{ ...r, quantity }]) : [r])));
  }
  function removeMonster(monsterId: string) {
    setRoster((prev) => prev.filter((r) => r.monsterId !== monsterId));
  }

  function startEncounter() {
    const newTokens: CombatToken[] = [];
    for (const entry of roster) {
      const monster = monsterById.get(entry.monsterId);
      if (!monster) continue;
      const maxHp = Number(monster.hp) || 0;
      const bloodied = extractDescriptionMarker(monster.description, 'BLOODIED');
      const lastStand = extractDescriptionMarker(monster.description, 'LAST STAND');
      for (let i = 1; i <= entry.quantity; i++) {
        newTokens.push({
          key: `${entry.monsterId}-${i}`,
          name: entry.quantity > 1 ? `${monster.name} #${i}` : monster.name,
          maxHp,
          currentHp: maxHp,
          bloodied,
          lastStand,
        });
      }
    }
    setTokens(newTokens);
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

  if (tokens) {
    return (
      <div className={styles.tracker}>
        <div className={styles.trackerHeader}>
          <h2 className={styles.trackerHeading}>Combat Tracker</h2>
          <button type="button" className={styles.ghostButton} onClick={endEncounter}>
            Back to builder
          </button>
        </div>
        <ul className={styles.tokenList}>
          {tokens.map((t) => {
            const defeated = t.maxHp > 0 && t.currentHp <= 0;
            const bloodiedNow = t.bloodied && t.maxHp > 0 && t.currentHp <= t.maxHp / 2;
            return (
              <li key={t.key} className={`${styles.token} ${defeated ? styles.tokenDefeated : ''}`}>
                <div className={styles.tokenTop}>
                  <span className={styles.tokenName}>{t.name}</span>
                  {defeated && <span className={styles.tokenDefeatedLabel}>Defeated</span>}
                </div>
                <div className={styles.tokenHpRow}>
                  <button type="button" onClick={() => adjustHp(t.key, -5)} disabled={t.maxHp === 0}>
                    -5
                  </button>
                  <button type="button" onClick={() => adjustHp(t.key, -1)} disabled={t.maxHp === 0}>
                    -1
                  </button>
                  <input
                    type="number"
                    className={styles.hpInput}
                    value={t.currentHp}
                    min={0}
                    max={t.maxHp || undefined}
                    onChange={(e) => setHp(t.key, Number(e.target.value) || 0)}
                  />
                  <span className={styles.hpMax}>/ {t.maxHp || '—'}</span>
                  <button type="button" onClick={() => adjustHp(t.key, 1)} disabled={t.maxHp === 0}>
                    +1
                  </button>
                  <button type="button" onClick={() => adjustHp(t.key, 5)} disabled={t.maxHp === 0}>
                    +5
                  </button>
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
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Party</h2>
        <ul className={styles.heroList}>
          {heroLevels.map((level, i) => (
            <li key={i} className={styles.heroRow}>
              <span>Hero {i + 1}</span>
              <input
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setHeroLevel(i, Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
              <button type="button" className={styles.removeButton} onClick={() => removeHero(i)} disabled={heroLevels.length <= 1}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.ghostButton} onClick={addHero}>
          + Add hero
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Monsters</h2>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search Nimble monsters by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => addMonster(m)}>
                    {m.name} <span className={styles.searchMeta}>{m.ratingLabel ?? '—'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {roster.length > 0 && (
          <ul className={styles.rosterList}>
            {roster.map((entry) => {
              const monster = monsterById.get(entry.monsterId);
              if (!monster) return null;
              return (
                <li key={entry.monsterId} className={styles.rosterRow}>
                  <span className={styles.rosterName}>{monster.name}</span>
                  <span className={styles.rosterMeta}>{monster.ratingLabel ?? '—'}</span>
                  <input
                    type="number"
                    min={1}
                    value={entry.quantity}
                    onChange={(e) => setQuantity(entry.monsterId, Number(e.target.value) || 0)}
                  />
                  <button type="button" className={styles.removeButton} onClick={() => removeMonster(entry.monsterId)}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
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
            <span
              className={styles.readoutValue}
              style={difficulty ? { color: difficultyColor(difficulty) } : undefined}
            >
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
    </div>
  );
}

function difficultyColor(difficulty: EncounterDifficulty): string {
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
  }
}
