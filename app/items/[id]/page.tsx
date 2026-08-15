import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getItemById } from '@/lib/content/items';
import styles from './page.module.css';

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const item = await getItemById(client, params.id);
  if (!item) notFound();

  return (
    <main className={styles.page}>
      <a href="/items">&larr; Back to Items</a>
      <h1>{item.name}</h1>
      <p>
        {[item.system.name, item.item_type, item.rarity].filter(Boolean).join(' · ')}
      </p>
      <a href={`/items/${item.id}/edit`}>Edit entry</a>
      <p>{item.description}</p>
      <dl className={styles.stats}>
        {Object.entries(item.stats).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.tags}>
        {item.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
