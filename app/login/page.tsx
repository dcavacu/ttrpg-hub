import { login } from './actions';
import styles from './page.module.css';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  return (
    <main className={styles.page}>
      <h1>Enter the compendium</h1>
      <form className={styles.form} action={login}>
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/monsters'} />
        <label>
          Password
          <input type="password" name="password" required autoFocus />
        </label>
        {searchParams.error && <p role="alert">That password isn&apos;t right. Try again.</p>}
        <button type="submit">Enter</button>
      </form>
    </main>
  );
}
