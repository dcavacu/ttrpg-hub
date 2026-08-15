import type { SpellInput } from '@/lib/content/spells';

export function readInput(formData: FormData): Partial<SpellInput> {
  const sourceId = String(formData.get('source_id') ?? '');
  const isHomebrew = formData.get('is_homebrew') === 'on';
  return {
    name: String(formData.get('name') ?? '').trim(),
    system_id: String(formData.get('system_id') ?? ''),
    source_id: sourceId,
    is_homebrew: isHomebrew,
    level: String(formData.get('level') ?? '') || undefined,
    description: String(formData.get('description') ?? ''),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };
}
