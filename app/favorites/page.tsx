import { FavoritesClient } from './FavoritesClient';
import styles from './page.module.css';

export default function FavoritesPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Favorites</h1>
      <p className={styles.lede}>
        Starred on this device only — click the star on any card to add or remove it.
      </p>
      <FavoritesClient />
    </main>
  );
}
