'use client';

import { useEffect, useState } from 'react';
import { readFavoritesSnapshot } from '../content/useFavorites';
import { getFavoritedContent, type FavoritedContent } from './actions';
import { MonsterCard } from '../monsters/MonsterCard';
import { ItemCard } from '../items/ItemCard';
import { SpellCard } from '../spells/SpellCard';
import { RuleCard } from '../rules/RuleCard';
import styles from './page.module.css';

type LoadState = { status: 'loading' } | { status: 'empty' } | { status: 'loaded'; content: FavoritedContent };

export function FavoritesClient() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const snapshot = readFavoritesSnapshot();
    const total = snapshot.monsters.length + snapshot.items.length + snapshot.spells.length + snapshot.rules.length;
    if (total === 0) {
      setState({ status: 'empty' });
      return;
    }
    getFavoritedContent(snapshot).then((content) => setState({ status: 'loaded', content }));
  }, []);

  if (state.status === 'loading') {
    return <p className={styles.status}>Loading your favorites…</p>;
  }

  if (state.status === 'empty') {
    return (
      <p className={styles.status}>
        Nothing starred yet. Click the star on any monster, item, spell, or rule card to add it here.
      </p>
    );
  }

  const { content } = state;
  const hasAny = content.monsters.length + content.items.length + content.spells.length + content.rules.length > 0;
  if (!hasAny) {
    return (
      <p className={styles.status}>
        Nothing starred yet. Click the star on any monster, item, spell, or rule card to add it here.
      </p>
    );
  }

  return (
    <div className={styles.groups}>
      {content.monsters.length > 0 && (
        <section>
          <h2 className={styles.groupHeading}>Monsters</h2>
          <div className={styles.grid}>
            {content.monsters.map((m) => (
              <MonsterCard key={m.id} monster={m} />
            ))}
          </div>
        </section>
      )}
      {content.items.length > 0 && (
        <section>
          <h2 className={styles.groupHeading}>Items</h2>
          <div className={styles.grid}>
            {content.items.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
        </section>
      )}
      {content.spells.length > 0 && (
        <section>
          <h2 className={styles.groupHeading}>Spells</h2>
          <div className={styles.grid}>
            {content.spells.map((s) => (
              <SpellCard key={s.id} spell={s} />
            ))}
          </div>
        </section>
      )}
      {content.rules.length > 0 && (
        <section>
          <h2 className={styles.groupHeading}>Rules</h2>
          <div className={styles.grid}>
            {content.rules.map((r) => (
              <RuleCard key={r.id} rule={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
