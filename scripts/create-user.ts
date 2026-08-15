import { createSupabaseClient } from '../lib/supabase/client';
import { createUser } from '../lib/auth/users';

async function main() {
  const [, , username, password] = process.argv;
  if (!username || !password) {
    console.error('Usage: npx tsx scripts/create-user.ts <username> <password>');
    process.exit(1);
  }
  const client = createSupabaseClient();
  const id = await createUser(client, username, password);
  console.log(`Created user "${username}" (id: ${id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
