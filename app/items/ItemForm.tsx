import type { Item, System } from '@/lib/content/types';
import styles from './ItemForm.module.css';

export function ItemForm({
  action,
  systems,
  item,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
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
        Source id
        <input id="source_id" name="source_id" defaultValue={item?.source.id} required />
      </label>
      <label htmlFor="is_homebrew">
        Homebrew
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={item?.is_homebrew} />
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
        <input id="tags" name="tags" defaultValue={item?.tags.join(', ')} />
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={item?.description} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
