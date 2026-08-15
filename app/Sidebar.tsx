'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CategoryCounts } from '@/lib/content/sidebar';
import type { ContentFilters } from '@/lib/content/types';
import styles from './Sidebar.module.css';

type Category = 'monsters' | 'items' | 'spells' | 'rules';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'monsters', label: 'Monsters' },
  { key: 'items', label: 'Items' },
  { key: 'spells', label: 'Spells' },
  { key: 'rules', label: 'Rules' },
];

function pushTagFilters(router: ReturnType<typeof useRouter>, category: Category, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  const query = params.toString();
  router.push(query ? `/${category}?${query}` : `/${category}`);
}

export function Sidebar({
  counts,
  tags,
  initial,
  category,
}: {
  counts: CategoryCounts;
  tags: string[];
  initial: ContentFilters;
  category: Category;
}) {
  const router = useRouter();

  function toggleTag(tag: string, checked: boolean) {
    const current = initial.tags ?? [];
    const next = checked ? [...current, tag] : current.filter((t) => t !== tag);
    pushTagFilters(router, category, { ...initial, tags: next });
  }

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h2 className={styles.heading}>Categories</h2>
        <ul className={styles.categoryList}>
          {CATEGORIES.map(({ key, label }) => (
            <li key={key}>
              <Link
                href={`/${key}`}
                className={key === category ? `${styles.categoryLink} ${styles.categoryActive}` : styles.categoryLink}
              >
                {label} <span className={styles.count}>({counts[key]})</span>
              </Link>
            </li>
          ))}
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
