import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1>This page isn&apos;t on the shelf</h1>
      <p>Whatever you were looking for isn&apos;t here — it may have been moved or never existed.</p>
      <Link href="/monsters">Back to the compendium</Link>
    </main>
  );
}
