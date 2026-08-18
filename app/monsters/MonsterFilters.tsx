'use client';

import { useRouter } from 'next/navigation';
import type { ContentFilters, System } from '@/lib/content/types';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import styles from './MonsterFilters.module.css';

function pushFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  const query = params.toString();
  router.push(query ? `/monsters?${query}` : '/monsters');
}

export function MonsterFilters({ systems, initial }: { systems: System[]; initial: ContentFilters }) {
  const router = useRouter();
  const debouncedSearch = useDebouncedCallback(
    (value: string) => pushFilters(router, { ...initial, search: value || undefined }),
    250,
  );

  return (
    <div className={styles.filters}>
      <label htmlFor="monster-search">
        Search
        <input
          id="monster-search"
          type="text"
          defaultValue={initial.search ?? ''}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </label>
      <label htmlFor="monster-system">
        System
        <select
          id="monster-system"
          defaultValue={initial.systemId ?? ''}
          onChange={(e) => pushFilters(router, { ...initial, systemId: e.target.value || undefined })}
        >
          <option value="">All</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="monster-source">
        Source
        <select
          id="monster-source"
          defaultValue={initial.sourceType ?? ''}
          onChange={(e) =>
            pushFilters(router, {
              ...initial,
              sourceType: (e.target.value || undefined) as ContentFilters['sourceType'],
            })
          }
        >
          <option value="">All</option>
          <option value="official">Official</option>
          <option value="homebrew">Homebrew</option>
        </select>
      </label>
    </div>
  );
}
