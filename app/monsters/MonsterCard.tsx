import Link from 'next/link';
import type { Monster } from '@/lib/content/types';

export function MonsterCard({ monster }: { monster: Monster }) {
  return (
    <Link href={`/monsters/${monster.id}`}>
      <article>
        <div>
          <span>{monster.name}</span>
          {monster.rating_label && <span>{monster.rating_label}</span>}
        </div>
        <div>{monster.system.name} &middot; {monster.source.name}</div>
        <span>{monster.is_homebrew ? 'Homebrew' : 'Official'}</span>
        <ul>
          {monster.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </Link>
  );
}
