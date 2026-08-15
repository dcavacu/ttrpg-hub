'use client';

import { useRouter } from 'next/navigation';
import type { ContentFilters, System } from '@/lib/content/types';
import styles from './SpellFilters.module.css';

function pushFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  const query = params.toString();
  router.push(query ? `/spells?${query}` : '/spells');
}

export function SpellFilters({ systems, initial }: { systems: System[]; initial: ContentFilters }) {
  const router = useRouter();

  return (
    <div className={styles.filters}>
      <label htmlFor="spell-search">
        Search
        <input
          id="spell-search"
          type="text"
          defaultValue={initial.search ?? ''}
          onChange={(e) => pushFilters(router, { ...initial, search: e.target.value || undefined })}
        />
      </label>
      <label htmlFor="spell-system">
        System
        <select
          id="spell-system"
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
      <label htmlFor="spell-source">
        Source
        <select
          id="spell-source"
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
