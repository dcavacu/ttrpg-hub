import Link from 'next/link';
import type { Monster } from '@/lib/content/types';
import styles from './MonsterCard.module.css';

export function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <Link href={`/monsters/${monster.id}`}>
      <article className={styles.card}>
        <div className={styles.head}>
          <span className={styles.name}>{monster.name}</span>
          {monster.rating_label && <span className={styles.rating}>{monster.rating_label}</span>}
        </div>
        <div className={styles.meta}>{monster.system.name} &middot; {monster.source.name}</div>
        <span className={monster.is_homebrew ? styles.homebrew : styles.official}>
          {monster.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        <ul className={styles.tags}>
          {monster.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
