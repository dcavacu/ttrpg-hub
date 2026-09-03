// Seeds the "New Gear" section of Oak's Nimble Expansion (a FAN-MADE,
// homebrew supplement for Nimble — not official Nimble Co. content) as
// Items: new melee weapons, new ranged weapons, new shields & armors, and
// misc gear (potions/oils). Source PDF pages 4-6 (0-indexed pages 3-5).
import { createSupabaseClient } from '../lib/supabase/client';
import { createItem, type ItemInput } from '../lib/content/items';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056'; // Nimble
const SOURCE_NAME = "Oak's Nimble Expansion";

type RawItem = Omit<ItemInput, 'system_id' | 'source_id' | 'is_homebrew'>;

// --- New Melee Weapons ---
const MELEE_WEAPONS: RawItem[] = [
  {
    name: 'Nunchucks',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      "A pair of linked wooden batons. Damage: 1d4+STR Bludgeoning. Properties: Light, Whirling (if you haven't moved this round, add your damage modifier twice). Cost: 4 gp.",
    stats: { Damage: '1d4+STR Bludgeoning', Properties: 'Light, Whirling', Cost: '4 gp' },
  },
  {
    name: 'Whip',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      'A long, flexible lash that can ensnare as easily as it cuts. Damage: 1d4+DEX Slashing. Properties: Binding (on crit, you may Grapple the target), Light. Cost: 8 gp.',
    stats: { Damage: '1d4+DEX Slashing', Properties: 'Binding, Light', Cost: '8 gp' },
  },
  {
    name: 'Pick',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      'A narrow spike designed to punch through armor. Damage: 1d6+STR Piercing. Properties: Vicious (roll an additional die on crit damage). Cost: 8 gp.',
    stats: { Damage: '1d6+STR Piercing', Properties: 'Vicious', Cost: '8 gp' },
  },
  {
    name: 'Flail',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      "A spiked weight swung from a chain or haft. Damage: 1d6+STR Bludgeoning. Properties: Whirling (if you haven't moved this round, add your damage modifier twice). Cost: 40 gp.",
    stats: { Damage: '1d6+STR Bludgeoning', Properties: 'Whirling', Cost: '40 gp' },
  },
  {
    name: 'Hook Sword',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      "A curved blade ending in a wicked hook, built to snag a foe's weapon or limb. Damage: 1d6+DEX Slashing. Properties: Binding (on crit, you may Grapple the target). Cost: 60 gp.",
    stats: { Damage: '1d6+DEX Slashing', Properties: 'Binding', Cost: '60 gp' },
  },
  {
    name: 'Long Whip',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      'An extended version of the whip, striking from farther away. Damage: 2d4+DEX Slashing. Properties: Binding (on crit, you may Grapple the target), Reach 2. Cost: 40 gp.',
    stats: { Damage: '2d4+DEX Slashing', Properties: 'Binding, Reach 2', Cost: '40 gp' },
  },
  {
    name: 'Light Lance',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description: 'A lightweight lance suited to skirmishing at range. Damage: 1d8+STR Piercing. Properties: Reach 2. Cost: 40 gp.',
    stats: { Damage: '1d8+STR Piercing', Properties: 'Reach 2', Cost: '40 gp' },
  },
  {
    name: 'Heavy Flail',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      "A massive flail on a long haft. Damage: 1d8+STR Bludgeoning. Properties: Reach 2, Whirling (if you haven't moved this round, add your damage modifier twice). Cost: 60 gp.",
    stats: { Damage: '1d8+STR Bludgeoning', Properties: 'Reach 2, Whirling', Cost: '60 gp' },
  },
  {
    name: 'Heavy Whip',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      'A hefty two-handed whip capable of grappling from a distance. Damage: 2d6+DEX Slashing. Properties: 2-handed, Binding (on crit, you may Grapple the target), Reach 2. Cost: 60 gp.',
    stats: { Damage: '2d6+DEX Slashing', Properties: '2-handed, Binding, Reach 2', Cost: '60 gp' },
  },
  {
    name: 'Heavy Lance',
    item_type: 'Melee Weapon',
    tags: ['Weapon', 'Melee'],
    description:
      'An oversized lance requiring real strength to wield. Requires 2 STR to use one-handed. Damage: 1d12+STR Piercing. Properties: 2-handed (Req. 2 STR), Reach 3. Cost: 150 gp.',
    stats: { Damage: '1d12+STR Piercing', Properties: '2-handed (Req. 2 STR), Reach 3', Cost: '150 gp' },
  },
];

// --- New Ranged Weapons ---
const RANGED_WEAPONS: RawItem[] = [
  {
    name: 'Boomerang',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged'],
    description:
      'A curved throwing weapon that flies back to your hand. Damage: 1d6+DEX Bludgeoning. Properties: Light, Homing (returns to you once thrown), Range 8. Cost: 5 gp.',
    stats: { Damage: '1d6+DEX Bludgeoning', Properties: 'Light, Homing, Range 8', Cost: '5 gp' },
  },
  {
    name: 'Harpoon',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged'],
    description:
      'A barbed spear on a line, meant for hauling in what it strikes. Damage: 1d8+STR Piercing. Properties: Binding (on crit, you may Grapple the target), Homing (returns to you once thrown), Range 4. Cost: 20 gp.',
    stats: { Damage: '1d8+STR Piercing', Properties: 'Binding, Homing, Range 4', Cost: '20 gp' },
  },
  {
    name: 'Hand Crossbow',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged'],
    description: 'A compact crossbow that fits in one hand. Damage: 2d4+DEX Piercing. Properties: Light, Load: 1 action, Range 8. Cost: 30 gp.',
    stats: { Damage: '2d4+DEX Piercing', Properties: 'Light, Load: 1 action, Range 8', Cost: '30 gp' },
  },
  {
    name: 'Flintlock',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "An early single-shot firearm. Damage: 2d6+DEX Piercing. Properties: Light, Load: 1 action, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 8. Cost: 100 gp.",
    stats: { Damage: '2d6+DEX Piercing', Properties: 'Light, Load: 1 action, Misfire, Range 8', Cost: '100 gp' },
  },
  {
    name: 'Heavy Flintlock',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "A larger-caliber flintlock pistol. Damage: 2d8+DEX Piercing. Properties: Load: 1 action, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 8. Cost: 150 gp.",
    stats: { Damage: '2d8+DEX Piercing', Properties: 'Load: 1 action, Misfire, Range 8', Cost: '150 gp' },
  },
  {
    name: 'Musket',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "A long-barreled firearm with serious stopping power. Requires 2 STR. Damage: 4d8+DEX Piercing. Properties: 2-handed, Load: 2 actions, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 12 (Req. 2 STR). Cost: 200 gp.",
    stats: { Damage: '4d8+DEX Piercing', Properties: '2-handed, Load: 2 actions, Misfire, Range 12 (Req. 2 STR)', Cost: '200 gp' },
  },
  {
    name: 'Blunderbuss',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "A wide-barreled scattergun, devastating up close. Requires 2 STR. Damage: 6d6+DEX Piercing. Properties: 2-handed, Load: 2 actions, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 4 (Req. 2 STR). Cost: 250 gp.",
    stats: { Damage: '6d6+DEX Piercing', Properties: '2-handed, Load: 2 actions, Misfire, Range 4 (Req. 2 STR)', Cost: '250 gp' },
  },
  {
    name: 'Hand Cannon',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "An absurdly powerful handheld cannon. Requires 3 STR. Damage: 8d6+DEX Piercing. Properties: 2-handed, Load: 3 actions, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 8 (Req. 3 STR). Cost: 250 gp.",
    stats: { Damage: '8d6+DEX Piercing', Properties: '2-handed, Load: 3 actions, Misfire, Range 8 (Req. 3 STR)', Cost: '250 gp' },
  },
  {
    name: 'Magnum',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "A precision revolver holding several shots before it must be reloaded. Damage: 2d8+DEX Piercing. Properties: Capacity 6 (fires 6 times before Loading), Load: 3 actions, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 8. Cost: 2,000 gp.",
    stats: { Damage: '2d8+DEX Piercing', Properties: 'Capacity 6, Load: 3 actions, Misfire, Range 8', Cost: '2,000 gp' },
  },
  {
    name: 'Rifle',
    item_type: 'Ranged Weapon',
    tags: ['Weapon', 'Ranged', 'Firearm'],
    description:
      "A long-barreled repeating firearm, the pinnacle of gunsmithing. Requires 2 STR. Damage: 4d8+DEX Piercing. Properties: 2-handed, Capacity 4 (fires 4 times before Loading), Load: 4 actions, Misfire (rolling a 1 on your Primary Die jams the weapon — you must unjam and load it before it can fire again — but you still miss normally on a 2), Range 12 (Req. 2 STR). Cost: 5,000 gp.",
    stats: { Damage: '4d8+DEX Piercing', Properties: '2-handed, Capacity 4, Load: 4 actions, Misfire, Range 12 (Req. 2 STR)', Cost: '5,000 gp' },
  },
];

// --- New Shields and Armors ---
const SHIELDS_AND_ARMOR: RawItem[] = [
  {
    name: 'Wooden Shield',
    item_type: 'Shield',
    tags: ['Shield'],
    description: 'A simple round shield of banded wood. Requires 1 STR. Armor: +3. Cost: 20 gp.',
    stats: { Armor: '3', Requirement: 'Req. 1 STR', Cost: '20 gp' },
  },
  {
    name: 'Iron Kite Shield',
    item_type: 'Shield',
    tags: ['Shield'],
    description: 'A kite-shaped shield reinforced with iron. Requires 2 STR. Armor: +5. Cost: 400 gp.',
    stats: { Armor: '5', Requirement: 'Req. 2 STR', Cost: '400 gp' },
  },
  {
    name: 'Bastion Shield',
    item_type: 'Shield',
    tags: ['Shield'],
    description: 'An immense tower of a shield that slows its bearer down. Requires 4 STR. Armor: +12 (-1 Speed). Cost: 12,000 gp.',
    stats: { Armor: '12 (-1 Speed)', Requirement: 'Req. 4 STR', Cost: '12,000 gp' },
  },
  {
    name: 'Heavy Garb',
    item_type: 'Armor',
    tags: ['Armor', 'Cloth'],
    description: "Reinforced cloth armor, heavier than an adventurer's usual garb. Requires 2 STR. Armor: 4+DEX. Cost: 250 gp.",
    stats: { Armor: '4+DEX', Requirement: 'Req. 2 STR', Cost: '250 gp' },
  },
  {
    name: 'Kraken Leather',
    item_type: 'Armor',
    tags: ['Armor', 'Leather'],
    description: 'Armor cured from the hide of a kraken, as tough as it is rare. Requires 2 STR. Armor: 8+DEX. Cost: 5,000 gp.',
    stats: { Armor: '8+DEX', Requirement: 'Req. 2 STR', Cost: '5,000 gp' },
  },
  {
    name: 'Iron Mail',
    item_type: 'Armor',
    tags: ['Armor', 'Mail'],
    description: 'A sturdy shirt of interlocking iron rings. Armor: 8+DEX (max 2). Cost: 40 gp.',
    stats: { Armor: '8+DEX (max 2)', Cost: '40 gp' },
  },
  {
    name: 'Steel Plate',
    item_type: 'Armor',
    tags: ['Armor', 'Plate'],
    description: 'A suit of plate forged from quality steel. Armor: 12 (flat, not DEX-modified). Cost: 100 gp.',
    stats: { Armor: '12', Cost: '100 gp' },
  },
  {
    name: 'Impenetrable Plate',
    item_type: 'Armor',
    tags: ['Armor', 'Plate'],
    description:
      'Armor so heavily reinforced it borders on impregnable, at the cost of mobility. Requires 5 STR. Armor: 30 (flat) (-2 Speed). Cost: 5,000 gp.',
    stats: { Armor: '30 (-2 Speed)', Requirement: 'Req. 5 STR', Cost: '5,000 gp' },
  },
];

// --- Misc Gear (potions & oils) ---
const MISC_GEAR: RawItem[] = [
  {
    name: 'Maladorous Essence',
    item_type: 'Adventuring Gear',
    rarity: 'Common',
    tags: ['Adventuring Gear', 'Potion'],
    description:
      'A vial of pungent liquid whose stench can repel or attract creatures with an acute sense of smell. Duration: 1 minute. Cost: 5 sp.',
    stats: { Duration: '1 minute', Effect: 'Pungent smell that can repel or attract creatures with an acute sense of smell.', Cost: '5 sp' },
  },
  {
    name: 'Invisible Ink',
    item_type: 'Adventuring Gear',
    rarity: 'Common',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'Ink that, once applied to an object, can only be seen by allies of whoever applied it. Duration: Instantaneous. Cost: 1 gp.',
    stats: { Duration: 'Instantaneous', Effect: 'Applied to an object, visible only to allies of the applier.', Cost: '1 gp' },
  },
  {
    name: 'Alter Voice',
    item_type: 'Adventuring Gear',
    rarity: 'Common',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A potion granting the drinker total control over their own pitch and accent. Duration: 1 minute. Cost: 50 gp.',
    stats: { Duration: '1 minute', Effect: 'Grants the drinker total control of their own pitch and accent.', Cost: '50 gp' },
  },
  {
    name: 'Interactive Gel',
    item_type: 'Adventuring Gear',
    rarity: 'Uncommon',
    tags: ['Adventuring Gear', 'Potion'],
    description:
      'A gel that, upon impact, interacts with whatever mechanism it touches — locking a door, pulling a lever, and the like. Duration: Instantaneous. Cost: 50 gp.',
    stats: { Duration: 'Instantaneous', Effect: 'Upon collision, interacts with any mechanism it touches (lock a door, pull a lever, etc.).', Cost: '50 gp' },
  },
  {
    name: 'Water Paste',
    item_type: 'Adventuring Gear',
    rarity: 'Uncommon',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A thick paste that grants water breathing and a swimming speed when consumed. Duration: 1 minute. Cost: 150 gp.',
    stats: { Duration: '1 minute', Effect: 'Grants water breathing and swimming speed for the duration.', Cost: '150 gp' },
  },
  {
    name: 'Alchemical Silencer',
    item_type: 'Adventuring Gear',
    rarity: 'Uncommon',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A substance that, when applied to an item, makes it extremely quiet to use. Duration: 1 minute. Cost: 200 gp.',
    stats: { Duration: '1 minute', Effect: 'Items covered with this substance become extremely quiet for the duration.', Cost: '200 gp' },
  },
  {
    name: 'Arcane Flask',
    item_type: 'Adventuring Gear',
    rarity: 'Uncommon',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A flask of concentrated arcane essence. Consuming it grants +2 max mana until your next Safe Rest. Duration: Instantaneous. Cost: 250 gp.',
    stats: { Duration: 'Instantaneous', Effect: 'Consuming this potion grants +2 max mana until your next Safe Rest.', Cost: '250 gp' },
  },
  {
    name: 'Truth Serum',
    item_type: 'Adventuring Gear',
    rarity: 'Rare',
    tags: ['Adventuring Gear', 'Potion'],
    description:
      'A potion that loosens the tongue. The drinker must succeed on a STR save or become unable to lie for the duration. Duration: 1 minute. Cost: 250 gp.',
    stats: { Duration: '1 minute', Effect: 'Drinker must succeed on a STR save or become unable to lie for the duration.', Cost: '250 gp' },
  },
  {
    name: 'Speedy Essence',
    item_type: 'Adventuring Gear',
    rarity: 'Rare',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A fizzing potion that grants +2 Speed for the duration. Duration: 1 minute. Cost: 500 gp.',
    stats: { Duration: '1 minute', Effect: 'Grants the drinker +2 Speed for the duration.', Cost: '500 gp' },
  },
  {
    name: 'Reduction Flask',
    item_type: 'Adventuring Gear',
    rarity: 'Rare',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A flask whose contents shrink whatever they cover down to tiny size. Duration: 1 minute. Cost: 600 gp.',
    stats: { Duration: '1 minute', Effect: 'A creature or object covered by this potion becomes tiny for the duration.', Cost: '600 gp' },
  },
  {
    name: 'Philter of Skill',
    item_type: 'Adventuring Gear',
    rarity: 'Rare',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A potion granting advantage on all skill checks for the duration. Duration: 1 minute. Cost: 800 gp.',
    stats: { Duration: '1 minute', Effect: 'Grants advantage on all skill checks for the duration.', Cost: '800 gp' },
  },
  {
    name: 'Alchemist Air',
    item_type: 'Adventuring Gear',
    rarity: 'Rare',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A potion of rarefied air that grants a flying speed of 8 for the duration. Duration: 1 minute. Cost: 500 gp.',
    stats: { Duration: '1 minute', Effect: 'Grants the target a flying speed of 8 for the duration.', Cost: '500 gp' },
  },
  {
    name: 'Philtre of Memories',
    item_type: 'Adventuring Gear',
    rarity: 'Legendary',
    tags: ['Adventuring Gear', 'Potion'],
    description: "A potent draught that erases the drinker's memory of the last 24 hours. Duration: 1 minute. Cost: 3,000 gp.",
    stats: { Duration: '1 minute', Effect: "Erases the target's memory of the last 24 hours.", Cost: '3,000 gp' },
  },
  {
    name: 'Elixir of Recovery',
    item_type: 'Adventuring Gear',
    rarity: 'Legendary',
    tags: ['Adventuring Gear', 'Potion'],
    description:
      'A rare elixir that, one minute after being consumed, grants the drinker the full effects of a Safe Rest. Duration: Instantaneous. Cost: 5,000 gp.',
    stats: { Duration: 'Instantaneous', Effect: '1 minute after consuming this potion, the drinker gains the effects of a Safe Rest.', Cost: '5,000 gp' },
  },
  {
    name: 'Mutagen of Dragonform',
    item_type: 'Adventuring Gear',
    rarity: 'Legendary',
    tags: ['Adventuring Gear', 'Potion'],
    description: 'A volatile mutagen that grants the drinker the effects of Dragonform for the duration. Duration: 10 minutes. Cost: 10,000 gp.',
    stats: { Duration: '10 minutes', Effect: 'Grants the target the effects of Dragonform for the duration.', Cost: '10,000 gp' },
  },
];

async function ensureSource(client: ReturnType<typeof createSupabaseClient>): Promise<string> {
  const { data: existing, error: findError } = await client
    .from('sources')
    .select('id')
    .eq('system_id', SYSTEM_ID)
    .eq('name', SOURCE_NAME)
    .maybeSingle();
  if (findError) throw new Error(`Failed to look up ${SOURCE_NAME} source: ${findError.message}`);
  if (existing) return (existing as { id: string }).id;

  const { data: created, error: createError } = await client
    .from('sources')
    .insert({ name: SOURCE_NAME, system_id: SYSTEM_ID, is_homebrew: true })
    .select('id')
    .single();
  if (createError) throw new Error(`Failed to create ${SOURCE_NAME} source: ${createError.message}`);
  return (created as { id: string }).id;
}

async function main() {
  const client = createSupabaseClient();
  const sourceId = await ensureSource(client);

  // Idempotency guard: prevent re-seeding if items already exist under this source.
  const { data: existing, error: existingError } = await client
    .from('items')
    .select('id')
    .eq('source_id', sourceId)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing items: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error(`${SOURCE_NAME} items already seeded. Delete existing rows for this source before re-running this script.`);
  }

  const items: ItemInput[] = [...MELEE_WEAPONS, ...RANGED_WEAPONS, ...SHIELDS_AND_ARMOR, ...MISC_GEAR].map((item) => ({
    ...item,
    system_id: SYSTEM_ID,
    source_id: sourceId,
    is_homebrew: true,
  }));

  let created = 0;
  for (const item of items) {
    await createItem(client, item);
    created += 1;
  }

  console.log(
    `Seeded ${created} Oak's Nimble Expansion items (Melee Weapons: ${MELEE_WEAPONS.length}, Ranged Weapons: ${RANGED_WEAPONS.length}, Shields & Armor: ${SHIELDS_AND_ARMOR.length}, Misc Gear: ${MISC_GEAR.length}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
