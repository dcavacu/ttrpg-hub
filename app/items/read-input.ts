import type { ItemInput } from '@/lib/content/items';

function readStats(formData: FormData): Record<string, string> | undefined {
  const keys = formData.getAll('stats_key').map(String);
  const values = formData.getAll('stats_value').map(String);
  const stats: Record<string, string> = {};
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    stats[trimmedKey] = (values[i] ?? '').trim();
  });
  return Object.keys(stats).length > 0 ? stats : undefined;
}

export function readInput(formData: FormData): Partial<ItemInput> {
  const sourceId = String(formData.get('source_id') ?? '');
  const isHomebrew = formData.get('is_homebrew') === 'on';
  return {
    name: String(formData.get('name') ?? '').trim(),
    system_id: String(formData.get('system_id') ?? ''),
    source_id: sourceId,
    is_homebrew: isHomebrew,
    item_type: String(formData.get('item_type') ?? '') || undefined,
    rarity: String(formData.get('rarity') ?? '') || undefined,
    description: String(formData.get('description') ?? ''),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    stats: readStats(formData),
  };
}
