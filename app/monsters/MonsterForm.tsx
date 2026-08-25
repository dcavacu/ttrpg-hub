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
      <label htmlFor="is_homebrew" className={styles.checkboxLabel}>
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={monster?.is_homebrew} />
        Homebrew
      </label>
      <label htmlFor="rating_label">
        Rating label
        <input id="rating_label" name="rating_label" defaultValue={monster?.rating_label ?? ''} />
      </label>
      <label htmlFor="combat_role">
        Combat role
        <select id="combat_role" name="combat_role" defaultValue={monster?.combat_role ?? ''}>
          <option value="">Not set</option>
          <option value="Melee">Melee</option>
          <option value="Ranged">Ranged</option>
        </select>
      </label>
      <label htmlFor="race">
        Race
        <select id="race" name="race" defaultValue={monster?.race ?? ''}>
          <option value="">Not set</option>
          <option value="Aberration">Aberration</option>
          <option value="Beast">Beast</option>
          <option value="Celestial">Celestial</option>
          <option value="Construct">Construct</option>
          <option value="Dragon">Dragon</option>
          <option value="Elemental">Elemental</option>
          <option value="Fey">Fey</option>
          <option value="Fiend">Fiend</option>
          <option value="Giant">Giant</option>
          <option value="Giant Bug">Giant Bug</option>
          <option value="Humanoid">Humanoid</option>
          <option value="Monstrosity">Monstrosity</option>
          <option value="Ooze">Ooze</option>
          <option value="Plant">Plant</option>
          <option value="Undead">Undead</option>
        </select>
      </label>
      <label htmlFor="tier">
        Tier
        <select id="tier" name="tier" defaultValue={monster?.tier ?? 'Normal'}>
          <option value="Normal">Normal</option>
          <option value="Legendary">Legendary</option>
          <option value="Minion">Minion</option>
        </select>
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
