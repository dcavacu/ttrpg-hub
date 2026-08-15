import Link from 'next/link';
import type { Rule } from '@/lib/content/types';
import styles from './RuleCard.module.css';

export function RuleCard({ rule }: { rule: Rule }) {
  return (
    <Link href={`/rules/${rule.id}`}>
      <article className={styles.card}>
        <div className={styles.head}>
          <span className={styles.name}>{rule.name}</span>
          {rule.category && <span className={styles.rating}>{rule.category}</span>}
        </div>
        <div className={styles.meta}>{rule.system.name} &middot; {rule.source.name}</div>
        <span className={rule.is_homebrew ? styles.homebrew : styles.official}>
          {rule.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        <ul className={styles.tags}>
          {rule.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
