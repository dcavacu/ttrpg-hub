import styles from './page.module.css';

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>The Compendium</h1>
      <p>
        <a href="/monsters">Browse monsters</a>
      </p>
    </main>
  );
}
