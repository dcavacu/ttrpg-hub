import type { Monster, System } from '@/lib/content/types';
import type { SourceOption } from '@/lib/content/sources';
import { StatsEditor } from '../content/StatsEditor';
import styles from './MonsterForm.module.css';

export function MonsterForm({
  action,
  systems,
  sources,
  tags,
  monster,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  sources: SourceOption[];
  tags: string[];
  monster?: Monster;
  error?: string;
}) {
  return (
    <form className={styles.form} action={action}>
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
        Source
        <select id="source_id" name="source_id" defaultValue={monster?.source.id} required>
          <option value="">Choose a source</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.systemName} &middot; {source.name}
            </option>
          ))}
        </select>
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
        <input id="tags" name="tags" defaultValue={monster?.tags.join(', ')} list="tag-suggestions" />
        <datalist id="tag-suggestions">
          {tags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={monster?.description} />
      </label>
      <StatsEditor defaultValue={monster?.stats} />
      <button type="submit">Save</button>
    </form>
  );
}
