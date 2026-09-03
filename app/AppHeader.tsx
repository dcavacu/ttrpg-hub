import Link from 'next/link';
import { logout } from './login/actions';
import { BookIcon, StarIcon } from './content/icons';
import styles from './AppHeader.module.css';

export function AppHeader({ isGm }: { isGm: boolean }) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <BookIcon className={styles.brandMark} />
        The Compendium
      </Link>
      <div className={styles.right}>
        <Link href="/favorites" className={styles.favoritesLink}>
          <StarIcon className={styles.favoritesIcon} /> Favorites
        </Link>
        {isGm && (
          <Link href="/encounter-builder" className={styles.gmLink}>
            GM Tools
          </Link>
        )}
        <form action={logout}>
          <button type="submit" className={styles.logoutButton}>
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
