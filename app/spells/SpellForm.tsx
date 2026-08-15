import type { Spell, System } from '@/lib/content/types';
import styles from './SpellForm.module.css';

export function SpellForm({
  action,
  systems,
  spell,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  spell?: Spell;
  error?: string;
}) {
  return (
    <form className={styles.form} action={action}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="name">
        Name
        <input id="name" name="name" defaultValue={spell?.name} required />
      </label>
      <label htmlFor="system_id">
        System
        <select id="system_id" name="system_id" defaultValue={spell?.system.id} required>
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
        <input id="source_id" name="source_id" defaultValue={spell?.source.id} required />
      </label>
      <label htmlFor="is_homebrew">
        Homebrew
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={spell?.is_homebrew} />
      </label>
      <label htmlFor="level">
        Level
        <input id="level" name="level" defaultValue={spell?.level ?? ''} />
      </label>
      <label htmlFor="tags">
        Tags (comma separated)
        <input id="tags" name="tags" defaultValue={spell?.tags.join(', ')} />
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={spell?.description} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
