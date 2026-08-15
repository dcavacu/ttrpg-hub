import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';

export default async function MonsterDetailPage({ params }: { params: { id: string } }) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  return (
    <main>
      <a href="/monsters">&larr; Back to Monsters</a>
      <h1>{monster.name}</h1>
      <p>
        {monster.system.name} &middot; {monster.rating_label}
      </p>
      <a href={`/monsters/${monster.id}/edit`}>Edit entry</a>
      <p>{monster.description}</p>
      <dl>
        {Object.entries(monster.stats).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ul>
        {monster.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
