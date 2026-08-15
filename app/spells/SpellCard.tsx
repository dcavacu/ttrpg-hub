import Link from 'next/link';
import type { Spell } from '@/lib/content/types';
import styles from './SpellCard.module.css';

export function SpellCard({ spell }: { spell: Spell }) {
  return (
    <Link href={`/spells/${spell.id}`}>
      <article className={styles.card}>
        <div className={styles.head}>
          <span className={styles.name}>{spell.name}</span>
          {spell.level && <span className={styles.rating}>{spell.level}</span>}
        </div>
        <div className={styles.meta}>{spell.system.name} &middot; {spell.source.name}</div>
        <span className={spell.is_homebrew ? styles.homebrew : styles.official}>
          {spell.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        <ul className={styles.tags}>
          {spell.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
