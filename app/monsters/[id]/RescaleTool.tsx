'use client';

import { useMemo, useState } from 'react';
import { rescaleMonsterAction } from '../actions';
import {
  NORMAL_MONSTER_TABLE,
  LEGENDARY_MONSTER_TABLE,
  extractLevelLabel,
  previewRescale,
} from '@/lib/content/monsterScaling';
import type { MonsterTier } from '@/lib/content/types';
import styles from './RescaleTool.module.css';

export function RescaleTool({
  id,
  tier,
  armor,
  hp,
  ratingLabel,
  description,
}: {
  id: string;
  tier: MonsterTier;
  armor: string | null | undefined;
  hp: string | null | undefined;
  ratingLabel: string | null;
  description: string;
}) {
  const levelOptions = useMemo(
    () => (tier === 'Legendary' ? LEGENDARY_MONSTER_TABLE : NORMAL_MONSTER_TABLE).map((r) => r.levelLabel),
    [tier],
  );
  const currentLevel = extractLevelLabel(ratingLabel);
  const [targetLevel, setTargetLevel] = useState(currentLevel ?? levelOptions[Math.floor(levelOptions.length / 2)]);
  const boundAction = rescaleMonsterAction.bind(null, id);

  const preview = useMemo(
    () => previewRescale(tier, armor, ratingLabel, targetLevel, hp, description),
    [tier, armor, ratingLabel, targetLevel, hp, description],
  );

  if (tier === 'Minion') return null;

  const isLegendary = tier === 'Legendary';
  const hpChanged = preview && hp !== String(preview.hp);

  return (
    <details className={styles.tool}>
      <summary className={styles.toggle}>Rescale to a different level</summary>
      <div className={styles.body}>
        <p className={styles.lede}>
          Scales HP and the damage dice in the description{isLegendary ? ' (and Armor)' : ''} to the target level, in
          proportion to the Game Master Guide&apos;s {isLegendary ? 'Legendary Monster' : 'Monster'} Builder table
          rather than resetting them to the table&apos;s flat values — if this monster has half the table&apos;s HP
          or damage now, it keeps half at the new level.
        </p>
        <label className={styles.levelLabel} htmlFor="rescale-target-level">
          Target level{currentLevel ? ` (currently ${currentLevel})` : ''}
          <select
            id="rescale-target-level"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
          >
            {levelOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {preview && !preview.hpScaled && (
          <p className={styles.fallbackNote}>
            Couldn&apos;t read a current level or HP to scale from, so HP below is the table&apos;s flat value for
            level {targetLevel} rather than scaled from this monster&apos;s own stats.
          </p>
        )}

        {preview && (
          <table className={styles.previewTable}>
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Now</th>
                <th scope="col">At level {targetLevel}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">HP</th>
                <td>{hp || '—'}</td>
                <td className={hpChanged ? styles.changed : undefined}>{preview.hp}</td>
              </tr>
              <tr>
                <th scope="row">Armor</th>
                <td>{armor || 'None'}</td>
                <td>{preview.armor}</td>
              </tr>
              <tr>
                <th scope="row">Save DC</th>
                <td colSpan={2}>{preview.saveDC}</td>
              </tr>
              {isLegendary ? (
                <tr>
                  <th scope="row">Last Stand HP</th>
                  <td colSpan={2}>{preview.hpLastStand}</td>
                </tr>
              ) : (
                <tr>
                  <th scope="row">CR equivalent</th>
                  <td colSpan={2}>{preview.crEquiv}</td>
                </tr>
              )}
              {(preview.damageChanges ?? []).map((change, i) => (
                <tr key={i}>
                  <th scope="row">{i === 0 ? 'Damage' : ''}</th>
                  <td>{change.from}</td>
                  <td className={styles.changed}>{change.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={boundAction}>
          <input type="hidden" name="targetLevel" value={targetLevel} />
          <button type="submit" disabled={!preview}>
            Apply: set HP and damage{isLegendary ? '/Armor' : ''} for level {targetLevel}
          </button>
        </form>
      </div>
    </details>
  );
}
