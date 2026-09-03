'use client';

import { useFavorites, type FavoriteCategory } from './useFavorites';
import { StarIcon } from './icons';
import styles from './FavoriteStar.module.css';

export function FavoriteStar({ category, id, className }: { category: FavoriteCategory; id: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites(category);
  const favorited = isFavorite(id);

  return (
    <button
      type="button"
      className={`${styles.star} ${favorited ? styles.starActive : ''} ${className ?? ''}`}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <StarIcon filled={favorited} className={styles.icon} />
    </button>
  );
}
