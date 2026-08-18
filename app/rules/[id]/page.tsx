import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getRuleById } from '@/lib/content/rules';
import { splitDescriptionSections } from '@/lib/content/format-description';
import styles from './page.module.css';

export default async function RuleDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const rule = await getRuleById(client, params.id);
  if (!rule) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.topRow}>
        <a href="/rules">&larr; Back to Rules</a>
        <Link href={`/rules/${rule.id}/edit`} className={styles.editLink}>
          Edit entry
        </Link>
      </div>
      <h1>{rule.name}</h1>
      <p className={styles.subtitle}>
        {rule.system.name} &middot; {rule.category}
      </p>
      {Object.keys(rule.stats).length > 0 && (
        <dl className={styles.stats}>
          {Object.entries(rule.stats).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.description}>
        {splitDescriptionSections(rule.description).map((section, i) => (
          <div key={i} className={styles.descSection}>
            {section.heading && <h2 className={styles.phaseHeading}>{section.heading}</h2>}
            <p>{section.text}</p>
          </div>
        ))}
      </div>
      <ul className={styles.tags}>
        {rule.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/rules?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
