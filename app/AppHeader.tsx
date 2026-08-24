import Link from 'next/link';
import { logout } from './login/actions';
import { BookIcon } from './content/icons';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <BookIcon className={styles.brandMark} />
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
