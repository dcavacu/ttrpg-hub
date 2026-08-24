import { login } from './actions';
import { SealIcon } from '../content/icons';
import styles from './page.module.css';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.seal}>
          <SealIcon className={styles.sealIcon} />
        </div>
        <h1>Enter the Compendium</h1>
        <p className={styles.sub}>By invitation only</p>
        <form className={styles.form} action={login}>
          <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/'} />
          <label>
            Username
            <input type="text" name="username" required autoFocus autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {searchParams.error && <p role="alert">That username or password isn&apos;t right. Try again.</p>}
          <button type="submit">Enter</button>
        </form>
      </div>
    </main>
  );
}
