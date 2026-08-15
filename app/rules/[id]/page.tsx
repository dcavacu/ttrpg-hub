import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getRuleById } from '@/lib/content/rules';
import styles from './page.module.css';

export default async function RuleDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const rule = await getRuleById(client, params.id);
  if (!rule) notFound();

  return (
    <main className={styles.page}>
      <a href="/rules">&larr; Back to Rules</a>
      <h1>{rule.name}</h1>
      <p>
        {rule.system.name} &middot; {rule.category}
      </p>
      <a href={`/rules/${rule.id}/edit`}>Edit entry</a>
      <p>{rule.description}</p>
      <dl className={styles.stats}>
        {Object.entries(rule.stats).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.tags}>
        {rule.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
