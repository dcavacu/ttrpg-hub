'use client';

import { useState } from 'react';
import styles from './StatsEditor.module.css';

export function StatsEditor({ defaultValue }: { defaultValue?: Record<string, string> }) {
  const initialRows = Object.entries(defaultValue ?? {});
  const [rows, setRows] = useState<[string, string][]>(initialRows.length > 0 ? initialRows : [['', '']]);

  function updateKey(index: number, key: string) {
    setRows((current) => current.map((row, i) => (i === index ? [key, row[1]] : row)));
  }

  function updateValue(index: number, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? [row[0], value] : row)));
  }

  function addRow() {
    setRows((current) => [...current, ['', '']]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.editor}>
      <span className={styles.label}>Stats</span>
      {rows.map(([key, value], index) => (
        <div className={styles.row} key={index}>
          <input
            aria-label="Stat name"
            placeholder="e.g. HP"
            name="stats_key"
            value={key}
            onChange={(e) => updateKey(index, e.target.value)}
          />
          <input
            aria-label="Stat value"
            placeholder="e.g. 26"
            name="stats_value"
            value={value}
            onChange={(e) => updateValue(index, e.target.value)}
          />
          <button type="button" className={styles.removeButton} onClick={() => removeRow(index)} aria-label="Remove stat row">
            &times;
          </button>
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={addRow}>
        + Add stat
      </button>
    </div>
  );
}
