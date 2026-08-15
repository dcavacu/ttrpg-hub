import type { Rule, System } from '@/lib/content/types';
import styles from './RuleForm.module.css';

export function RuleForm({
  action,
  systems,
  rule,
  error,
}: {
  action: (formData: FormData) => void;
  systems: System[];
  rule?: Rule;
  error?: string;
}) {
  return (
    <form className={styles.form} action={action}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="name">
        Name
        <input id="name" name="name" defaultValue={rule?.name} required />
      </label>
      <label htmlFor="system_id">
        System
        <select id="system_id" name="system_id" defaultValue={rule?.system.id} required>
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
        <input id="source_id" name="source_id" defaultValue={rule?.source.id} required />
      </label>
      <label htmlFor="is_homebrew">
        Homebrew
        <input id="is_homebrew" name="is_homebrew" type="checkbox" defaultChecked={rule?.is_homebrew} />
      </label>
      <label htmlFor="category">
        Category
        <input id="category" name="category" defaultValue={rule?.category ?? ''} />
      </label>
      <label htmlFor="tags">
        Tags (comma separated)
        <input id="tags" name="tags" defaultValue={rule?.tags.join(', ')} />
      </label>
      <label htmlFor="description">
        Description
        <textarea id="description" name="description" defaultValue={rule?.description} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
