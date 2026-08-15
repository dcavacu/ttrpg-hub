'use client';

import { useRouter } from 'next/navigation';
import type { ContentFilters, System } from '@/lib/content/types';
import styles from './RuleFilters.module.css';

function pushFilters(router: ReturnType<typeof useRouter>, filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  const query = params.toString();
  router.push(query ? `/rules?${query}` : '/rules');
}

export function RuleFilters({ systems, initial }: { systems: System[]; initial: ContentFilters }) {
  const router = useRouter();

  return (
    <div className={styles.filters}>
      <label htmlFor="rule-search">
        Search
        <input
          id="rule-search"
          type="text"
          defaultValue={initial.search ?? ''}
          onChange={(e) => pushFilters(router, { ...initial, search: e.target.value || undefined })}
        />
      </label>
      <label htmlFor="rule-system">
        System
        <select
          id="rule-system"
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
      <label htmlFor="rule-source">
        Source
        <select
          id="rule-source"
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
