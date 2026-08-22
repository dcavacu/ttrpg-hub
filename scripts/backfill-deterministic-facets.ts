import { createSupabaseClient } from '../lib/supabase/client';
import { deriveMonsterTier, deriveMonsterRaceFromTags, deriveSpellSchoolFromTags } from './derive-deterministic-facets';

async function backfillMonsters() {
  const client = createSupabaseClient();
  const { data, error } = await client.from('monsters').select('id, name, tags');
  if (error) throw new Error(`Failed to load monsters: ${error.message}`);

  let tierUpdates = 0;
  let raceUpdates = 0;
  for (const row of (data ?? []) as { id: string; name: string; tags: string[] }[]) {
    const tier = deriveMonsterTier(row.name, row.tags);
    const race = deriveMonsterRaceFromTags(row.tags);
    const patch: Record<string, string> = {};
    if (tier !== 'Normal') patch.tier = tier;
    if (race) patch.race = race;
    if (Object.keys(patch).length === 0) continue;
    const { error: updateError } = await client.from('monsters').update(patch).eq('id', row.id);
    if (updateError) throw new Error(`Failed to update monster ${row.name}: ${updateError.message}`);
    if (patch.tier) tierUpdates += 1;
    if (patch.race) raceUpdates += 1;
  }
  console.log(`Monsters: set tier on ${tierUpdates} rows, race on ${raceUpdates} rows.`);
}

async function backfillSpells() {
  const client = createSupabaseClient();
  const { data, error } = await client.from('spells').select('id, name, tags');
  if (error) throw new Error(`Failed to load spells: ${error.message}`);

  let schoolUpdates = 0;
  for (const row of (data ?? []) as { id: string; name: string; tags: string[] }[]) {
    const school = deriveSpellSchoolFromTags(row.tags);
    if (!school) continue;
    const { error: updateError } = await client.from('spells').update({ school }).eq('id', row.id);
    if (updateError) throw new Error(`Failed to update spell ${row.name}: ${updateError.message}`);
    schoolUpdates += 1;
  }
  console.log(`Spells: set school on ${schoolUpdates} rows.`);
}

async function main() {
  await backfillMonsters();
  await backfillSpells();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
