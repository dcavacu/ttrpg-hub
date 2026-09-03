// Seeds the Hexbinder's spell list (Hexbinder.pdf p.10) as Spells --
// content that only exists in the standalone class supplement, not in
// Core Rules (where the previously-seeded Nimble spells came from), so
// it's genuinely new to the compendium.
import { createSupabaseClient } from '../lib/supabase/client';
import { createSpell, type SpellInput } from '../lib/content/spells';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056'; // Nimble

type SeedSpell = Pick<SpellInput, 'name' | 'level' | 'tags' | 'description'>;

const SPELLS: SeedSpell[] = [
  {
    name: 'Misery',
    level: 'Tier 1',
    tags: ['Hexbinder', 'Single Target'],
    description:
      '2 Actions, Single Target, Reach 8. Damage: 1d8+LVL. On hit: apply an Affliction. On crit: apply 2 instead.',
  },
  {
    name: 'Life Bloom',
    level: 'Tier 1',
    tags: ['Hexbinder', 'Healing'],
    description:
      '1 Action, Single Target, Reach 8. Consume 1 of your own Hit Dice, and 1 more from a willing target. Heal your target and another creature within Reach the sum of those dice.',
  },
  {
    name: 'Twitch Curse',
    level: 'Tier 2',
    tags: ['Hexbinder', 'Reaction'],
    description:
      "1 Action, Single Target, Reach 8. Reaction: When attacked by a creature within Reach, Defend for free. First move the attacker 1 space (+1 space for each Affliction they have). Opportunity attacks triggered this way are made with advantage instead of disadvantage. If you are no longer a valid target (e.g., the attacker is dead, you are out of line of sight/Reach/Range), the triggering attack misses.",
  },
  {
    name: 'Bloodcurse',
    level: 'Tier 2',
    tags: ['Hexbinder', 'Single Target'],
    description:
      '2 Actions, Single Target, Reach 8. Damage: 1d4+LVL (increment the die size for each Affliction they have). On hit: target becomes secretly Bloodcursed, suffering 2x the next damage they deal (ignoring armor).',
  },
  {
    name: 'Wyrding Strands',
    level: 'Tier 3',
    tags: ['Hexbinder', 'AoE'],
    description:
      '2 Actions, AoE, Reach 8. Move creatures in a 4x4 area a total of 2d6 spaces, divided among them as you choose. Large or larger creatures move half as far.',
  },
  {
    name: 'Frogify',
    level: 'Tier 3',
    tags: ['Hexbinder', 'Single Target', 'Control'],
    description:
      "2 Actions, Single Target, Reach 8. On a failed WIL save, turn a creature into a harmless, armorless, tiny FROG for up to 1 min. It can still move but not attack (except for bugs). On a save, they are partially transformed, only reducing their armor to none instead. Damage or casting this again ends the effect.",
  },
  {
    name: 'Malediction',
    level: 'Tier 4',
    tags: ['Hexbinder', 'Multi-target'],
    description:
      '2 Actions, Multi-target, Reach 4. Roll KEYd4 Primary Dice. For each hit, deal LVL damage to a creature within Reach (ignoring armor). Max 1 die per creature.',
  },
  {
    name: 'Circle of Thorns',
    level: 'Tier 4',
    tags: ['Hexbinder', 'Single Target', 'Control'],
    description:
      '2 Actions, Single Target, Reach 8. Fill every empty adjacent space around a creature with a growth of thorns. Creatures who enter the area must make a DEX save or take KEYd6 damage and become Restrained, half on save. Lasts up to 1 min or until it has dealt damage 3 times.',
  },
  {
    name: 'Terror',
    level: 'Tier 5',
    tags: ['Hexbinder', 'Single Target'],
    description:
      '2 Actions, Single Target, Reach 8. Damage: LVL x 1d4 (ignoring armor). Advantage for each Affliction on the target.',
  },
];

async function ensureSource(client: ReturnType<typeof createSupabaseClient>): Promise<string> {
  const { data: existing, error: findError } = await client
    .from('sources')
    .select('id')
    .eq('system_id', SYSTEM_ID)
    .eq('name', 'Hexbinder')
    .maybeSingle();
  if (findError) throw new Error(`Failed to look up Hexbinder source: ${findError.message}`);
  if (existing) return (existing as { id: string }).id;

  const { data: created, error: createError } = await client
    .from('sources')
    .insert({ name: 'Hexbinder', system_id: SYSTEM_ID, is_homebrew: false })
    .select('id')
    .single();
  if (createError) throw new Error(`Failed to create Hexbinder source: ${createError.message}`);
  return (created as { id: string }).id;
}

async function main() {
  const client = createSupabaseClient();
  const sourceId = await ensureSource(client);

  const { data: existing, error: existingError } = await client
    .from('spells')
    .select('id')
    .eq('source_id', sourceId)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing spells: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error('Hexbinder spells already seeded. Delete existing rows for this source before re-running this script.');
  }

  let created = 0;
  for (const spell of SPELLS) {
    await createSpell(client, {
      name: spell.name,
      system_id: SYSTEM_ID,
      source_id: sourceId,
      is_homebrew: false,
      level: spell.level,
      tags: spell.tags,
      description: spell.description,
    });
    created += 1;
  }

  console.log(`Seeded ${created} Hexbinder spells.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
