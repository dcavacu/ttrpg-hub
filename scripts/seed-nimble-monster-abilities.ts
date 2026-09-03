// Seeds the Game Master Guide's "Flavorful Monster Abilities" list (p.29)
// as Rules entries, category "Monster Ability" -- a ready reference for
// building homebrew monsters, browsable/searchable for free via the
// existing Rules page (no new UI needed for this one).
import { createSupabaseClient } from '../lib/supabase/client';
import { createRule, type RuleInput } from '../lib/content/rules';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056'; // Nimble
const SOURCE_ID = '20251ac1-786a-4b14-8e9f-0f6e8fa4cee4'; // Game Master Guide

type SeedAbility = Pick<RuleInput, 'name' | 'description'>;

const ABILITIES: SeedAbility[] = [
  { name: 'Acid Blood', description: 'Melee attackers take half the HP lost in return as acid damage.' },
  { name: 'Aggressive', description: '+X speed if moving toward enemies.' },
  {
    name: 'Blinding Spit',
    description:
      'Spits a blinding substance at a target within range. The target must make a save or be blinded for 1 round.',
  },
  { name: 'Bloodthirsty', description: 'Has advantage on attacks against Bloodied targets.' },
  { name: 'Brute', description: 'Attacks also knockback a number of spaces equal to the primary die rolled.' },
  { name: 'Brawler', description: 'Extra damage, can only attack in melee.' },
  {
    name: 'Burning Aura',
    description: 'Creatures that start their turn adjacent to this monster take 1d6 fire damage.',
  },
  { name: 'Climbing', description: 'Can traverse walls or ceilings normally.' },
  { name: 'Controlling', description: 'Creates/immune to difficult terrain.' },
  { name: 'Disgusting / Venomous / Heavy Blows', description: 'Attacks also Daze the target.' },
  {
    name: 'Disintegrating Armor',
    description: 'Starts with Heavy Armor, on crit degrades to Medium, then to none.',
  },
  { name: 'Doom', description: 'Attacks also Wound the target.' },
  { name: 'Explosive Death', description: 'Explode on death, dealing 2d6 damage to creatures within reach.' },
  { name: 'FAST', description: 'Reaction: 1/round. Force a reroll with disadvantage on an attack.' },
  { name: 'Fearsome', description: 'Frighten enemies within Range on a failed WIL save. 1/encounter.' },
  {
    name: 'Flying',
    description:
      'Flying speed and immune to Opportunity Attacks. May FALL when crit (1d6 damage/10 ft. fallen, and lands Prone).',
  },
  {
    name: 'Formation',
    description: 'Armor increases 1 step for each adjacent ally (None, Med, Heavy).',
  },
  { name: 'Frenzied', description: 'Deals extra damage or has faster speed while damaged.' },
  { name: 'Grappler', description: 'On hit: Grapples.' },
  { name: 'Gravity Manipulator', description: 'Can pull or push enemies within reach.' },
  { name: 'Hates the Light', description: 'Attacks the hero holding light.' },
  { name: 'Hypnotic Gaze', description: 'Forces enemies to make a WIL save or be confused for 1 round.' },
  { name: 'Invulnerable', description: 'Immune to damage until crit.' },
  { name: 'Mounted', description: 'Faster movement and deals extra damage after moving toward an enemy.' },
  {
    name: 'Obstinate',
    description: 'When attacking a target with disadvantage, treat the roll as if it had advantage instead.',
  },
  { name: 'Pack Tactics', description: 'Advantage on attacks when an ally is adjacent to the target.' },
  { name: 'Parry', description: 'Attacks against them miss on a 1 and 2.' },
  { name: 'Ranged', description: 'Extra damage; can only attack at range.' },
  { name: 'Retaliate', description: 'Attacks the first creature who attacks them in melee each round.' },
  { name: 'Savage', description: 'Always crits Grappled creatures.' },
  { name: 'Shifty', description: 'Can move after being attacked.' },
  {
    name: 'Silencer',
    description:
      'Attacks silence enemies (making them unable to cast spells or perform other actions that requires the voice).',
  },
  { name: 'Sneak', description: 'Invisible until they attack.' },
  {
    name: 'Spiked',
    description: 'When hit by a melee attack, the attacker takes 1d4 piercing damage in return.',
  },
  {
    name: 'Standard Bearer',
    description:
      'Buffs nearby allies, reducing the damage they take or increasing the damage they do (see Kobold Clanger or Doomsayer Cultist).',
  },
  {
    name: 'Sturdy / Undying',
    description: 'The first time the monster would die, they have 1 HP instead.',
  },
  { name: 'Summoner', description: 'Calls minions to their aid each round.' },
  { name: 'Tricky', description: 'Can swap places with allies or enemies.' },
  { name: 'Vicious', description: 'Crits are Vicious (roll 1 additional die).' },
  { name: 'Warping Touch', description: 'On hit: teleport target X spaces.' },
  { name: 'Webslinger', description: 'Can immobilize a target with webs when hit or crit.' },
];

async function main() {
  const client = createSupabaseClient();

  // Idempotency guard: prevent re-seeding if any rules from this source
  // already exist. Distinct from seed-nimble-monsters.ts, which also uses
  // SOURCE_GMG -- that's the monsters table, this is rules, so the two
  // don't collide.
  const { data: existing, error: existingError } = await client
    .from('rules')
    .select('id')
    .eq('source_id', SOURCE_ID)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing rules: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error('Game Master Guide rules already seeded. Delete existing rows for this source before re-running this script.');
  }

  let created = 0;
  for (const ability of ABILITIES) {
    await createRule(client, {
      name: ability.name,
      system_id: SYSTEM_ID,
      source_id: SOURCE_ID,
      is_homebrew: false,
      category: 'Monster Ability',
      tags: ['Monster Ability'],
      description: ability.description,
    });
    created += 1;
  }

  console.log(`Seeded ${created} monster abilities from the Game Master Guide.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
