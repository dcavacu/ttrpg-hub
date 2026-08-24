import Link from 'next/link';
import type { Rule } from '@/lib/content/types';
import styles from './RuleCard.module.css';

function systemAccentClass(systemName: string): string {
  if (systemName === 'D&D 5e') return styles.accentDnd;
  if (systemName === 'Nimble') return styles.accentNimble;
  return styles.accentDefault;
}

export function RuleCard({ rule }: { rule: Rule }) {
  return (
    <article className={`${styles.card} ${systemAccentClass(rule.system.name)}`}>
      <Link href={`/rules/${rule.id}`} className={styles.cardLink}>
        <div className={styles.head}>
          <span className={styles.name}>{rule.name}</span>
          {rule.category && <span className={styles.rating}>{rule.category}</span>}
        </div>
        <div className={styles.meta}>{rule.system.name}</div>
        <span className={rule.is_homebrew ? styles.homebrew : styles.official}>
          {rule.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        {rule.description && <p className={styles.desc}>{rule.description}</p>}
      </Link>
      <ul className={styles.tags}>
        {rule.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/rules?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
