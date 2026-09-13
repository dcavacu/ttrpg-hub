'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PersonIcon } from '../content/icons';
import styles from './page.module.css';

const CLASSES = [
  { value: 'artificer', label: 'Artificer' },
  { value: 'berserker', label: 'Berserker' },
  { value: 'cheat', label: 'Cheat' },
  { value: 'commander', label: 'Commander' },
  { value: 'conduit', label: 'Conduit' },
  { value: 'hexbinder', label: 'Hexbinder' },
  { value: 'homebrewer', label: 'Homebrewer' },
  { value: 'hunter', label: 'Hunter' },
  { value: 'mage', label: 'Mage' },
  { value: 'oathsworn', label: 'Oathsworn' },
  { value: 'shadowmancer', label: 'Shadowmancer' },
  { value: 'shaman', label: 'Shaman' },
  { value: 'shepherd', label: 'Shepherd' },
  { value: 'songweaver', label: 'Songweaver' },
  { value: 'stormshifter', label: 'Stormshifter' },
  { value: 'virtuoso', label: 'Virtuoso' },
  { value: 'zephyr', label: 'Zephyr' },
];

// Mirrors api/class_configs.py's "spell_page": True classes -- these are
// the only ones whose generated sheet actually has a spellbook page, so
// the spell pre-fill fields only make sense (and only show) for them.
const SPELLCASTER_CLASSES = new Set([
  'mage',
  'oathsworn',
  'shaman',
  'shepherd',
  'stormshifter',
  'hexbinder',
  'shadowmancer',
  'songweaver',
  'conduit',
]);

const SPELL_TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type Feedback = { type: 'success' | 'error'; message: string };

export default function CharacterSheetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [printable, setPrintable] = useState(false);
  const [newbieHelp, setNewbieHelp] = useState(false);
  const [selectedClass, setSelectedClass] = useState('berserker');
  const isSpellcaster = SPELLCASTER_CLASSES.has(selectedClass);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setFeedback(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/character-sheet', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let message = 'Something went wrong generating the sheet. Please try again.';
        if (response.status === 401) {
          message = 'Your session has expired. Please log in again.';
        } else if (response.status === 400) {
          message = 'That request was not valid — check your selections and try again.';
        }
        setFeedback({ type: 'error', message });
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1] : 'character-sheet.pdf';

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setFeedback({ type: 'success', message: 'Sheet downloaded.' });
      clearTimer.current = setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ type: 'error', message: 'Something went wrong generating the sheet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <PersonIcon className={styles.badgeIcon} />
        </div>
        <h1>Character Sheets</h1>
        <p className={styles.lede}>
          Pick a class, drop in a portrait, and choose an accent color — optionally fill in a few character
          details below to have them already typed in. You&apos;ll get a real fillable PDF back — every stat,
          skill, and note field stays open to edit afterward in your PDF reader.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="class">
            Class
            <select
              id="class"
              name="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              {CLASSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className={styles.detailsFieldset}>
            <legend className={styles.detailsLegend}>Character details (optional — leave blank to fill in later)</legend>
            <div className={styles.detailsGrid}>
              <label htmlFor="name">
                Name
                <input id="name" name="name" type="text" />
              </label>
              <label htmlFor="ancestry">
                Ancestry
                <input id="ancestry" name="ancestry" type="text" />
              </label>
              <label htmlFor="background">
                Background
                <input id="background" name="background" type="text" />
              </label>
              <label htmlFor="subclass">
                Subclass
                <input id="subclass" name="subclass" type="text" />
              </label>
              <label htmlFor="language">
                Language
                <input id="language" name="language" type="text" />
              </label>
              <label htmlFor="level">
                Level
                <input id="level" name="level" type="number" min={1} max={20} />
              </label>
              <label htmlFor="hp_max">
                Max HP
                <input id="hp_max" name="hp_max" type="number" min={0} />
              </label>
            </div>
            <div className={styles.statsRow}>
              <label htmlFor="str_score">
                STR
                <input id="str_score" name="str_score" type="text" inputMode="numeric" />
              </label>
              <label htmlFor="dex_score">
                DEX
                <input id="dex_score" name="dex_score" type="text" inputMode="numeric" />
              </label>
              <label htmlFor="int_score">
                INT
                <input id="int_score" name="int_score" type="text" inputMode="numeric" />
              </label>
              <label htmlFor="wil_score">
                WIL
                <input id="wil_score" name="wil_score" type="text" inputMode="numeric" />
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.detailsFieldset}>
            <legend className={styles.detailsLegend}>Inventory &amp; notes (optional)</legend>
            <div className={styles.textareaGrid}>
              <label htmlFor="inventory">
                Inventory
                <textarea id="inventory" name="inventory" rows={4} placeholder={'One item per line…'} />
              </label>
              <label htmlFor="abilities">
                Subclass &amp; abilities
                <textarea id="abilities" name="abilities" rows={4} placeholder={'One per line…'} />
              </label>
              <label htmlFor="notes">
                Notes
                <textarea id="notes" name="notes" rows={4} />
              </label>
            </div>
          </fieldset>
          {isSpellcaster && (
            <fieldset className={styles.detailsFieldset}>
              <legend className={styles.detailsLegend}>Spells (optional — one per line)</legend>
              <div className={styles.textareaGrid}>
                <label htmlFor="cantrips">
                  Cantrips
                  <textarea id="cantrips" name="cantrips" rows={5} />
                </label>
                <label htmlFor="utility_spells">
                  Utility spells
                  <textarea id="utility_spells" name="utility_spells" rows={5} />
                </label>
              </div>
              <div className={styles.tierGrid}>
                {SPELL_TIERS.map((n) => (
                  <label key={n} htmlFor={`tier${n}`}>
                    Tier {n}
                    <textarea id={`tier${n}`} name={`tier${n}`} rows={3} />
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label htmlFor="portrait" className={printable ? styles.fieldDisabled : undefined}>
            Portrait (PNG, JPG, or WebP)
            <input
              id="portrait"
              name="portrait"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={printable}
            />
          </label>
          <label htmlFor="color" className={printable ? styles.fieldDisabled : undefined}>
            Accent color
            <input id="color" name="color" type="color" defaultValue="#8a2e2e" disabled={printable} />
          </label>
          <div className={styles.checkboxRow}>
            <label htmlFor="printable" className={styles.checkboxLabel}>
              <input
                id="printable"
                name="printable"
                type="checkbox"
                checked={printable}
                onChange={(e) => setPrintable(e.target.checked)}
              />
              Printable friendly (black &amp; white, no background pattern or portrait — easier on ink)
            </label>
            <label htmlFor="newbie_help" className={styles.checkboxLabel}>
              <input
                id="newbie_help"
                name="newbie_help"
                type="checkbox"
                checked={newbieHelp}
                onChange={(e) => setNewbieHelp(e.target.checked)}
              />
              Newbie friendly (adds a &quot;what can I do on my turn?&quot; reference column)
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Generating…' : 'Generate PDF'}
            </button>
            <div className={styles.status} aria-live="polite" role={feedback?.type === 'error' ? 'alert' : undefined}>
              {feedback && (
                <span className={feedback.type === 'error' ? styles.statusError : styles.statusSuccess}>
                  {feedback.message}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
