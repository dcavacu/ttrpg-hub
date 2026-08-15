import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export interface AuthenticatedUser {
  id: string;
  username: string;
}

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
  if (!data) return null;
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
