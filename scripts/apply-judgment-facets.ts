import { createSupabaseClient } from '../lib/supabase/client';
import { JUDGMENT_MONSTER_DATA, JUDGMENT_SPELL_MANA_COST } from './backfill-judgment-facets-data';

async function getSystemId(client: ReturnType<typeof createSupabaseClient>, name: string): Promise<string> {
  const { data, error } = await client.from('systems').select('id').eq('name', name).single();
  if (error || !data) throw new Error(`Could not find a "${name}" system row: ${error?.message ?? 'not found'}`);
  return (data as { id: string }).id;
}

async function applyMonsterNamespace(
  client: ReturnType<typeof createSupabaseClient>,
  systemId: string,
  entries: Record<string, { combat_role: string; race?: string }>,
): Promise<number> {
  let updates = 0;
  for (const [name, judgment] of Object.entries(entries)) {
    const patch: Record<string, string> = { combat_role: judgment.combat_role };
    if (judgment.race) patch.race = judgment.race;
    // Scoping by system_id (not just name) is required — Nimble and the D&D SRD share several
    // monster names (Goblin, Bandit, Basilisk, ...); without this an update could silently land
    // on the wrong system's row.
    const { error } = await client.from('monsters').update(patch).eq('name', name).eq('system_id', systemId);
    if (error) throw new Error(`Failed to update monster ${name}: ${error.message}`);
    updates += 1;
  }
  return updates;
}

async function main() {
  const client = createSupabaseClient();

  const nimbleSystemId = await getSystemId(client, 'Nimble');
  const srdSystemId = await getSystemId(client, 'D&D 5e');

  const nimbleUpdates = await applyMonsterNamespace(client, nimbleSystemId, JUDGMENT_MONSTER_DATA.nimble);
  const srdUpdates = await applyMonsterNamespace(client, srdSystemId, JUDGMENT_MONSTER_DATA.srd);
  console.log(`Applied combat_role/race to ${nimbleUpdates} Nimble monsters and ${srdUpdates} SRD monsters.`);

  let spellUpdates = 0;
  for (const [name, manaCost] of Object.entries(JUDGMENT_SPELL_MANA_COST)) {
    const { error } = await client.from('spells').update({ mana_cost: manaCost }).eq('name', name);
    if (error) throw new Error(`Failed to update spell ${name}: ${error.message}`);
    spellUpdates += 1;
  }
  console.log(`Applied mana_cost to ${spellUpdates} spells.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
