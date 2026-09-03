import type { SupabaseClient } from '@supabase/supabase-js';

export interface CurrentUser {
  id: string;
  username: string;
  isGm: boolean;
}

// Postgres "column does not exist" -- see the fallback below.
const UNDEFINED_COLUMN = '42703';

/** Looks up the full user record (including the GM flag) for an already-
 * verified session username. Deliberately takes the username rather than
 * reading the session cookie itself, matching verifySessionToken's own
 * "caller reads cookies(), this stays pure" split -- keeps this testable
 * without mocking Next.js request internals. */
export async function getUserByUsername(client: SupabaseClient, username: string): Promise<CurrentUser | null> {
  const { data, error } = await client
    .from('users')
    .select('id, username, is_gm')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    // schema.sql's `alter table users add column is_gm ...` is a manual
    // Supabase-SQL-editor step (see its comment -- this app only has a
    // REST/service-role client, not a direct Postgres connection, so it
    // can't apply migrations itself). This function is called from the
    // root layout on every single page, so if the code ships before that
    // migration is run, a hard failure here would break the whole app
    // instead of just leaving GM-only tooling invisible. Fall back to a
    // query without the column and treat isGm as false until it exists.
    if (error.code === UNDEFINED_COLUMN) {
      const fallback = await client.from('users').select('id, username').eq('username', username).maybeSingle();
      if (fallback.error) throw new Error(`Failed to load user ${username}: ${fallback.error.message}`);
      if (!fallback.data) return null;
      const row = fallback.data as { id: string; username: string };
      return { id: row.id, username: row.username, isGm: false };
    }
    throw new Error(`Failed to load user ${username}: ${error.message}`);
  }

  if (!data) return null;
  const row = data as { id: string; username: string; is_gm: boolean | null };
  return { id: row.id, username: row.username, isGm: Boolean(row.is_gm) };
}
