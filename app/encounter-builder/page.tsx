import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { getUserByUsername } from '@/lib/auth/current-user';
import { listNimbleMonstersLean } from '@/lib/content/monsters';
import { EncounterBuilder } from './EncounterBuilder';
import styles from './page.module.css';

export default async function EncounterBuilderPage() {
  const client = createSupabaseClient();
  const secret = process.env.SITE_PASSWORD ?? '';
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token, secret) : null;
  const currentUser = session ? await getUserByUsername(client, session.username) : null;

  // GM-only tool: not just hidden from nav for non-GM users, but a direct
  // hit on this route 404s for them too.
  if (!currentUser?.isGm) notFound();

  const monsters = await listNimbleMonstersLean(client);

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Encounter Builder</h1>
      <p className={styles.lede}>
        Sums monster levels against your party&apos;s, per the Game Master Guide&apos;s encounter-balance guidance,
        then lets you track HP through the fight once it starts.
      </p>
      <EncounterBuilder monsters={monsters} />
    </main>
  );
}
