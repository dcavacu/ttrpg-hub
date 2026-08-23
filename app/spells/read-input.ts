import type { SpellInput } from '@/lib/content/spells';

function readStats(formData: FormData): Record<string, string> | undefined {
  const statsPresent = formData.get('stats_present') === '1';
  const keys = formData.getAll('stats_key').map(String);
  const values = formData.getAll('stats_value').map(String);
  const stats: Record<string, string> = {};
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    stats[trimmedKey] = (values[i] ?? '').trim();
  });
  if (Object.keys(stats).length > 0) return stats;
  return statsPresent ? {} : undefined;
}

export function readInput(formData: FormData): Partial<SpellInput> {
  const sourceId = String(formData.get('source_id') ?? '');
  const isHomebrew = formData.get('is_homebrew') === 'on';
  return {
    name: String(formData.get('name') ?? '').trim(),
    system_id: String(formData.get('system_id') ?? ''),
    source_id: sourceId,
    is_homebrew: isHomebrew,
    level: String(formData.get('level') ?? '') || undefined,
    school: String(formData.get('school') ?? '') || undefined,
    mana_cost: (() => {
      const raw = String(formData.get('mana_cost') ?? '').trim();
      if (raw === '') return undefined;
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? undefined : parsed;
    })(),
    description: String(formData.get('description') ?? ''),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    stats: readStats(formData),
  };
}
