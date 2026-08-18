import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getItemById } from '@/lib/content/items';
import { splitDescriptionSections } from '@/lib/content/format-description';
import styles from './page.module.css';

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const item = await getItemById(client, params.id);
  if (!item) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.topRow}>
        <a href="/items">&larr; Back to Items</a>
        <Link href={`/items/${item.id}/edit`} className={styles.editLink}>
          Edit entry
        </Link>
      </div>
      <h1>{item.name}</h1>
      <p className={styles.subtitle}>
        {[item.system.name, item.item_type, item.rarity].filter(Boolean).join(' · ')}
      </p>
      {Object.keys(item.stats).length > 0 && (
        <dl className={styles.stats}>
          {Object.entries(item.stats).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.description}>
        {splitDescriptionSections(item.description).map((section, i) => (
          <div key={i} className={styles.descSection}>
            {section.heading && <h2 className={styles.phaseHeading}>{section.heading}</h2>}
            <p>{section.text}</p>
          </div>
        ))}
      </div>
      <ul className={styles.tags}>
        {item.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/items?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
