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
