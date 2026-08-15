import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getSpellById } from '@/lib/content/spells';
import styles from './page.module.css';

export default async function SpellDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const spell = await getSpellById(client, params.id);
  if (!spell) notFound();

  return (
    <main className={styles.page}>
      <a href="/spells">&larr; Back to Spells</a>
      <h1>{spell.name}</h1>
      <p>
        {spell.system.name} &middot; {spell.level}
      </p>
      <a href={`/spells/${spell.id}/edit`}>Edit entry</a>
      <p>{spell.description}</p>
      <dl className={styles.stats}>
        {Object.entries(spell.stats).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.tags}>
        {spell.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
