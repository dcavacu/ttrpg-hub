import Link from 'next/link';
import type { Item } from '@/lib/content/types';
import styles from './ItemCard.module.css';

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`}>
      <article className={styles.card}>
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
        <ul className={styles.tags}>
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
