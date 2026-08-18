import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { splitDescriptionSections } from '@/lib/content/format-description';
import styles from './page.module.css';

export default async function MonsterDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.topRow}>
        <a href="/monsters">&larr; Back to Monsters</a>
        <Link href={`/monsters/${monster.id}/edit`} className={styles.editLink}>
          Edit entry
        </Link>
      </div>
      <h1>{monster.name}</h1>
      <p className={styles.subtitle}>
        {[monster.system.name, monster.rating_label].filter(Boolean).join(' · ')}
      </p>
      {Object.keys(monster.stats).length > 0 && (
        <dl className={styles.stats}>
          {Object.entries(monster.stats).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.description}>
        {splitDescriptionSections(monster.description).map((section, i) => (
          <div key={i} className={styles.descSection}>
            {section.heading && <h2 className={styles.phaseHeading}>{section.heading}</h2>}
            <p>{section.text}</p>
          </div>
        ))}
      </div>
      <ul className={styles.tags}>
        {monster.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/monsters?tags=${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
