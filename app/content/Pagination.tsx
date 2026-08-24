import Link from 'next/link';
import styles from './Pagination.module.css';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={styles.navLink}>
          &larr; Previous
        </Link>
      ) : (
        <span className={styles.navDisabled}>&larr; Previous</span>
      )}
      <span className={styles.pageStatus}>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={styles.navLink}>
          Next &rarr;
        </Link>
      ) : (
        <span className={styles.navDisabled}>Next &rarr;</span>
      )}
    </nav>
  );
}
