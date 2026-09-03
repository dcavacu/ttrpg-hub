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

type Feedback = { type: 'success' | 'error'; message: string };

export default function CharacterSheetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [printable, setPrintable] = useState(false);
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
          Pick a class, drop in a portrait, and choose an accent color. You&apos;ll get a real fillable PDF back —
          every stat, skill, and note field stays open for you to fill in afterward in your PDF reader.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
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
          <label htmlFor="printable" className={styles.checkboxLabel}>
            <input
              id="printable"
              name="printable"
              type="checkbox"
              checked={printable}
              onChange={(e) => setPrintable(e.target.checked)}
            />
            Printable (black &amp; white, no background pattern or portrait — easier on ink)
          </label>
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
