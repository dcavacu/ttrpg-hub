import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

// Next.js patches the global fetch with its own Data Cache, keyed by request
// URL. Supabase's REST calls are plain GET/HEAD requests, so an unfiltered
// browse or count query produces the same URL on every request and would
// otherwise get served a stale cached response indefinitely — on Vercel this
// cache is durable across deployments, so a redeploy does not clear it.
// Forcing no-store here makes every Supabase call bypass that cache.
function noStoreFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: 'no-store' });
}

export function createSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  cached = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
  return cached;
}
