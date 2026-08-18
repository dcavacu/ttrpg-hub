'use client';

import { Children, useState } from 'react';
import styles from './RevealGrid.module.css';

export function RevealGrid({
  children,
  gridClassName,
  pageSize = 60,
}: {
  children: React.ReactNode;
  gridClassName: string;
  pageSize?: number;
}) {
  const items = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, items.length));
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  return (
    <>
      <div className={gridClassName}>{visible}</div>
      {remaining > 0 && (
        <button
          type="button"
          className={styles.showMore}
          onClick={() => setVisibleCount((count) => Math.min(count + pageSize, items.length))}
        >
          Show {Math.min(pageSize, remaining)} more ({remaining} left)
        </button>
      )}
    </>
  );
}
