// Seeds the new spell-school system from Oak's Nimble Expansion (a FAN-MADE,
// homebrew supplement for Nimble — not official Nimble Co. content) as
// Spells: Astral, Crystal, Sand, Summoning and Water spells, plus the
// "Additional Spells" Secret spells and Utility spells tagged to those same
// five schools. Source PDF pages 9-15 (0-indexed pages 8-14). The "New Gear"
// section (items) and the Conduit class were extracted separately.
import { createSupabaseClient } from '../lib/supabase/client';
import { createSpell, type SpellInput } from '../lib/content/spells';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056'; // Nimble
const SOURCE_NAME = "Oak's Nimble Expansion";

type SpellSeed = Omit<SpellInput, 'system_id' | 'source_id' | 'is_homebrew'>;

// ─────────────────────────────────────────────────────────────────────────
// ASTRAL SPELLS
// ─────────────────────────────────────────────────────────────────────────
const ASTRAL_SPELLS: SpellSeed[] = [
  {
    name: 'Shooting Star',
    level: 'Cantrip',
    tags: ['Astral'],
    description:
      "1 Action (up to 3), Single Target. Range: 8. Damage: 1d8 radiant. Spend +1 action to deal [text cuts off in the source after 'to deal' — likely additional damage per extra action; preserved as written]. High Levels: +4 damage every 5 levels.",
    stats: { Actions: '1 (up to 3)', Target: 'Single Target', Range: '8', Damage: '1d8 radiant' },
  },
  {
    name: 'Cosmic Alignment',
    level: 'Cantrip',
    tags: ['Astral'],
    description:
      '1 Action, Self. Concentration: up to 1 minute. Gain +2 Speed. High Levels: +2 Speed every 5 levels.',
    stats: { Actions: '1', Target: 'Self', Concentration: 'Up to 1 minute', Effect: '+2 Speed' },
  },
  {
    name: 'Bright Mark',
    level: 'Tier 1',
    tags: ['Astral'],
    description:
      '2 Actions, Single Target. Range: 8. Damage: 4d4 radiant. On hit: target becomes vulnerable to the next attack made against them. Upcast: roll with advantage.',
    stats: { Actions: '2', Target: 'Single Target', Range: '8', Damage: '4d4 radiant', 'On Hit': 'Vulnerable to next attack', Upcast: 'Roll with advantage' },
  },
  {
    name: 'Astral Guard',
    level: 'Tier 1',
    tags: ['Astral'],
    description:
      'Castable only while Defending or when an ally Defends. 0 Actions, Self. Become resistant to the incoming attack. Spend +1 mana to cast this on an ally within Reach 4 instead. Upcast: +2 Reach.',
    stats: {
      Actions: '0',
      Target: 'Self',
      Requirement: 'Castable only while Defending or when an ally Defends',
      Effect: 'Resistance to the incoming attack (or, for +1 mana, an ally within Reach 4)',
      Upcast: '+2 Reach',
    },
  },
  {
    name: 'Cosmic Flash',
    level: 'Tier 2',
    tags: ['Astral'],
    description:
      '2 Actions, AoE. Reach: Cone 4. Damage: 2d20 radiant. On hit: target becomes vulnerable to the next attack made against them. Upcast: +2 Range or roll with advantage.',
    stats: { Actions: '2', Target: 'AoE', Reach: 'Cone 4', Damage: '2d20 radiant', 'On Hit': 'Vulnerable to next attack', Upcast: '+2 Range or roll with advantage' },
  },
  {
    name: 'Dazzle',
    level: 'Tier 3',
    tags: ['Astral'],
    description:
      '2 Actions, Single Target. Range: 6. Damage: 4d10+10 radiant. On hit: Blind until the end of their next turn. Upcast: +10 damage.',
    stats: { Actions: '2', Target: 'Single Target', Range: '6', Damage: '4d10+10 radiant', 'On Hit': 'Blind until end of next turn', Upcast: '+10 damage' },
  },
  {
    name: 'Starquake',
    level: 'Tier 4',
    tags: ['Astral'],
    description:
      "2 Actions, AoE. Line: 4. Damage: 1d20+10 radiant. Cast again, centered on the line's end. Upcast: +5 damage.",
    stats: { Actions: '2', Target: 'AoE', Line: '4', Damage: '1d20+10 radiant', Effect: "Casts again, centered on the line's end", Upcast: '+5 damage' },
  },
  {
    name: 'Cosmic Dust',
    level: 'Tier 5',
    tags: ['Astral'],
    description:
      '3 Actions, Single Target+. Reach: 6. Roll 2d20, then divide the dice as you choose amongst any number of targets within range. Targets then Align (heal that much HP) OR Burn (take that much radiant damage). Upcast: +1 Reach or +1 Die.',
    stats: { Actions: '3', Target: 'Single Target+', Reach: '6', Effect: 'Roll 2d20, divide among targets to Align (heal) or Burn (radiant damage)', Upcast: '+1 Reach or +1 Die' },
  },
  {
    name: 'Supernova',
    level: 'Tier 7',
    tags: ['Astral'],
    description:
      '3 Actions, AoE. Reach: 4. Others within Reach take d66 force damage on a failed STR save. Half damage on save. Upcast: +1 Reach or roll with advantage.',
    stats: { Actions: '3', Target: 'AoE', Reach: '4', Damage: 'd66 force', Save: 'STR (half on save)', Upcast: '+1 Reach or roll with advantage' },
  },
  {
    name: 'Astro',
    level: 'Tier 9',
    tags: ['Astral'],
    description:
      "3 Actions, AoE. Concentration: up to 1 minute. Create a medium living star adjacent to you. At the end of your turn the star does one of the following — Strike: the star moves 4 spaces in a straight line, targets along the path take d44 radiant damage; OR Grow: increase your star's size by 1 (max huge), +2 speed (max speed 8), and increment its die size 1 step (d44 » d66 » d88). Once you cast this spell, you must Safe Rest for 1 week before you can use it again.",
    stats: {
      Actions: '3',
      Target: 'AoE',
      Concentration: 'Up to 1 minute',
      Effect: "Living star: Strike (4-space line, d44 radiant) or Grow (size/speed/die up)",
      Restriction: 'Safe Rest 1 week between casts',
    },
  },
];

const ASTRAL_UTILITY_SPELLS: SpellSeed[] = [
  {
    name: 'Guidance',
    level: 'Cantrip',
    tags: ['Utility', 'Astral'],
    description:
      'Casting Time: 1 min. Position: roughly estimate your current location. OR: Direction: obtain the cardinal direction of your desired location.',
    stats: { 'Casting Time': '1 minute', Effect: 'Estimate current location, or obtain a cardinal direction' },
  },
  {
    name: 'Fireworks',
    level: 'Cantrip',
    tags: ['Utility', 'Astral'],
    description: '1 Action. Range: 12. Create a distractingly loud and bright light that lasts 10 seconds.',
    stats: { Actions: '1', Range: '12', Effect: 'Loud, bright light lasting 10 seconds' },
  },
  {
    name: 'Ultraviolet',
    level: 'Cantrip',
    tags: ['Utility', 'Astral'],
    description:
      'Casting Time: 1 min. Create a pocket star that lasts as long as you hold it. This dim light is capable of highlighting traces of magic and other things that are invisible to the naked eye.',
    stats: { 'Casting Time': '1 minute', Effect: 'Pocket star that reveals magic and invisible traces' },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// CRYSTAL SPELLS
// ─────────────────────────────────────────────────────────────────────────
const CRYSTAL_SPELLS: SpellSeed[] = [
  {
    name: 'Force Fragments',
    level: 'Cantrip',
    tags: ['Crystal'],
    description:
      'When recast, ignores disadvantage imposed by Rushed Attacks. 1 Action, Single Target. Range: 12. Damage: 2d4 force. Instead of a crit, recast as a free action. High Levels: +4 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '12', Damage: '2d4 force', Effect: 'Crit recasts the spell as a free action instead' },
  },
  {
    name: 'Barrier Bash',
    level: 'Cantrip',
    tags: ['Crystal'],
    description:
      '2 Actions, AoE. Line: 3. Damage: 2d6 force. On hit: push targets 1 space (left or right). High Levels: +6 damage every 5 levels.',
    stats: { Actions: '2', Target: 'AoE', Line: '3', Damage: '2d6 force', 'On Hit': 'Push targets 1 space (left or right)' },
  },
  {
    name: 'Force Weapon',
    level: 'Tier 1',
    tags: ['Crystal'],
    description:
      'Free Action, Special. Concentration: up to 1 minute. Conjure a melee weapon of your choice (if light, conjure 2). It deals force damage and you are proficient with it. Upcast: weapon deals +1 damage.',
    stats: { Actions: 'Free Action', Target: 'Special', Concentration: 'Up to 1 minute', Effect: 'Conjures a force-damage melee weapon (2 if Light)', Upcast: 'Weapon deals +1 damage' },
  },
  {
    name: 'Force Fence',
    level: 'Tier 1',
    tags: ['Crystal'],
    description:
      "1 Action, AoE. Reach: 4. Conjure a magical barrier in 3 contiguous spaces within reach, tall enough to cover large creatures. A space breaks if it takes damage. Upcast: +1 reach or +3 spaces.",
    stats: { Actions: '1', Target: 'AoE', Reach: '4', Effect: 'Barrier in 3 contiguous spaces, breaks if damaged', Upcast: '+1 reach or +3 spaces' },
  },
  {
    name: 'Crystalline Armor',
    level: 'Tier 2',
    tags: ['Crystal'],
    description:
      "1 Action, AoE. Concentration: up to 1 minute. Reach: 1. You and KEY allies in reach gain +4 Armor. Spend +1 mana to cast this when it's not your turn. Upcast: +1 Armor.",
    stats: { Actions: '1', Target: 'AoE', Reach: '1', Concentration: 'Up to 1 minute', Effect: 'You and KEY allies gain +4 Armor', Upcast: '+1 Armor' },
  },
  {
    name: 'Force Crash',
    level: 'Tier 3',
    tags: ['Crystal'],
    description:
      '2 Actions, AoE. Reach: 8. Enemies within a 4x4 area take 6d6 force damage on a failed DEX save. Half damage on save. Upcast: +12 damage.',
    stats: { Actions: '2', Target: 'AoE', Reach: '8', Damage: '6d6 force', Save: 'DEX (half on save)', Upcast: '+12 damage' },
  },
  {
    name: 'Crystal Clear',
    level: 'Tier 4',
    tags: ['Crystal'],
    description:
      '1 Action, AoE. Reach: 3. Allies in range remove 1 negative condition. Enemies are Blind until the end of their next turn. Upcast: +1 reach.',
    stats: { Actions: '1', Target: 'AoE', Reach: '3', Effect: 'Allies remove 1 negative condition; enemies Blind until end of next turn', Upcast: '+1 reach' },
  },
  {
    name: 'Intertwine',
    level: 'Tier 5',
    tags: ['Crystal'],
    description:
      '2 Actions, AoE. Reach: 8. Mark 4 points in range; they are now magically connected for 1 minute. Allies adjacent to a point can teleport to another one for free.',
    stats: { Actions: '2', Target: 'AoE', Reach: '8', Duration: '1 minute', Effect: 'Marks 4 connected points; adjacent allies teleport between them for free' },
  },
  {
    name: 'Endless Fragments',
    level: 'Tier 7',
    tags: ['Crystal'],
    description:
      'When recast, ignores disadvantage imposed by Rushed Attacks. 2 Actions, Self. Range: 12. Damage: d44 force. If any die rolls the max, cast again as a free action for 0 mana.',
    stats: { Actions: '2', Target: 'Self', Range: '12', Damage: 'd44 force', Effect: 'Max die roll casts again free for 0 mana' },
  },
  {
    name: 'Protective Field',
    level: 'Tier 9',
    tags: ['Crystal'],
    description:
      '3 Actions, AoE. Concentration: up to 1 minute. Range: 8. Conjure a barrier around an 8x8 (or smaller) area; everything within this area is immune to any damage or effects that exist beyond it. The barrier is indestructible, disappearing once concentration ends.',
    stats: { Actions: '3', Target: 'AoE', Range: '8', Concentration: 'Up to 1 minute', Effect: 'Indestructible 8x8 barrier immune to outside damage/effects' },
  },
];

const CRYSTAL_UTILITY_SPELLS: SpellSeed[] = [
  {
    name: 'Spyglass',
    level: 'Cantrip',
    tags: ['Utility', 'Crystal'],
    description:
      '1 Action. Turn a small or smaller opaque object transparent, allowing creatures to view into it or through it for 1 minute.',
    stats: { Actions: '1', Duration: '1 minute', Effect: 'Makes a small or smaller opaque object transparent' },
  },
  {
    name: 'Transparency',
    level: 'Cantrip',
    tags: ['Utility', 'Crystal'],
    description: '1 Action, Single Target. Touch a creature or object, grant invisibility as long as they do not move.',
    stats: { Actions: '1', Target: 'Single Target', Effect: 'Grants invisibility while the target does not move' },
  },
  {
    name: 'Wordless Barrier',
    level: 'Cantrip',
    tags: ['Utility', 'Crystal'],
    description:
      'AoE, Casting Time: 1 min. Concentration: up to 10 minutes. Conjure a barrier around a 5x5 (or smaller) area; no sound can be created or heard within it.',
    stats: { 'Casting Time': '1 minute', Target: 'AoE', Concentration: 'Up to 10 minutes', Effect: 'No sound created or heard within a 5x5 area' },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// SAND SPELLS
// ─────────────────────────────────────────────────────────────────────────
const SAND_SPELLS: SpellSeed[] = [
  {
    name: 'Pocket Sand',
    level: 'Cantrip',
    tags: ['Sand'],
    description:
      '1 Action, Single Target. Reach: 4. Damage: 1d6 piercing (ignoring armor). On hit: target moves 1 space away from you. High Levels: +2 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '4', Damage: '1d6 piercing (ignoring armor)', 'On Hit': 'Target moves 1 space away' },
  },
  {
    name: 'Sandblast',
    level: 'Cantrip',
    tags: ['Sand'],
    description:
      "Can only be cast on Dusted targets, ending the condition. 1 Action, Single Target. Reach: 6. Damage: 4d6 slashing — if the target is an ally, it gains 2d6+KEY temp HP instead. High Levels: +2 Reach every 5 levels. Dusted: by an ally, immune to difficult terrain; by an enemy, Slowed. A creature loses this condition if it is Soaked in water.",
    stats: { Actions: '1', Target: 'Single Target', Reach: '6', Damage: '4d6 slashing (or 2d6+KEY temp HP to an allied target)', Requirement: 'Target must be Dusted (ends the condition)' },
  },
  {
    name: 'Sandstone',
    level: 'Tier 1',
    tags: ['Sand'],
    description:
      '2 Actions, Single Target+. Reach: 8. Damage: 2d8 bludgeoning. On hit: a pillar forms under the target, pushing it 1 space to the side; adjacent creatures are then Dusted. The pillar breaks if it takes damage. Upcast: +1 target.',
    stats: { Actions: '2', Target: 'Single Target+', Reach: '8', Damage: '2d8 bludgeoning', 'On Hit': 'Pillar pushes target aside; adjacent creatures Dusted', Upcast: '+1 target' },
  },
  {
    name: 'Conviction',
    level: 'Tier 2',
    tags: ['Sand'],
    description:
      'Can only be cast on Dusted targets, ending the condition. 1 Action, Single Target+. Reach: 8. Target is Restrained until they escape. High Levels: +1 target.',
    stats: { Actions: '1', Target: 'Single Target+', Reach: '8', Effect: 'Restrained until they escape', Requirement: 'Target must be Dusted (ends the condition)' },
  },
  {
    name: 'Desert',
    level: 'Tier 2',
    tags: ['Sand'],
    description:
      '2 Actions, AoE. Concentration: up to 1 minute. Reach: 8. Disperse the ground in 16 contiguous spaces within Reach. Creatures in the area when you conjure it are Dusted. If a creature lays prone on this space, it becomes Dusted. Upcast: +5 spaces.',
    stats: { Actions: '2', Target: 'AoE', Reach: '8', Concentration: 'Up to 1 minute', Effect: 'Creatures in a 16-space area (or lying prone on it) become Dusted', Upcast: '+5 spaces' },
  },
  {
    name: 'Shifting Dune',
    level: 'Tier 3',
    tags: ['Sand'],
    description:
      '2 Actions, AoE. Line: 8. Creatures in line take 2d12+12 bludgeoning damage and are Dusted on a failed DEX save. Half damage on save. Upcast: +1 width.',
    stats: { Actions: '2', Target: 'AoE', Line: '8', Damage: '2d12+12 bludgeoning', Save: 'DEX (half on save, still Dusted on fail)', Upcast: '+1 width' },
  },
  {
    name: 'Mirage',
    level: 'Tier 4',
    tags: ['Sand'],
    description:
      'Castable only while Defending. 0 Actions, Self. Reaction: when attacked, the attack misses instead (sand sculpture) and you move adjacently. Upcast: +2 Range.',
    stats: { Actions: '0 (Reaction)', Target: 'Self', Requirement: 'Castable only while Defending', Effect: 'Attack misses (sand sculpture) and you move adjacently', Upcast: '+2 Range' },
  },
  {
    name: 'Quicksand',
    level: 'Tier 5',
    tags: ['Sand'],
    description:
      '2 Actions, AoE. Reach: 6. Enemies within a 2x2 area must repeat a DEX save until they succeed. For each time they fail, they suffer 1d8 bludgeoning damage and are Restrained until the end of their next turn. Upcast: +1 area.',
    stats: { Actions: '2', Target: 'AoE', Reach: '6', Damage: '1d8 bludgeoning per failed save', Save: 'DEX (repeated until success)', Upcast: '+1 area' },
  },
  {
    name: 'Sarcophagus',
    level: 'Tier 6',
    tags: ['Sand'],
    description:
      'Can only be cast on Dusted targets, ending the condition. 2 Actions, Single Target+. Range: 8. Damage: d66+30. On hit: Dazed. Upcast: +1 target.',
    stats: { Actions: '2', Target: 'Single Target+', Range: '8', Damage: 'd66+30', 'On Hit': 'Dazed', Requirement: 'Target must be Dusted (ends the condition)', Upcast: '+1 target' },
  },
  {
    name: 'Sandstorm',
    level: 'Tier 9',
    tags: ['Sand'],
    description:
      'Concentration: up to 1 minute. Reach: 12. 3 Actions, AoE. Creatures within reach are Dusted on the start of their turn. At the end of each of your turns, all creatures within reach suffer the effects of Sandblast. Once you cast this spell, you must Safe Rest for 1 week before you can use it again.',
    stats: {
      Actions: '3',
      Target: 'AoE',
      Reach: '12',
      Concentration: 'Up to 1 minute',
      Effect: 'Creatures Dusted at start of turn; suffer Sandblast at end of each of your turns',
      Restriction: 'Safe Rest 1 week between casts',
    },
  },
];

const SAND_UTILITY_SPELLS: SpellSeed[] = [
  {
    name: 'Detritus',
    level: 'Cantrip',
    tags: ['Utility', 'Sand'],
    description: '1 Action. Cause a simple mechanism or tool that you touch to either jam or malfunction for 1 minute.',
    stats: { Actions: '1', Duration: '1 minute', Effect: 'Jams or malfunctions a touched mechanism or tool' },
  },
  {
    name: 'Dustform',
    level: 'Cantrip',
    tags: ['Utility', 'Sand'],
    description: 'Self, Casting Time: 1 min. Become a pile of sand for up to 10 minutes.',
    stats: { 'Casting Time': '1 minute', Target: 'Self', Duration: 'Up to 10 minutes', Effect: 'Become a pile of sand' },
  },
  {
    name: 'Sandbox',
    level: 'Cantrip',
    tags: ['Utility', 'Sand'],
    description:
      'Casting Time: 1 min. Form a simple tiny object with a shape and appearance to your liking. It works exactly like you intended it to but lacks physical integrity, breaking quite easily.',
    stats: { 'Casting Time': '1 minute', Effect: 'Forms a fragile, tiny sand object of your choosing' },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// SUMMONING SPELLS
// ─────────────────────────────────────────────────────────────────────────
const SUMMONING_SPELLS: SpellSeed[] = [
  {
    name: 'Flyby',
    level: 'Cantrip',
    tags: ['Summoning'],
    description:
      '1 Action, Single Target. Range: 8. Damage: 1d8. On hit: also damages 1 adjacent target. High Levels: +4 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '8', Damage: '1d8', 'On Hit': 'Also damages 1 adjacent target' },
  },
  {
    name: 'Ram',
    level: 'Cantrip',
    tags: ['Summoning'],
    description: '1 Action, Single Target. Reach: 3. Damage: 1d12. On crit: prone. High Levels: +6 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '3', Damage: '1d12', 'On Crit': 'Prone' },
  },
  {
    name: 'Summon Warrior',
    level: 'Tier 1',
    tags: ['Summoning'],
    description:
      "2 Actions, Special. Concentration: up to 1 minute. Reach: 2. Summon a Small or Medium warrior to your aid: 3×KEY HP. Teamwork: adjacent allies attack with advantage. Strike: 1d6+KEY. Upcast: +9 HP and increment its die size by 1 (max d12).",
    stats: {
      Actions: '2',
      Target: 'Special',
      Reach: '2',
      Concentration: 'Up to 1 minute',
      Effect: 'Summons a warrior — 3×KEY HP; Teamwork: adjacent allies attack with advantage; Strike: 1d6+KEY',
      Upcast: '+9 HP, increment die size by 1 (max d12)',
    },
  },
  {
    name: 'Summon Ranger',
    level: 'Tier 1',
    tags: ['Summoning'],
    description:
      "2 Actions, Special. Concentration: up to 1 minute. Reach: 2. Summon a Small or Medium ranger to your aid: KEY HP. Steady: instead of moving on its turn, it may double its attack range. Projectile (Range 4): 1d4+KEY. Upcast: +KEY HP and increment its die size by 1 (max d12).",
    stats: {
      Actions: '2',
      Target: 'Special',
      Reach: '2',
      Concentration: 'Up to 1 minute',
      Effect: 'Summons a ranger — KEY HP; Steady: may double attack range instead of moving; Projectile (Range 4): 1d4+KEY',
      Upcast: '+KEY HP, increment die size by 1 (max d12)',
    },
  },
  {
    name: 'Summon Annoyance',
    level: 'Tier 2',
    tags: ['Summoning'],
    description:
      '2 Actions, Single Target+. Reach: 6. Damage: 3d6. Summon a tiny creature on top of an enemy. The target takes damage again every turn until it deals any damage to the summon. Upcast: +1 target.',
    stats: { Actions: '2', Target: 'Single Target+', Reach: '6', Damage: '3d6', Effect: 'Target retakes damage each turn until it damages the summon', Upcast: '+1 target' },
  },
  {
    name: 'Summon Support',
    level: 'Tier 3',
    tags: ['Summoning'],
    description:
      '2 Actions, Single Target+. Reach: 4. Choose a creature within range: you summon a small creature to aid the target. Target gains 20 temp HP. Upcast: +1 reach.',
    stats: { Actions: '2', Target: 'Single Target+', Reach: '4', Effect: 'Target gains 20 temp HP', Upcast: '+1 reach' },
  },
  {
    name: 'Summon Hoard',
    level: 'Tier 4',
    tags: ['Summoning'],
    description:
      "3 Actions, Special. Concentration: up to 1 minute. Reach: 2. Summon 10 Small or Medium minions to aid you in battle. Hoardling Summon (Lvl 1/4): Strike: 1d6 (follows minion rules). Upcast: +1 hoardling minion.",
    stats: {
      Actions: '3',
      Target: 'Special',
      Reach: '2',
      Concentration: 'Up to 1 minute',
      Effect: 'Summons 10 hoardling minions (Lvl 1/4; Strike: 1d6, follows minion rules)',
      Upcast: '+1 hoardling minion',
    },
  },
  {
    name: 'Summon Guardian',
    level: 'Tier 5',
    tags: ['Summoning'],
    description:
      "2 Actions, Special. Concentration: up to 1 minute. Reach: 2. Summon a Medium or Large guardian to aid you in battle: 10×KEY HP. Behind me: can be used as full cover. Bash: 2d8+KEY, on crit Prone. Upcast: +20 hitpoints and increment its die size by 1 (max d12).",
    stats: {
      Actions: '2',
      Target: 'Special',
      Reach: '2',
      Concentration: 'Up to 1 minute',
      Effect: 'Summons a guardian — 10×KEY HP; Behind me: usable as full cover; Bash: 2d8+KEY, Prone on crit',
      Upcast: '+20 HP, increment die size by 1 (max d12)',
    },
  },
  {
    name: 'Summon Swarm',
    level: 'Tier 6',
    tags: ['Summoning'],
    description:
      '2 Actions, AoE. Reach: 4. Damage: 4d6 to enemies within Reach. If any die rolls the max against a target, this counts as a crit. On crit: Dazed.',
    stats: { Actions: '2', Target: 'AoE', Reach: '4', Damage: '4d6', 'On Crit': 'Dazed (triggered by a max-value die)' },
  },
  {
    name: 'Summon Monster',
    level: 'Tier 7',
    tags: ['Summoning'],
    description:
      "3 Actions, Special. Reach: 2. Summon a Huge creature to aid you in battle for 1 minute, then it vanishes: 25×KEY HP. Freedom: every turn roll a d10 — on a miss, provide this statblock to your GM. Big Bad: advantage vs. smaller creatures. Destroy: 4d6+LVL, on crit Grappled. Shred: 2d8+LVL to all enemies within Reach 2. Upcast: +25 hitpoints and increment its die size by 1 (max d12).",
    stats: {
      Actions: '3',
      Target: 'Special',
      Reach: '2',
      Duration: '1 minute',
      Effect: 'Summons a Huge monster — 25×KEY HP; Freedom: d10 each turn (miss hands the statblock to the GM); Big Bad: advantage vs. smaller creatures; Destroy: 4d6+LVL (Grappled on crit); Shred: 2d8+LVL to enemies within Reach 2',
      Upcast: '+25 HP, increment die size by 1 (max d12)',
    },
  },
];

const SUMMONING_UTILITY_SPELLS: SpellSeed[] = [
  {
    name: 'Summon Mount',
    level: 'Cantrip',
    tags: ['Utility', 'Summoning'],
    description:
      'Casting Time: 1 min. Reach: 2. You summon a Medium or Large creature to aid you in travel for up to 1 hour: 3×KEY HP, Speed 12.',
    stats: { 'Casting Time': '1 minute', Reach: '2', Duration: 'Up to 1 hour', Effect: 'Summons a mount — 3×KEY HP, Speed 12' },
  },
  {
    name: 'Summon Scout',
    level: 'Cantrip',
    tags: ['Utility', 'Summoning'],
    description:
      'Casting Time: 1 min. Reach: 2. You summon a Tiny or Small creature to do one simple task that a well-trained pet could execute.',
    stats: { 'Casting Time': '1 minute', Reach: '2', Effect: 'Summons a creature to perform one simple, pet-like task' },
  },
  {
    name: 'Summon Tracker',
    level: 'Cantrip',
    tags: ['Utility', 'Summoning'],
    description:
      '1 Action. Reach: 2. You summon a tiny creature which will take a firm hold against an object or creature you touch. It remains latched to the target for 10 minutes.',
    stats: { Actions: '1', Reach: '2', Duration: '10 minutes', Effect: 'Summons a tiny tracker that latches onto a touched target' },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// WATER SPELLS
// ─────────────────────────────────────────────────────────────────────────
const WATER_SPELLS: SpellSeed[] = [
  {
    name: 'Water Blast',
    level: 'Cantrip',
    tags: ['Water'],
    description:
      '1 Action (up to 3), Single Target+. Reach: 3. Damage: 1d4 bludgeoning. Spend +1 action to target an additional creature in range. High Levels: +2 damage every 5 levels.',
    stats: { Actions: '1 (up to 3)', Target: 'Single Target+', Reach: '3', Damage: '1d4 bludgeoning', Effect: '+1 action targets an additional creature' },
  },
  {
    name: 'Vortex Lash',
    level: 'Cantrip',
    tags: ['Water'],
    description:
      '2 Actions (up to 4), Single Target. Reach: 1. Damage: 3d10 slashing. On hit: Soaked. Spend +1 action to gain +1 reach. High Levels: +5 damage every 5 levels. Soaked: ends both Dusted and Smoldering conditions; vulnerable to Lightning damage, which ends the condition.',
    stats: { Actions: '2 (up to 4)', Target: 'Single Target', Reach: '1', Damage: '3d10 slashing', 'On Hit': 'Soaked', Effect: '+1 action grants +1 reach' },
  },
  {
    name: 'Rain',
    level: 'Tier 1',
    tags: ['Water'],
    description:
      '2 Actions (up to 3), AoE. Reach: 6. Invoke rain in 6 contiguous spaces. Creatures in the area suffer KEY acid damage and are Soaked. Spend +1 action to gain +1 area or +2 reach. Upcast: +1 area or +2 reach.',
    stats: { Actions: '2 (up to 3)', Target: 'AoE', Reach: '6', Damage: 'KEY acid', Effect: 'Creatures in the area are Soaked', Upcast: '+1 area or +2 reach' },
  },
  {
    name: 'Defensive Torrent',
    level: 'Tier 1',
    tags: ['Water'],
    description:
      '1 Action, Single Target. Concentration: 1 minute. Touch a creature, grant Soaked condition, +10 armor, and 1 disadvantage on DEX saves. Upcast: +4 reach.',
    stats: { Actions: '1', Target: 'Single Target', Concentration: '1 minute', Effect: 'Grants Soaked, +10 armor, disadvantage on DEX saves', Upcast: '+4 reach' },
  },
  {
    name: 'Clashing Tide',
    level: 'Tier 2',
    tags: ['Water'],
    description:
      '1 Action (up to 6), AoE. Line: 6. Damage: 1d12+12 bludgeoning. Creatures in line are Soaked and moved 1 space away. Spend +1 action to deal +1 damage die. Upcast: +2 reach or +1 width.',
    stats: { Actions: '1 (up to 6)', Target: 'AoE', Line: '6', Damage: '1d12+12 bludgeoning', Effect: 'Soaked and moved 1 space away', Upcast: '+2 reach or +1 width' },
  },
  {
    name: 'Geyser',
    level: 'Tier 3',
    tags: ['Water'],
    description:
      '1 Action (up to 6), AoE. Reach: 6. Creatures in a 2x2 area within Reach take 1d10 fire damage. The area is then covered with Fog (creatures inside are Blind) until the end of your next turn. Spend +1 action to gain +1 area. Upcast: +1 damage die.',
    stats: { Actions: '1 (up to 6)', Target: 'AoE', Reach: '6', Damage: '1d10 fire', Effect: 'Area covered in Fog (Blind) until end of your next turn', Upcast: '+1 damage die' },
  },
  {
    name: 'Whirlpool',
    level: 'Tier 4',
    tags: ['Water'],
    description:
      '1 Action (up to 3), AoE. Reach: 2. Others within Reach take 2d8+10 slashing damage and fall prone on a failed STR save. Half damage on save. Soaked creatures roll with disadvantage. Spend +1 action to gain +2 reach. Upcast: +4 damage.',
    stats: { Actions: '1 (up to 3)', Target: 'AoE', Reach: '2', Damage: '2d8+10 slashing', Save: 'STR (half on save)', Upcast: '+4 damage' },
  },
  {
    name: 'Imprisoning Wave',
    level: 'Tier 5',
    tags: ['Water'],
    description:
      '3 Actions (up to 6), Single Target. Reach: 3. Choose a creature within reach. On a failed DEX save, target suffers 2d10+10 force damage, is Soaked, and Incapacitated until the end of its next turn. Half damage on save. Spend +1 action to gain +10 damage. Upcast: +1 reach.',
    stats: { Actions: '3 (up to 6)', Target: 'Single Target', Reach: '3', Damage: '2d10+10 force', Save: 'DEX (half on save)', Upcast: '+1 reach' },
  },
  {
    name: 'Cascade',
    level: 'Tier 6',
    tags: ['Water'],
    description:
      '2 Actions, Special. Reach: 6. Invoke a mighty outpouring of water in 6 contiguous spaces within reach, tall enough to cover huge creatures. Ranged attacks against targets beyond the wall have disadvantage. A creature attempting to traverse the wall must make a STR save or fall prone. Upcast: +2 reach.',
    stats: { Actions: '2', Target: 'Special', Reach: '6', Effect: 'Wall of water blocking ranged attacks; STR save to cross or fall prone', Upcast: '+2 reach' },
  },
  {
    name: 'Flood',
    level: 'Tier 7',
    tags: ['Water'],
    description:
      '3 Actions, AoE. Concentration: up to 1 minute. Reach: 10. Create a 10x10 area of shallow water with Reach. Creatures that enter these spaces are Soaked. While inside this area, you cast water spells as if you spent 3 additional actions to cast.',
    stats: { Actions: '3', Target: 'AoE', Reach: '10', Concentration: 'Up to 1 minute', Effect: 'Creatures entering are Soaked; water spells cast as if +3 actions spent while inside' },
  },
];

const WATER_UTILITY_SPELLS: SpellSeed[] = [
  {
    name: 'Water Play',
    level: 'Cantrip',
    tags: ['Utility', 'Water'],
    description: '1 Action. Create: conjure up to 1 pool of either fresh or salt water. OR: Control: manipulate up to a pool of water.',
    stats: { Actions: '1', Effect: 'Conjures or manipulates a pool of water' },
  },
  {
    name: 'Lunar Blessing',
    level: 'Cantrip',
    tags: ['Utility', 'Water'],
    description:
      'Single Target, Casting Time: 1 min. Diver: a creature you touch gains the ability to breathe underwater and a swimming speed for 1 hour. OR: Strider: a creature you touch gains the ability to walk on water for 1 hour.',
    stats: { 'Casting Time': '1 minute', Target: 'Single Target', Duration: '1 hour', Effect: 'Water breathing + swim speed, or walking on water' },
  },
  {
    name: 'Forecast',
    level: 'Cantrip',
    tags: ['Utility', 'Water'],
    description:
      'Casting Time: 1 hour. Disperse: bad weather. OR: Form: clouds, mist, rain, or even snow. The weather is altered within 1 mile of you and lasts for 1 day.',
    stats: { 'Casting Time': '1 hour', Range: '1 mile', Duration: '1 day', Effect: 'Disperses bad weather, or forms clouds/mist/rain/snow' },
  },
];

// ─────────────────────────────────────────────────────────────────────────
// SECRET SPELLS (tagged to their respective school)
// ─────────────────────────────────────────────────────────────────────────
const SECRET_SPELLS: SpellSeed[] = [
  {
    name: 'Starry Night',
    level: 'Tier 1',
    tags: ['Secret', 'Astral'],
    description: '3 actions. Create multiple starry particles capable of enlightening a completely dark room for 1 minute.',
    stats: { Actions: '3', Duration: '1 minute', Effect: 'Lights a completely dark room' },
  },
  {
    name: 'Fragments of Time',
    level: 'Tier 9',
    tags: ['Secret', 'Crystal'],
    description:
      'Casting time: 1 hour. You shatter a really expensive crystal into fragments. Looking into these shards allows a person to observe possible outcomes of a near future.',
    stats: { 'Casting Time': '1 hour', Effect: 'Shattered crystal shards reveal possible near-future outcomes' },
  },
  {
    name: 'Sand Clone',
    level: 'Tier 9',
    tags: ['Secret', 'Sand'],
    description:
      'Casting time: 1 hour. You create an exact sand copy of a creature you touch. It carries a copy of all of its equipment and is capable of everything that the original is capable of. It remains alive until it either takes damage or a new clone is made. Any object left behind by the clone vanishes.',
    stats: { 'Casting Time': '1 hour', Effect: 'Creates a fully capable sand copy of a touched creature; ends on damage or replacement' },
  },
  {
    name: 'Summon Assassin',
    level: 'Tier 3',
    tags: ['Secret', 'Summoning'],
    description:
      'Casting time: 1 hour. Summon a Tiny creature to murder an enemy. It will attempt to find and poison your target. Target must repeat a STR save until they succeed. Heroes: for each time they fail, they suffer 2 Wounds. Monsters: for each time they fail, they suffer 2d10 poison damage.',
    stats: { 'Casting Time': '1 hour', Save: 'STR (repeated until success)', Effect: 'Poisons target — Heroes: 2 Wounds per fail; Monsters: 2d10 poison damage per fail' },
  },
  {
    name: 'Drown',
    level: 'Tier 8',
    tags: ['Secret', 'Water'],
    description:
      '3 actions. Choose a creature within Reach 4. Target must repeat a STR save until they succeed. For each time they failed, they suffer 1 Wound.',
    stats: { Actions: '3', Reach: '4', Save: 'STR (repeated until success)', Effect: '1 Wound per failed save' },
  },
  {
    name: 'Sink',
    level: 'Tier 2',
    tags: ['Secret', 'Water'],
    description:
      '3 actions. Enemies within Reach 4 must make a STR save or fall prone. Soaked creatures roll with disadvantage.',
    stats: { Actions: '3', Reach: '4', Save: 'STR or fall prone', Effect: 'Soaked creatures save with disadvantage' },
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

  // Idempotency guard: prevent re-seeding if spells already exist under this source.
  const { data: existing, error: existingError } = await client
    .from('spells')
    .select('id')
    .eq('source_id', sourceId)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing spells: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error(`${SOURCE_NAME} spells already seeded. Delete existing rows for this source before re-running this script.`);
  }

  const groups: { label: string; spells: SpellSeed[] }[] = [
    { label: 'Astral', spells: ASTRAL_SPELLS },
    { label: 'Astral Utility', spells: ASTRAL_UTILITY_SPELLS },
    { label: 'Crystal', spells: CRYSTAL_SPELLS },
    { label: 'Crystal Utility', spells: CRYSTAL_UTILITY_SPELLS },
    { label: 'Sand', spells: SAND_SPELLS },
    { label: 'Sand Utility', spells: SAND_UTILITY_SPELLS },
    { label: 'Summoning', spells: SUMMONING_SPELLS },
    { label: 'Summoning Utility', spells: SUMMONING_UTILITY_SPELLS },
    { label: 'Water', spells: WATER_SPELLS },
    { label: 'Water Utility', spells: WATER_UTILITY_SPELLS },
    { label: 'Secret', spells: SECRET_SPELLS },
  ];

  let created = 0;
  for (const group of groups) {
    for (const spell of group.spells) {
      await createSpell(client, {
        ...spell,
        system_id: SYSTEM_ID,
        source_id: sourceId,
        is_homebrew: true,
      });
      created += 1;
    }
  }

  const summary = groups.map((g) => `${g.label}: ${g.spells.length}`).join(', ');
  console.log(`Seeded ${created} Oak's Nimble Expansion spells (${summary}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
