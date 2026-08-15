import { createSupabaseClient } from '../lib/supabase/client';
import { createMonster } from '../lib/content/monsters';
import { mapOpen5eMonsterToRow, type Open5eMonster } from '../lib/content/open5e-mapper';

const OPEN5E_URL = 'https://api.open5e.com/v1/monsters/?limit=1000';

async function main() {
  const client = createSupabaseClient();

  const { data: system, error: systemError } = await client
    .from('systems')
    .select('id')
    .eq('slug', 'dnd-5e')
    .single();
  if (systemError || !system) {
    throw new Error('Run once with a "D&D 5e" / "dnd-5e" row in systems before seeding.');
  }

  const { data: source, error: sourceError } = await client
    .from('sources')
    .select('id')
    .eq('name', 'SRD')
    .eq('system_id', system.id)
    .single();
  if (sourceError || !source) {
    throw new Error('Run once with an "SRD" row in sources (system D&D 5e, is_homebrew=false) before seeding.');
  }

  const response = await fetch(OPEN5E_URL);
  if (!response.ok) throw new Error(`Open5e request failed: ${response.status}`);
  const body = (await response.json()) as { results: Open5eMonster[] };

  let created = 0;
  for (const raw of body.results) {
    const row = mapOpen5eMonsterToRow(raw, system.id, source.id);
    await createMonster(client, row);
    created += 1;
  }

  console.log(`Seeded ${created} monsters from the Open5e SRD.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
