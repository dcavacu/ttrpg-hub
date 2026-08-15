import { login } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  return (
    <main>
      <h1>Enter the compendium</h1>
      <form action={login}>
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
