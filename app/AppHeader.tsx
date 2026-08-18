import Link from 'next/link';
import { logout } from './login/actions';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/monsters" className={styles.brand}>
        The Compendium
      </Link>
      <form action={logout}>
        <button type="submit" className={styles.logoutButton}>
          Log out
        </button>
      </form>
    </header>
  );
}
