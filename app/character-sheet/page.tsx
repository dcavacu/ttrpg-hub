import styles from './page.module.css';

const CLASSES = [
  { value: 'berserker', label: 'Berserker' },
  { value: 'cheat', label: 'Cheat' },
  { value: 'homebrewer', label: 'Homebrewer' },
  { value: 'mage', label: 'Mage' },
  { value: 'oathsworn', label: 'Oathsworn' },
  { value: 'shaman', label: 'Shaman' },
  { value: 'shepherd', label: 'Shepherd' },
  { value: 'stormshifter', label: 'Stormshifter' },
  { value: 'virtuoso', label: 'Virtuoso' },
];

export default function CharacterSheetPage() {
  return (
    <main className={styles.page}>
      <h1>Character Sheets</h1>
      <p className={styles.lede}>
        Pick a class, drop in a portrait, and choose an accent color. You&apos;ll get a real fillable PDF back —
        every stat, skill, and note field stays open for you to fill in afterward in your PDF reader.
      </p>
      <form className={styles.form} action="/api/character-sheet" method="post" encType="multipart/form-data">
        <label htmlFor="class">
          Class
          <select id="class" name="class" defaultValue="berserker" required>
            {CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="portrait">
          Portrait (PNG, JPG, or WebP)
          <input id="portrait" name="portrait" type="file" accept="image/png,image/jpeg,image/webp" />
        </label>
        <label htmlFor="color">
          Accent color
          <input id="color" name="color" type="color" defaultValue="#8a2e2e" />
        </label>
        <button type="submit">Generate PDF</button>
      </form>
    </main>
  );
}
