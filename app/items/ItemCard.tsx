import Link from 'next/link';
import type { Item } from '@/lib/content/types';
import styles from './ItemCard.module.css';

function systemAccentClass(systemName: string): string {
  if (systemName === 'D&D 5e') return styles.accentDnd;
  if (systemName === 'Nimble') return styles.accentNimble;
  return styles.accentDefault;
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <article className={`${styles.card} ${systemAccentClass(item.system.name)}`}>
      <Link href={`/items/${item.id}`} className={styles.cardLink}>
        <div className={styles.head}>
          <span className={styles.name}>{item.name}</span>
          {item.rarity && <span className={styles.rating}>{item.rarity}</span>}
        </div>
        <div className={styles.meta}>
          {[item.system.name, item.item_type, item.source.name].filter(Boolean).join(' · ')}
        </div>
        <span className={item.is_homebrew ? styles.homebrew : styles.official}>
          {item.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        {item.description && <p className={styles.desc}>{item.description}</p>}
      </Link>
      <ul className={styles.tags}>
        {item.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/items?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
