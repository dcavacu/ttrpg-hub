import type { Monster, System } from '@/lib/content/types';

export function MonsterForm({
  action,
  systems,
  monster,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  monster?: Monster;
  error?: string;
}) {
  return (
    <form action={action}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="name">
        Name
        <input id="name" name="name" defaultValue={monster?.name} required />
      </label>
      <label htmlFor="system_id">
        System
        <select id="system_id" name="system_id" defaultValue={monster?.system.id} required>
          <option value="">Choose a system</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="source_id">
        Source id
        <input id="source_id" name="source_id" defaultValue={monster?.source.id} required />
      </label>
      <label htmlFor="is_homebrew">
        Homebrew
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={monster?.is_homebrew} />
      </label>
      <label htmlFor="rating_label">
        Rating label
        <input id="rating_label" name="rating_label" defaultValue={monster?.rating_label ?? ''} />
      </label>
      <label htmlFor="tags">
        Tags (comma separated)
        <input id="tags" name="tags" defaultValue={monster?.tags.join(', ')} />
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={monster?.description} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
