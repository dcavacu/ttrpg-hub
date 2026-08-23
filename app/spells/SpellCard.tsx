import Link from 'next/link';
import type { Spell } from '@/lib/content/types';
import { DropletIcon } from '../content/icons';
import styles from './SpellCard.module.css';

function systemAccentClass(systemName: string): string {
  if (systemName === 'D&D 5e') return styles.accentDnd;
  if (systemName === 'Nimble') return styles.accentNimble;
  return styles.accentDefault;
}

export function SpellCard({ spell }: { spell: Spell }) {
  return (
    <article className={`${styles.card} ${systemAccentClass(spell.system.name)}`}>
      <Link href={`/spells/${spell.id}`} className={styles.cardLink}>
        <div className={styles.head}>
          <span className={styles.name}>{spell.name}</span>
          {spell.level && <span className={styles.rating}>{spell.level}</span>}
        </div>
        <div className={styles.meta}>{spell.system.name} &middot; {spell.source.name}</div>
        {(spell.school || spell.mana_cost !== null) && (
          <div className={styles.badgeRow}>
            {spell.school && <span className={styles.schoolChip}>{spell.school}</span>}
            {spell.mana_cost !== null && (
              <span className={styles.manaBadge} data-testid="mana-cost-badge">
                <DropletIcon className={styles.badgeIcon} /> {spell.mana_cost}
              </span>
            )}
          </div>
        )}
        <span className={spell.is_homebrew ? styles.homebrew : styles.official}>
          {spell.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        {spell.description && <p className={styles.desc}>{spell.description}</p>}
      </Link>
      <ul className={styles.tags}>
        {spell.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/spells?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
