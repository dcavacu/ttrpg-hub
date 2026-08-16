import { createSupabaseClient } from '../lib/supabase/client';
import { createSpell, type SpellInput } from '../lib/content/spells';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056';
const SOURCE_ID = '75824afb-fb75-46a6-886e-f0f8320e4600';

type SpellSeed = Omit<SpellInput, 'system_id' | 'source_id' | 'is_homebrew'>;

const SPELLS: SpellSeed[] = [
  // ─────────────────────────────── FIRE SPELLS ───────────────────────────────
  {
    name: 'Flame Dart',
    level: 'Cantrip',
    tags: ['Fire'],
    description:
      '1 Action, Single Target. Range: 8. Damage: 1d10. On crit: inflicts Smoldering. High Levels: +5 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '8', Damage: '1d10', 'On Crit': 'Smoldering' },
  },
  {
    name: "Heart's Fire",
    level: 'Cantrip',
    tags: ['Fire'],
    description:
      '1 Action, Single Target. Range: 4. Give an ally within Range an extra action. Spend 1 mana to cast this when it is not your turn. High Levels: +1 Range every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '4', Effect: 'Grants an ally an extra action' },
  },
  {
    name: 'Ignite',
    level: 'Tier 1',
    tags: ['Fire'],
    description:
      '2 Actions, Single Target. Range: 8. Damage: 4d10 to a Smoldering target, ending the condition on hit. Upcast: +10 damage.',
    stats: { Actions: '2', Target: 'Single Target', Range: '8', Damage: '4d10', Upcast: '+10 damage' },
  },
  {
    name: 'Enchant Weapon',
    level: 'Tier 2',
    tags: ['Fire'],
    description:
      '1 Action, Single Target. Concentration: up to 1 minute. A weapon you touch is enchanted with magical flame. It deals +KEY damage and inflicts Smoldering on crit. Upcast: +KEY damage.',
    stats: { Actions: '1', Target: 'Single Target', Concentration: 'Up to 1 minute', Effect: '+KEY damage, Smoldering on crit', Upcast: '+KEY damage' },
  },
  {
    name: 'Flame Barrier',
    level: 'Tier 3',
    tags: ['Fire'],
    description:
      '1 Action, Self. Reaction: when attacked, Defend for free. Until the start of your next turn, melee attackers against you take KEY damage (ignoring armor) and gain Smoldering. Upcast: +KEY damage. (Defend: if you have already Defended this round, you cannot use abilities requiring it again, even for free.)',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Damage: 'KEY (ignoring armor) to melee attackers', Upcast: '+KEY damage' },
  },
  {
    name: 'Pyroclasm',
    level: 'Tier 4',
    tags: ['Fire'],
    description:
      "2 Actions, AoE. Reach: 3. Others within Reach take 2d20+10 damage (ignoring armor) on a failed DEX save; half damage on save. Smoldering creatures automatically fail their save. Upcast: +1 Reach, +2 damage.",
    stats: { Actions: '2', Target: 'AoE', Reach: '3', Damage: '2d20+10', Save: 'DEX', Upcast: '+1 Reach, +2 damage' },
  },
  {
    name: 'Fiery Embrace',
    level: 'Tier 5',
    tags: ['Fire'],
    description:
      '2 Actions, AoE. Concentration: up to 1 minute. Reach: 8. While within Reach: 1 ally gains the effects of Enchant Weapon. Enemies gain Smoldering, lose damage resistance, and their damage immunity is reduced to resistance. Upcast: +1 ally.',
    stats: { Actions: '2', Target: 'AoE', Reach: '8', Concentration: 'Up to 1 minute', Upcast: '+1 ally' },
  },
  {
    name: 'Living Inferno',
    level: 'Tier 7',
    tags: ['Fire'],
    description:
      '3 Actions, Self. Gain the effects of Flame Barrier until your next turn. At the end of this turn and your next turn, cast Pyroclasm for free. Upcast: upcast both Flame Barrier and Pyroclasm.',
    stats: { Actions: '3', Target: 'Self', Effect: 'Free Flame Barrier + free Pyroclasm casts', Upcast: 'Upcasts both component spells' },
  },
  {
    name: 'Dragonform',
    level: 'Tier 9',
    tags: ['Fire'],
    description:
      '5 Actions, Self. Transform into a Huge dragon. Gain 3 actions, a fly speed of 12, LVL Armor, and 10×LVL temp HP, plus two abilities: Tooth & Claw (Action, Reach 2: 1d20+LVL damage ignoring armor, inflicts Smoldering) and Immolating Breath (2 Actions, Reach: Cone 8: DC 20 DEX save, KEY d20 damage, half on save; Smoldering targets automatically fail). You can maintain this form as long as the temp HP granted by this spell remain (max 10 minutes); when it ends, you drop to 0 HP.',
    stats: { Actions: '5', Target: 'Self', Duration: 'Until temp HP runs out (max 10 minutes)', Effect: '3 actions, fly 12, LVL Armor, 10×LVL temp HP' },
  },

  // ─────────────────────────────── ICE SPELLS ───────────────────────────────
  {
    name: 'Ice Lance',
    level: 'Cantrip',
    tags: ['Ice'],
    description:
      '1 Action, Single Target. Range: 12. Damage: 1d6 cold or piercing damage. On hit: Slowed. High Levels: +3 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '12', Damage: '1d6', 'On Hit': 'Slowed' },
  },
  {
    name: 'Snowblind',
    level: 'Cantrip',
    tags: ['Ice'],
    description:
      '1 Action, Single Target. Reach: 1. Damage: 1d6. On hit: Blinded until the end of their next turn. High Levels: +3 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '1', Damage: '1d6', 'On Hit': 'Blinded until end of next turn' },
  },
  {
    name: 'Frost Shield',
    level: 'Tier 1',
    tags: ['Ice'],
    description:
      '1 Action, Self. Reaction: when attacked, gain 2×KEY temp HP and Defend for free. The ice melts and these temp HP are lost at the start of your next turn. Upcast: +2×KEY temp HP.',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Effect: '2×KEY temp HP + free Defend', Upcast: '+2×KEY temp HP' },
  },
  {
    name: 'Shatter',
    level: 'Tier 2',
    tags: ['Ice'],
    description:
      '2 Actions, Single Target. Range: 12. Damage: 3d6. If any die rolls the max against a Hampered target, this counts as a crit; on crit: +20 damage. Upcast: increase the result of any one die by 1, and +5 damage on crit.',
    stats: { Actions: '2', Target: 'Single Target', Range: '12', Damage: '3d6 (+20 on crit)', Upcast: '+1 to a die result, +5 damage on crit' },
  },
  {
    name: 'Cryosleep',
    level: 'Tier 3',
    tags: ['Ice'],
    description:
      '2 Actions, AoE. Reach: 12. Creatures in a 2×2 area within Reach are Dazed. On a failed STR save, they fall asleep instead, becoming Incapacitated until two of their turns have passed, until damaged, or until an ally uses an action to wake them. Upcast: +1 area, +1 turn asleep.',
    stats: { Actions: '2', Target: 'AoE (2x2)', Reach: '12', Save: 'STR', Upcast: '+1 area, +1 turn asleep' },
  },
  {
    name: 'Rimeblades',
    level: 'Tier 4',
    tags: ['Ice'],
    description:
      "3 Actions, AoE. Concentration: up to 1 minute. Reach: 12. Conjure razor-sharp icy spikes in 5 contiguous spaces within Reach; this area is difficult terrain. Creatures that enter these spaces (or who are in the area when you conjure them) suffer 2d6 damage for each space they touch. Upcast: +1 space, +1 damage.",
    stats: { Actions: '3', Target: 'AoE (5 contiguous spaces)', Reach: '12', Concentration: 'Up to 1 minute', Damage: '2d6 per space touched', Upcast: '+1 space, +1 damage' },
  },
  {
    name: 'Arctic Blast',
    level: 'Tier 5',
    tags: ['Ice'],
    description:
      '2 Actions, AoE. Reach: Cone 4. Damage: 4d6+10 damage. This area is difficult terrain until the end of your next turn. Surviving creatures must make a STR save or be frozen in place (Restrained) until the end of their next turn; creatures already Hampered are Incapacitated for 1 turn instead. Upcast: +1 Reach.',
    stats: { Actions: '2', Target: 'AoE (Cone)', Reach: '4', Damage: '4d6+10', Save: 'STR', Upcast: '+1 Reach' },
  },
  {
    name: 'Glacier Strike',
    level: 'Tier 8',
    tags: ['Ice'],
    description:
      '3 Actions, AoE. Range: 12. Damage: d66 bludgeoning to creatures in a 3×3 area; creatures adjacent to that area take half as much. The entire area permanently becomes difficult terrain. Upcast: +1 initial area. (d66: roll 2d6, leftmost die is the tens place, e.g. 4 and 5 deal 45 damage.)',
    stats: { Actions: '3', Target: 'AoE (3x3)', Range: '12', Damage: 'd66 bludgeoning', Upcast: '+1 initial area' },
  },
  {
    name: 'Arctic Annihilation',
    level: 'Tier 9',
    tags: ['Ice'],
    description:
      '3 Actions, AoE. Reach: 12. Choose any number of objects or willing creatures within Reach to encase in ice; they are Incapacitated and immune to damage and negative effects until the start of their next turn. All other creatures and objects within Reach take d66 damage. Any surviving creature that took this damage must make a STR save or be Incapacitated for 1 round. Once you cast this spell, you must Safe Rest for 1 week before using it again.',
    stats: { Actions: '3', Target: 'AoE', Reach: '12', Damage: 'd66', Save: 'STR', Restriction: 'Safe Rest 1 week between casts' },
  },

  // ─────────────────────────────── LIGHTNING SPELLS ───────────────────────────────
  {
    name: 'Zap',
    level: 'Cantrip',
    tags: ['Lightning'],
    description:
      '1 Action, Single Target. Range: 12. Damage: 2d8. On miss: the lightning fails to find ground and strikes you instead. High Levels: +6 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '12', Damage: '2d8', 'On Miss': 'Strikes caster instead' },
  },
  {
    name: 'Overload',
    level: 'Cantrip',
    tags: ['Lightning'],
    description:
      '1 Action, AoE. Castable only if you are Charged, ending the condition. Reach: 2. Damage: 2d8 to others within Reach. High Levels: +4 damage every 5 levels.',
    stats: { Actions: '1', Target: 'AoE', Reach: '2', Damage: '2d8', Requirement: 'Must be Charged' },
  },
  {
    name: 'Arc Lightning',
    level: 'Tier 1',
    tags: ['Lightning'],
    description:
      '2 Actions, Single Target. Range: 12. Damage: 3d8. The bolt also damages the next closest creature to your target (if you or an ally is next closest, they are hit instead; GM breaks ties by who is wearing the most metal). On miss: the lightning fails to find ground and strikes you instead. Upcast: +4 damage.',
    stats: { Actions: '2', Target: 'Single Target', Range: '12', Damage: '3d8 (also hits next closest creature)', Upcast: '+4 damage' },
  },
  {
    name: 'Alacrity',
    level: 'Tier 2',
    tags: ['Lightning'],
    description:
      '1 Action, Self. Range: 4. Reaction: when attacked, Defend for free. After damage is dealt, you gain the Charged condition then teleport anywhere within Range. Upcast: +4 Range.',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Range: '4', Effect: 'Free Defend + Charged + teleport', Upcast: '+4 Range' },
  },
  {
    name: 'Stormlash',
    level: 'Tier 3',
    tags: ['Lightning'],
    description:
      '2 Actions, AoE. Line: 12. Damage: 3d8+4 (ignoring metal armor). Surviving creatures are Dazed on a failed STR save, or Incapacitated for 1 of their turns instead if they fail by 5 or more. Creatures with a large amount of metal (e.g., armor or a longsword) roll with disadvantage. Upcast: +4 damage.',
    stats: { Actions: '2', Target: 'AoE (Line)', Line: '12', Damage: '3d8+4 (ignores metal armor)', Save: 'STR', Upcast: '+4 damage' },
  },
  {
    name: 'Electrickery',
    level: 'Tier 4',
    tags: ['Lightning'],
    description:
      '3 Actions, 2 Targets. Range: 8. Reaction: when an ally is attacked, choose another creature within Range to swap places with your ally on a failed WIL save (they become the new target). Costs 1 Action while Charged, ending the condition. Upcast: +2 Range.',
    stats: { Actions: '3 (1 if Charged)', Target: '2 Targets', Range: '8', Save: 'WIL', Upcast: '+2 Range' },
  },
  {
    name: 'Electrocharge',
    level: 'Tier 5',
    tags: ['Lightning'],
    description:
      '2 Actions, Single Target. Concentration: up to 1 minute. A creature you touch gains the Charged condition, +1 max action, +5 armor, 2x speed, and advantage on DEX saves. Upcast: +4 Range.',
    stats: { Actions: '2', Target: 'Single Target', Concentration: 'Up to 1 minute', Effect: '+1 action, +5 armor, 2x speed, adv. on DEX saves', Upcast: '+4 Range' },
  },
  {
    name: 'Ride the Lightning',
    level: 'Tier 6',
    tags: ['Lightning'],
    description:
      "3 Actions, AoE. Teleport up to 12 spaces away to a spot you can see (if a willing creature is there, swap places with them). Adjacent creatures take d88 damage. Surviving creatures must make a STR save or be hurled back 3 spaces, knocked Prone, and deafened for 1 day. Upcast: +1 DC. (d88: roll 2d8, leftmost die is the tens place, e.g. 4 and 5 deal 45 damage.)",
    stats: { Actions: '3', Target: 'AoE / Self teleport', Range: '12 (teleport)', Damage: 'd88 to adjacent creatures', Save: 'STR', Upcast: '+1 DC' },
  },
  {
    name: 'Seething Storm',
    level: 'Tier 9',
    tags: ['Lightning'],
    description:
      '3 Actions, AoE. Concentration: up to 1 minute. Reach: 4. You become a cloud of tempestuous storm: you can fly, move for free once per round, and attacks against you are made with disadvantage. At the end of each of your turns, strike up to 4 creatures within Reach with a bolt of lightning for d88 damage (a creature can only be struck once per round). Maintaining the storm each round costs 3 actions and grants +2 Reach and +2 bolts. Once you cast this spell, you must Safe Rest for 1 week before you can use it again.',
    stats: { Actions: '3', Target: 'AoE', Reach: '4', Damage: 'd88 to up to 4 creatures/turn', Restriction: 'Safe Rest 1 week between casts' },
  },

  // ─────────────────────────────── WIND SPELLS ───────────────────────────────
  {
    name: 'Razor Wind',
    level: 'Cantrip',
    tags: ['Wind'],
    description:
      '1 Action, Single Target. Range: 12. Damage: 1d4 slashing (Vicious: roll 1 additional die whenever you roll crit damage). Also damages up to 1 adjacent target. High Levels: +2 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target (+1 adjacent)', Range: '12', Damage: '1d4 slashing (Vicious)' },
  },
  {
    name: 'Breath of Life',
    level: 'Cantrip',
    tags: ['Wind'],
    description:
      '1 Action, Single Target. Range: 6. Restore 1 HP to a Dying creature. High Levels: +2 Range every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target (Dying)', Range: '6', Effect: 'Restore 1 HP' },
  },
  {
    name: 'Blustery Gale',
    level: 'Tier 1',
    tags: ['Wind'],
    description:
      '2 Actions, Single Target. Range: 12. Damage: 3d4 bludgeoning, with advantage against flying, Small, or Tiny targets. On hit: move a Medium target 2 spaces away (Small/Tiny twice as far, Large half as far, round down). For each die you would roll due to forced movement from this spell, deal +5 damage instead. Upcast: +1 movement.',
    stats: { Actions: '2', Target: 'Single Target', Range: '12', Damage: '3d4 bludgeoning', Upcast: '+1 movement' },
  },
  {
    name: 'Barrier of Wind',
    level: 'Tier 2',
    tags: ['Wind'],
    description:
      '1 Action, Self. Reaction: when attacked at range, Defend for free. Ranged attacks have disadvantage against you this round (including the triggering attack). Upcast: +3 Armor.',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Effect: 'Free Defend, disadvantage on ranged attacks vs. you', Upcast: '+3 Armor' },
  },
  {
    name: 'Fly',
    level: 'Tier 3',
    tags: ['Wind'],
    description:
      '1 Action, Single Target+. Concentration: up to 10 minutes. Touch a creature to grant a flying speed of 12. Upcast: +1 target.',
    stats: { Actions: '1', Target: 'Single Target+', Concentration: 'Up to 10 minutes', Effect: 'Flying speed 12', Upcast: '+1 target' },
  },
  {
    name: 'Eye of the Storm',
    level: 'Tier 4',
    tags: ['Wind'],
    description:
      "2 Actions, AoE. Reach: 3. Damage: 4d4+10 bludgeoning to enemies within Reach. You may place surviving creatures anywhere within 1 space of the storm's Reach on a failed STR save. Upcast: +1 Reach.",
    stats: { Actions: '2', Target: 'AoE', Reach: '3', Damage: '4d4+10 bludgeoning', Save: 'STR', Upcast: '+1 Reach' },
  },
  {
    name: 'Updraft',
    level: 'Tier 5',
    tags: ['Wind'],
    description:
      '3 Actions, AoE. Reach: 12. Enemies within a 5×5 area must repeat a DEX save until they succeed. For each time they fail, they suffer 1d6 falling damage and land prone. Upcast: +2 Range, +1 area.',
    stats: { Actions: '3', Target: 'AoE (5x5)', Reach: '12', Damage: '1d6 falling damage per failed save', Save: 'DEX (repeated)', Upcast: '+2 Range, +1 area' },
  },
  {
    name: 'Thousand Cuts',
    level: 'Tier 6',
    tags: ['Wind'],
    description:
      '3 Actions, AoE. Range: 12. Damage: d44 slashing damage (roll with advantage); also damages enemies within Reach 1 of your target. Upcast: +1 Reach. (d44: roll 3d4 and drop the lowest die; leftmost is the tens place, e.g. 2, 3, 4 deals 34 damage.)',
    stats: { Actions: '3', Target: 'AoE', Range: '12', Damage: 'd44 slashing (advantage)', Upcast: '+1 Reach' },
  },
  {
    name: 'Boisterous Winds',
    level: 'Tier 7',
    tags: ['Wind'],
    description:
      '2 Actions, Multi-target. Concentration: up to 1 minute. You and up to 12 allies within Reach 12 gain: ranged attacks have disadvantage against you, a flying speed of 12, and can move for free once per round. Upcast: +1 minute duration or +2 targets.',
    stats: { Actions: '2', Target: 'Multi-target (up to 12 allies)', Reach: '12', Concentration: 'Up to 1 minute', Upcast: '+1 minute or +2 targets' },
  },
  {
    name: 'Vicious Mockery',
    level: 'Cantrip',
    tags: ['Wind', 'Class-Restricted'],
    description:
      'SONGWEAVER ONLY. 1 Action, Single Target. Range: 12. Damage: 1d4+INT psychic (ignoring armor). On hit: the target is Taunted during their next turn. High Levels: +2 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '12', Damage: '1d4+INT psychic', Class: 'Songweaver only' },
  },

  // ─────────────────────────────── RADIANT SPELLS ───────────────────────────────
  {
    name: 'Rebuke',
    level: 'Cantrip',
    tags: ['Radiant'],
    description:
      '1 Action, Single Target. Reach: 4. Damage: 1d6 (ignoring armor), does not miss. Deals 2x damage against undead or cowardly targets (those Frightened or behind cover). High Levels: +2 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '4', Damage: '1d6 (2x vs undead/cowardly)' },
  },
  {
    name: 'True Strike',
    level: 'Cantrip',
    tags: ['Radiant'],
    description:
      '1 Action, Single Target. Reach: 2. Give a creature advantage on the next attack they make (until the end of their next turn). High Levels: +1 Reach every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '2', Effect: 'Advantage on next attack' },
  },
  {
    name: 'Heal',
    level: 'Tier 1',
    tags: ['Radiant'],
    description:
      '1 Action, Single Target+. Reach: 1. Heal a creature 1d6+KEY HP. Upcast: choose one — +1 target, +4 Reach, or +1d6 healing. If 5+ mana is spent, you may also heal 1 negative condition (e.g., Blind, Poisoned, 1 Wound).',
    stats: { Actions: '1', Target: 'Single Target+', Reach: '1', Healing: '1d6+KEY', Upcast: '+1 target, +4 Reach, or +1d6 healing' },
  },
  {
    name: 'Warding Bond',
    level: 'Tier 2',
    tags: ['Radiant'],
    description:
      '1 Action, Single Target. Designate a willing creature as your ward for 1 minute. They take half damage from all attacks; you are attacked for the other half. Upcast: +1 creature.',
    stats: { Actions: '1', Target: 'Single Target', Duration: '1 minute', Upcast: '+1 creature' },
  },
  {
    name: 'Shield of Justice',
    level: 'Tier 3',
    tags: ['Radiant'],
    description:
      '1 Action, Self. Reaction: when attacked, Defend for free and reflect Radiant damage back at the attacker equal to the amount blocked (ignoring armor). Upcast: +5 Armor.',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Effect: 'Free Defend + reflect blocked damage', Upcast: '+5 Armor' },
  },
  {
    name: 'Condemn',
    level: 'Tier 4',
    tags: ['Radiant'],
    description:
      '2 Actions, Single Target. Reach: 4. Damage: 30. Can only target an enemy that crit you or an ally since your last turn. Cannot be reduced by any means. The next attack against that enemy is made with advantage. Upcast: +1 Reach, +1 advantage.',
    stats: { Actions: '2', Target: 'Single Target', Reach: '4', Damage: '30 (unreducible)', Restriction: 'Only vs. an enemy that crit you/an ally since your last turn' },
  },
  {
    name: 'Vengeance',
    level: 'Tier 5',
    tags: ['Radiant'],
    description:
      '2 Actions, Single Target. Reach: 1. Damage: 1d100, to a creature that attacked a Dying ally or reduced one to 0 HP since your last turn. Upcast: +1 Reach, roll with advantage.',
    stats: { Actions: '2', Target: 'Single Target', Reach: '1', Damage: '1d100', Restriction: 'Only vs. creature that attacked/downed a Dying ally' },
  },
  {
    name: 'Sacrifice',
    level: 'Tier 6',
    tags: ['Radiant'],
    description:
      '1 Action, Special. Reach: 4. Reduce yourself to 0 HP; you cannot have more than 0 HP until you Safe Rest. Heal a number of HP equal to your maximum HP, divided as you choose among any other creatures within Reach. You may revive a creature that died in the past minute if you give them at least 20 HP (also healing 2 Wounds from them), provided they have not been revived with this spell before. Upcast: +4 Reach.',
    stats: { Actions: '1', Target: 'Special', Reach: '4', Effect: 'Heal max HP worth, split among allies; can revive', Upcast: '+4 Reach' },
  },
  {
    name: 'Redeem',
    level: 'Tier 9',
    tags: ['Radiant'],
    description:
      'AoE. Casting Time: 24 hours. Requires a diamond worth at least 10,000 gp, which this spell consumes. Revive any number of deceased creatures you choose within 1 mile that have died in the past year, provided they have not died of old age or been revived with this spell before.',
    stats: { 'Casting Time': '24 hours', Target: 'AoE (1 mile)', Cost: 'Diamond worth 10,000+ gp (consumed)' },
  },
  {
    name: 'Lifebinding Spirit',
    level: 'Tier 1',
    tags: ['Radiant', 'Class-Restricted'],
    description:
      "SHEPHERD ONLY. 1 Action. Summon a spirit companion that follows you and is immune to harm. It lasts until you cast this spell again, until you take a Safe Rest, or until it heals a number of times equal to the mana spent summoning it. Action: it attacks or heals a creature within Reach 4, for 1d6+WIL radiant damage (ignoring armor) or the same amount of healing. Upcast: increment its die size by 1 (max d12), +1 healing use. Flavor is Free: your Lifebinding Spirit can take the form of any small friendly animal or similar creature (dog, lamb, rabbit, sparrow, etc.) — give your buddy a name. Outside of combat, your companion is a spirit and can pass through walls and dangers harmlessly; it can briefly move away from you but always prefers to stay at your side, and it cannot speak.",
    stats: { Actions: '1', Reach: '4', Damage_Healing: '1d6+WIL', Class: 'Shepherd only', Upcast: 'Die size +1 (max d12), +1 healing use' },
  },

  // ─────────────────────────────── NECROTIC SPELLS ───────────────────────────────
  {
    name: 'Entice',
    level: 'Cantrip',
    tags: ['Necrotic'],
    description:
      '1 Action, Single Target. Range: 8. Damage: 1d4 (ignoring armor). On hit: target moves 2 spaces closer to you. High Levels: increment the die size 1 step every 5 levels (d6 » d8 » d10 » d12).',
    stats: { Actions: '1', Target: 'Single Target', Range: '8', Damage: '1d4 (ignoring armor)', 'On Hit': 'Target pulled 2 spaces closer' },
  },
  {
    name: 'Withering Touch',
    level: 'Cantrip',
    tags: ['Necrotic'],
    description:
      '1 Action, Single Target. Reach: 1. Damage: 1d12. On hit: target is considered undead for 1 round. High Levels: +6 damage every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '1', Damage: '1d12', 'On Hit': 'Target considered undead for 1 round' },
  },
  {
    name: 'Shadow Trap',
    level: 'Tier 1',
    tags: ['Necrotic'],
    description:
      '2 Actions, Single Target. Concentration: up to 1 minute. The next creature to move adjacent to you suffers 3d12 damage; if Small or Tiny, it is also Restrained by shadowy tendrils for as long as you maintain concentration or until it escapes. Upcast: +1 size category, +1d12 damage when they escape.',
    stats: { Actions: '2', Target: 'Single Target (trigger)', Concentration: 'Up to 1 minute', Damage: '3d12', Upcast: '+1 size category, +1d12 damage on escape' },
  },
  {
    name: 'Dread Visage',
    level: 'Tier 2',
    tags: ['Necrotic'],
    description:
      '1 Action, Self. Reaction: when attacked, Defend for free. Melee attackers are Frightened of you and suffer 1d12 damage if they attack you this round. Costs 2 mana less while dying. Upcast: +2 damage, +2 armor.',
    stats: { Actions: '1 (Reaction)', Target: 'Self', Damage: '1d12 to melee attackers', Upcast: '+2 damage, +2 armor' },
  },
  {
    name: 'Vampiric Greed',
    level: 'Tier 3',
    tags: ['Necrotic'],
    description:
      '2 Actions, AoE. Gain 1 Wound. Deal 4d12 damage to all adjacent creatures and heal HP equal to the damage done. Any surviving creatures make a STR save; you gain 1 additional Wound for each creature that saves. Upcast: +1 DC.',
    stats: { Actions: '2', Target: 'AoE (adjacent)', Damage: '4d12', Cost: '1 Wound (+1 per creature that saves)', Save: 'STR', Upcast: '+1 DC' },
  },
  {
    name: 'Greater Shadow',
    level: 'Tier 4',
    tags: ['Necrotic'],
    description:
      '2 Actions. Summon a 5d12 Greater Shadow minion (max 1) adjacent to you. When it dies, it explodes into 5 shadow minions (see Summon Shadow); place them anywhere within 8 spaces. Upcast: +1d12 damage, +1 shadow minion on explosion.',
    stats: { Actions: '2', Effect: 'Summons a 5d12 Greater Shadow minion', Upcast: '+1d12 damage, +1 minion on explosion' },
  },
  {
    name: 'Gangrenous Burst',
    level: 'Tier 5',
    tags: ['Necrotic'],
    description:
      'AoE. 2 Actions. Reach: up to 8. Other damaged creatures within Reach must make a STR save or take 3d20 damage (ignoring armor); half on save. The save is rolled with disadvantage while the caster is Bloodied. Upcast: +10 damage.',
    stats: { Actions: '2', Target: 'AoE', Reach: '8', Damage: '3d20 (ignoring armor)', Save: 'STR', Upcast: '+10 damage' },
  },
  {
    name: 'Unspeakable Word',
    level: 'Tier 6',
    tags: ['Necrotic'],
    description:
      '2 Actions, Special. Reach: 8. Damage: d66 (rolled with advantage, ignoring armor, does not miss or crit) on a failed INT save. Target rolls with disadvantage if Bloodied or Frightened. On a success, you and the target both take half of this damage instead. Upcast: +1 DC, +10 damage.',
    stats: { Actions: '2', Target: 'Special', Reach: '8', Damage: 'd66 (advantage, ignores armor)', Save: 'INT', Upcast: '+1 DC, +10 damage' },
  },
  {
    name: 'Creeping Death',
    level: 'Tier 7',
    tags: ['Necrotic'],
    description:
      '3 Actions, AoE. Reach: 8. Damage: 4d20. If this kills the creature, it violently erupts and you must deal the same amount of damage to another creature within 8 spaces that has not yet been damaged by this effect; repeat until a creature survives the damage or no other creatures remain within Reach. Upcast: +1d20 damage.',
    stats: { Actions: '3', Target: 'AoE (chains on kill)', Reach: '8', Damage: '4d20', Upcast: '+1d20 damage' },
  },
  {
    name: 'Shadow Blast',
    level: 'Cantrip',
    tags: ['Necrotic', 'Class-Restricted'],
    description:
      'SHADOWMANCER ONLY. 1 Action, Single Target. Range: 8. Damage: 1d12+KEY, usable once per round. High Levels: +1d12 every 5 levels.',
    stats: { Actions: '1', Target: 'Single Target', Range: '8', Damage: '1d12+KEY (1/round)', Class: 'Shadowmancer only' },
  },
  {
    name: 'Summon Shadow',
    level: 'Cantrip',
    tags: ['Necrotic', 'Class-Restricted'],
    description:
      'SHADOWMANCER ONLY. 1 Action. Summon a shadow minion within Reach 1 (you can have a maximum of INT or LVL minions this way, whichever is lower). Your shadow minions follow normal minion rules: 1 HP, no damage bonus, and they do not crit. They abandon you immediately outside of combat. Action (1/turn): command all of your minions to move up to 6 then attack (Reach 1, d12 each). High Levels: +1 Reach every 5 levels.',
    stats: { Actions: '1', Reach: '1', Effect: 'Summons a 1-HP shadow minion', Class: 'Shadowmancer only', Max: 'INT or LVL minions, whichever is lower' },
  },

  // ─────────────────────────────── UTILITY SPELLS: ICE ───────────────────────────────
  {
    name: 'Ice Disk',
    level: 'Cantrip',
    tags: ['Utility', 'Ice'],
    description:
      'Casting Time: 1 minute. Conjure a disk of ice that floats just above the ground and follows you. It can carry up to 250 lbs./115 kg of weight for 1 hour or until you cast this spell again.',
    stats: { 'Casting Time': '1 minute', Effect: 'Ice disk carries 250 lbs. for 1 hour' },
  },
  {
    name: 'Chillcraft',
    level: 'Cantrip',
    tags: ['Utility', 'Ice'],
    description:
      "1 Action. Chill: harmlessly freeze, thaw, or move a bath-sized amount of water near you. OR Craft: conjure a sheet of opaque, mirror-like, or transparent ice the size of a window or small door.",
    stats: { Actions: '1', Effect: 'Freeze/thaw water, or conjure a sheet of ice' },
  },
  {
    name: 'Wintry Scrying',
    level: 'Cantrip',
    tags: ['Utility', 'Ice'],
    description:
      'Casting Time: 10 minutes. Turn a small patch of water into a reflective icy mirror. Looking through it grants you vision of any desired location near this same body of water for 10 minutes.',
    stats: { 'Casting Time': '10 minutes', Effect: 'Scrying vision near a connected body of water' },
  },

  // ─────────────────────────────── UTILITY SPELLS: LIGHTNING ───────────────────────────────
  {
    name: 'Spark Buddy',
    level: 'Cantrip',
    tags: ['Utility', 'Lightning'],
    description:
      'Casting Time: 1 minute. Conjure a Tiny (squirrel-sized) electrical helper for up to 1 hour. It can fetch Tiny objects (~1 lb./500 g max), open unlocked doors, illuminate a small area, or deliver a harmless shock. If it takes damage or moves further than 6 spaces away from you, it dissipates into sparks.',
    stats: { 'Casting Time': '1 minute', Duration: 'Up to 1 hour', Effect: 'Tiny electrical helper creature' },
  },
  {
    name: 'Spark Step',
    level: 'Cantrip',
    tags: ['Utility', 'Lightning'],
    description: '1 Action, Self. Range: 4. Teleport to a metal object.',
    stats: { Actions: '1', Target: 'Self', Range: '4', Effect: 'Teleport to a metal object' },
  },
  {
    name: "Tempest's Command",
    level: 'Cantrip',
    tags: ['Utility', 'Lightning'],
    description:
      '1 Action. Dispel a minor magical effect, or temporarily suppress a stronger one (the more powerful an enchantment, the shorter the duration). OR Voice of Thunder: your eyes glow and your voice is amplified to a booming, thunder-like volume for 1 minute.',
    stats: { Actions: '1', Effect: 'Dispel/suppress magic, or amplify your voice for 1 minute' },
  },

  // ─────────────────────────────── UTILITY SPELLS: RADIANT ───────────────────────────────
  {
    name: 'Light',
    level: 'Cantrip',
    tags: ['Utility', 'Radiant'],
    description: '1 Action, Single Target. Cause an item to brightly glow as a torch with radiant light for as long as you hold it.',
    stats: { Actions: '1', Target: 'Single Target (item)', Effect: 'Torch-like radiant light while held' },
  },
  {
    name: 'Beautify',
    level: 'Cantrip',
    tags: ['Utility', 'Radiant'],
    description:
      '1 Action, Single Target. Clean stains or repair a small tear/break in a non-magical item, or conjure tiny beautiful things: flowers, butterflies, etc.',
    stats: { Actions: '1', Target: 'Single Target (item)', Effect: 'Minor repair/cleaning, or conjure decorative trifles' },
  },
  {
    name: 'Bond of Peace',
    level: 'Cantrip',
    tags: ['Utility', 'Radiant'],
    description:
      '1 Action, Single Target/Self. Bond: telepathically communicate simple thoughts or feelings with a friendly creature you can see. OR Peace: imbue your spoken words with calming magic, granting advantage on any check made to soothe anger or fear in creatures who can hear you.',
    stats: { Actions: '1', Target: 'Single Target / Self', Effect: 'Telepathic bond, or advantage on calming checks' },
  },

  // ─────────────────────────────── UTILITY SPELLS: FIRE ───────────────────────────────
  {
    name: 'Firebrand',
    level: 'Cantrip',
    tags: ['Utility', 'Fire'],
    description:
      '1 Action. Touch a surface and secretly mark it with a symbol or brief message. Speaking a chosen command word while nearby reveals it.',
    stats: { Actions: '1', Effect: 'Hidden mark revealed by a command word' },
  },
  {
    name: 'Fire Step',
    level: 'Cantrip',
    tags: ['Utility', 'Fire'],
    description: 'Self. Casting Time: 1 minute. Teleport to a fire source you can see.',
    stats: { 'Casting Time': '1 minute', Target: 'Self', Effect: 'Teleport to a visible fire source' },
  },
  {
    name: 'Kindle',
    level: 'Cantrip',
    tags: ['Utility', 'Fire'],
    description:
      '1 Action, Single Target. Conjure a minor visual illusion. OR: ignite a small, unheld item within Range 6.',
    stats: { Actions: '1', Target: 'Single Target', Range: '6', Effect: 'Minor illusion, or ignite a small unheld item' },
  },

  // ─────────────────────────────── UTILITY SPELLS: WIND ───────────────────────────────
  {
    name: 'Wind Whisper',
    level: 'Cantrip',
    tags: ['Utility', 'Wind'],
    description:
      '1 Action, Single Target. You whisper a message into the wind and it will be secretly carried to a specified target within 100 miles/160 km.',
    stats: { Actions: '1', Target: 'Single Target', Range: '100 miles / 160 km', Effect: 'Secretly carried whispered message' },
  },
  {
    name: 'Helpful Gust',
    level: 'Cantrip',
    tags: ['Utility', 'Wind'],
    description:
      '1 Action, Single Target. Reach: 6. Gently move a Tiny unheld item within Reach in any direction. OR: generate an illusory scent.',
    stats: { Actions: '1', Target: 'Single Target', Reach: '6', Effect: 'Move a Tiny unheld item, or create an illusory scent' },
  },
  {
    name: 'Feather Fall',
    level: 'Cantrip',
    tags: ['Utility', 'Wind'],
    description:
      '1 Action, Single Target. Reach: 6. Reaction: when a creature falls, cause them to gently float to the ground, unharmed.',
    stats: { Actions: '1 (Reaction)', Target: 'Single Target', Reach: '6', Effect: 'Falling creature floats down unharmed' },
  },

  // ─────────────────────────────── UTILITY SPELLS: NECROTIC ───────────────────────────────
  {
    name: 'Gravecraft',
    level: 'Cantrip',
    tags: ['Utility', 'Necrotic'],
    description:
      'Single Target. Gravemark (Action): soil a surface with blood, filth, or other disgusting things. OR Gravework (Casting Time: 1 minute): shape/move a body-sized plot of earth.',
    stats: { Target: 'Single Target', Effect: 'Soil a surface, or shape/move a body-sized plot of earth' },
  },
  {
    name: 'False Face',
    level: 'Cantrip',
    tags: ['Utility', 'Necrotic'],
    description:
      'Casting Time: 1 minute. Change your appearance to look like someone else for 10 minutes. Requires a piece of them.',
    stats: { 'Casting Time': '1 minute', Duration: '10 minutes', Requirement: 'A piece of the person mimicked' },
  },
  {
    name: 'Thought Leech',
    level: 'Cantrip',
    tags: ['Utility', 'Necrotic'],
    description:
      '1 Action. Reach: 6. Read the surface thoughts of a creature within Reach. Creatures can sense you doing this and may not like it.',
    stats: { Actions: '1', Reach: '6', Effect: 'Read surface thoughts (detectable)' },
  },
];

async function main() {
  const client = createSupabaseClient();

  // Idempotency guard: prevent re-seeding if Nimble Core Rules spells already exist.
  const { data: existing, error: existingError } = await client
    .from('spells')
    .select('id')
    .eq('source_id', SOURCE_ID)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing spells: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error('Nimble Core Rules spells already seeded. Delete existing rows for this source before re-running this script.');
  }

  let created = 0;
  for (const spell of SPELLS) {
    await createSpell(client, {
      ...spell,
      system_id: SYSTEM_ID,
      source_id: SOURCE_ID,
      is_homebrew: false,
    });
    created += 1;
  }

  console.log(`Seeded ${created} Nimble spells from Core Rules.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
