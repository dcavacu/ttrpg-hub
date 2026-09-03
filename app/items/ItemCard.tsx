import Link from 'next/link';
import type { Item } from '@/lib/content/types';
import { renderInlineMarkdown } from '@/lib/content/markdown';
import { ShieldIcon } from '../content/icons';
import { FavoriteStar } from '../content/FavoriteStar';
import styles from './ItemCard.module.css';

function systemAccentClass(systemName: string): string {
  if (systemName === 'D&D 5e') return styles.accentDnd;
  if (systemName === 'Nimble') return styles.accentNimble;
  return styles.accentDefault;
}

// Legendary and Very Rare are the tiers worth calling out visually in a
// dense grid -- matches MonsterCard's tierBadge treatment for CR tiers.
// Uses substring checks since the data also has variants like
// "Uncommon (cursed)" that should fall back to the plain rating text.
function isHighRarity(rarity: string): boolean {
  return rarity.includes('Legendary') || rarity.includes('Very Rare');
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <article className={`${styles.card} ${systemAccentClass(item.system.name)}`}>
      <FavoriteStar category="items" id={item.id} />
      <Link href={`/items/${item.id}`} className={styles.cardLink}>
        <div className={styles.head}>
          <span className={styles.name}>{item.name}</span>
          {item.rarity && !isHighRarity(item.rarity) && (
            <span className={styles.rating}>{item.rarity}</span>
          )}
        </div>
        <div className={styles.meta}>
          {[item.system.name, item.item_type].filter(Boolean).join(' · ')}
        </div>
        {item.rarity && isHighRarity(item.rarity) && (
          <div className={styles.badgeRow}>
            <span className={styles.rarityBadge}>
              <ShieldIcon className={styles.badgeIcon} /> {item.rarity}
            </span>
          </div>
        )}
        <span className={item.is_homebrew ? styles.homebrew : styles.official}>
          {item.is_homebrew ? 'Homebrew' : 'Official'}
        </span>
        {item.description && <p className={styles.desc}>{renderInlineMarkdown(item.description)}</p>}
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
