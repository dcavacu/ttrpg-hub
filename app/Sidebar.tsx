'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CategoryCounts, TagCount } from '@/lib/content/sidebar';
import type { ContentFilters } from '@/lib/content/types';
import styles from './Sidebar.module.css';

type Category = 'monsters' | 'items' | 'spells' | 'rules';

export interface FacetGroupOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: keyof ContentFilters;
  label: string;
  color: string;
  options: FacetGroupOption[];
}

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
  if (filters.combatRole) params.set('combatRole', filters.combatRole);
  if (filters.race) params.set('race', filters.race);
  if (filters.tier) params.set('tier', filters.tier);
  if (filters.itemType) params.set('itemType', filters.itemType);
  if (filters.rarity) params.set('rarity', filters.rarity);
  if (filters.school) params.set('school', filters.school);
  if (filters.manaCostBucket) params.set('manaCostBucket', filters.manaCostBucket);
  if (filters.category) params.set('category', filters.category);
  const query = params.toString();
  router.push(query ? `/${category}?${query}` : `/${category}`);
}

export function Sidebar({
  counts,
  tags,
  facets,
  initial,
  category,
}: {
  counts: CategoryCounts;
  tags: TagCount[];
  facets?: FacetGroup[];
  initial: ContentFilters;
  category: Category;
}) {
  const router = useRouter();

  function toggleTag(tag: string, checked: boolean) {
    const current = initial.tags ?? [];
    const next = checked ? [...current, tag] : current.filter((t) => t !== tag);
    pushTagFilters(router, category, { ...initial, tags: next });
  }

  function selectFacetValue(key: keyof ContentFilters, value: string) {
    pushTagFilters(router, category, { ...initial, [key]: value || undefined });
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
      {facets?.map((facet) => (
        <div key={facet.key} className={styles.section}>
          <label className={styles.heading} htmlFor={`facet-${String(facet.key)}`}>
            {facet.label}
          </label>
          <select
            id={`facet-${String(facet.key)}`}
            className={styles.facetSelect}
            style={{ borderColor: facet.color }}
            value={(initial[facet.key] as string | undefined) ?? ''}
            onChange={(e) => selectFacetValue(facet.key, e.target.value)}
          >
            <option value="">All</option>
            {facet.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      ))}
      <details className={styles.section} open>
        <summary className={styles.heading}>Tags</summary>
        <ul className={styles.tagList}>
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <label className={styles.tagLabel}>
                <input
                  type="checkbox"
                  aria-label={tag}
                  checked={initial.tags?.includes(tag) ?? false}
                  onChange={(e) => toggleTag(tag, e.target.checked)}
                />
                {tag} <span className={styles.tagCount}>({count})</span>
              </label>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
