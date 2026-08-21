'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './content/icons';
import styles from './HomeSearch.module.css';

export function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = value.trim();
    router.push(query ? `/monsters?search=${encodeURIComponent(query)}` : '/monsters');
  }

  return (
    <form className={styles.searchBar} role="search" onSubmit={handleSubmit}>
      <SearchIcon className={styles.searchIcon} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the compendium — try “Caerys” or “Frost Shield”"
        aria-label="Search the compendium"
      />
    </form>
  );
}
