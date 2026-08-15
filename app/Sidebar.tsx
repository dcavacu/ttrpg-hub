'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CategoryCounts } from '@/lib/content/sidebar';
import type { ContentFilters } from '@/lib/content/types';
import styles from './Sidebar.module.css';

function pushTagFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  const query = params.toString();
  router.push(query ? `/monsters?${query}` : '/monsters');
}

export function Sidebar({ counts, tags, initial }: { counts: CategoryCounts; tags: string[]; initial: ContentFilters }) {
  const router = useRouter();

  function toggleTag(tag: string, checked: boolean) {
    const current = initial.tags ?? [];
    const next = checked ? [...current, tag] : current.filter((t) => t !== tag);
    pushTagFilters(router, { ...initial, tags: next });
  }

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h2 className={styles.heading}>Categories</h2>
        <ul className={styles.categoryList}>
          <li>
            <Link href="/monsters" className={styles.categoryLink}>
              Monsters <span className={styles.count}>({counts.monsters})</span>
            </Link>
          </li>
          <li className={styles.categoryPending}>
            Items <span className={styles.count}>({counts.items})</span> <span className={styles.soon}>soon</span>
          </li>
          <li className={styles.categoryPending}>
            Spells <span className={styles.count}>({counts.spells})</span> <span className={styles.soon}>soon</span>
          </li>
          <li className={styles.categoryPending}>
            Rules <span className={styles.count}>({counts.rules})</span> <span className={styles.soon}>soon</span>
          </li>
        </ul>
      </section>
      <section className={styles.section}>
        <h2 className={styles.heading}>Tags</h2>
        <ul className={styles.tagList}>
          {tags.map((tag) => (
            <li key={tag}>
              <label className={styles.tagLabel}>
                <input
                  type="checkbox"
                  checked={initial.tags?.includes(tag) ?? false}
                  onChange={(e) => toggleTag(tag, e.target.checked)}
                />
                {tag}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
