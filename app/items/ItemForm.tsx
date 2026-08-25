import type { Item, System } from '@/lib/content/types';
import type { SourceOption } from '@/lib/content/sources';
import { StatsEditor } from '../content/StatsEditor';
import styles from './ItemForm.module.css';

export function ItemForm({
  action,
  systems,
  sources,
  tags,
  item,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  sources: SourceOption[];
  tags: string[];
  item?: Item;
  error?: string;
}) {
  return (
    <form className={styles.form} action={action}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="name">
        Name
        <input id="name" name="name" defaultValue={item?.name} required />
      </label>
      <label htmlFor="system_id">
        System
        <select id="system_id" name="system_id" defaultValue={item?.system.id} required>
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
        <select id="source_id" name="source_id" defaultValue={item?.source.id} required>
          <option value="">Choose a source</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.systemName} &middot; {source.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="is_homebrew" className={styles.checkboxLabel}>
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={item?.is_homebrew} />
        Homebrew
      </label>
      <label htmlFor="item_type">
        Item type
        <input id="item_type" name="item_type" defaultValue={item?.item_type ?? ''} />
      </label>
      <label htmlFor="rarity">
        Rarity
        <input id="rarity" name="rarity" defaultValue={item?.rarity ?? ''} />
      </label>
      <label htmlFor="tags">
        Tags (comma separated)
        <input id="tags" name="tags" defaultValue={item?.tags.join(', ')} list="tag-suggestions" />
        <datalist id="tag-suggestions">
          {tags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={item?.description} />
      </label>
      <StatsEditor defaultValue={item?.stats} />
      <button type="submit">Save</button>
    </form>
  );
}
