import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export interface AuthenticatedUser {
  id: string;
  username: string;
}

// A throwaway hash computed once at module load, used to keep the
// "username not found" path taking roughly as long as the "username
// found, password wrong" path. Without this, an attacker could
// enumerate valid usernames by timing login attempts: a cost-12
// bcrypt.compare takes on the order of hundreds of milliseconds to
// seconds, while an early return for a missing user is near-instant.
// That timing side channel would undercut the deliberately generic
// "That username or password isn't right" error message.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);

export async function verifyUserCredentials(
  client: SupabaseClient,
  username: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const { data, error } = await client
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();
  if (error) throw new Error(`Failed to look up user: ${error.message}`);
  if (!data) {
    // Run a real bcrypt comparison against a dummy hash so this branch
    // costs about the same as the "user found" branch below.
    await bcrypt.compare(password, DUMMY_HASH);
    return null;
  }
  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return null;
  return { id: data.id, username: data.username };
}

export async function createUser(client: SupabaseClient, username: string, password: string): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await client.from('users').insert({ username, password_hash: passwordHash }).select('id').single();
  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return (data as { id: string }).id;
}
