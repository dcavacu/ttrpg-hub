import type { CombatRole } from '../lib/content/types';

export interface MonsterJudgment {
  combat_role: CombatRole;
  race?: string;
}

// Judgment-based facet data for every monster in scripts/seed-nimble-monsters.ts.
// combat_role is judged from each monster's primary/first-listed named action.
// race is only populated for monsters whose `tags` entry is a thematic grouping
// (Kobolds, Goblins, Bandits, Snakemen, Dungeon Denizens, Hill & Field,
// Forest Denizens, Underground, Cultists/Horrors, Legendary) rather than an
// actual creature type already present in tags (Fey, Fiend, Undead, Dragon,
// Giant Bug), which a separate deterministic function already handles.
export const JUDGMENT_MONSTER_DATA: Record<string, MonsterJudgment> = {
  // ============================= FEY =============================
  Sprite: { combat_role: 'Ranged' },
  Faerie: { combat_role: 'Ranged' },
  'Faerie Troubadour': { combat_role: 'Ranged' },
  'Faerie Merrymaker': { combat_role: 'Ranged' },
  'Faerie Trickmage': { combat_role: 'Ranged' },
  Gremlin: { combat_role: 'Melee' },
  'Gremlin Wrestler': { combat_role: 'Melee' },
  'Gremlin Roastmaster': { combat_role: 'Melee' },
  Bogey: { combat_role: 'Melee' },
  'Mav, The Winter Queen': { combat_role: 'Ranged' },
  'Razzle, Gremlin Iconoclast': { combat_role: 'Melee' },

  // ============================= FIENDS =============================
  Nalfeshnee: { combat_role: 'Ranged' },
  Glabrezu: { combat_role: 'Melee' },
  Hezrou: { combat_role: 'Melee' },
  Vrock: { combat_role: 'Ranged' },
  'Incubus/Succubus': { combat_role: 'Ranged' },
  Hookspawn: { combat_role: 'Melee' },
  'Spiny Fiend': { combat_role: 'Melee' },
  Imp: { combat_role: 'Melee' },
  Stenchling: { combat_role: 'Melee' },
  Executor: { combat_role: 'Ranged' },
  Lashfiend: { combat_role: 'Ranged' },
  Justiciar: { combat_role: 'Ranged' },
  Overlord: { combat_role: 'Ranged' },
  Hierarch: { combat_role: 'Ranged' },
  Pactmonger: { combat_role: 'Ranged' },
  Grumbulus: { combat_role: 'Melee' },
  Quasit: { combat_role: 'Melee' },
  Lumbrax: { combat_role: 'Melee' },
  'Vorgrath, the Insatiable': { combat_role: 'Ranged' },

  // ============================= GIANT BUGS =============================
  'Bug Minion': { combat_role: 'Melee' },
  'Giant Bug': { combat_role: 'Melee' },
  'Toughrider Bug': { combat_role: 'Melee' },
  'Jacker Bug': { combat_role: 'Melee' },
  'Acidshot Bug': { combat_role: 'Ranged' },
  'Bonfire Bug': { combat_role: 'Melee' },
  'Hivedriver Bug': { combat_role: 'Melee' },
  'Vicejaw Bug': { combat_role: 'Melee' },
  'Thrum Bug': { combat_role: 'Ranged' },
  Spitbug: { combat_role: 'Ranged' },
  'Maneater Bug': { combat_role: 'Melee' },
  'Rhino Bug': { combat_role: 'Melee' },
  'Ballistic Bug': { combat_role: 'Ranged' },
  'Broodfly Drake': { combat_role: 'Ranged' },

  // ============================= GMG: KOBOLDS =============================
  'Kobold Minion': { combat_role: 'Melee', race: 'Humanoid' },
  Kobold: { combat_role: 'Melee', race: 'Humanoid' },
  'Kobold Sneak': { combat_role: 'Melee', race: 'Humanoid' },
  'Kobold Clanger': { combat_role: 'Melee', race: 'Humanoid' },
  'Kobold Trapper': { combat_role: 'Ranged', race: 'Humanoid' },
  'Kobold Denwarden': { combat_role: 'Melee', race: 'Humanoid' },

  // ============================= GMG: GOBLINS =============================
  'Goblin Minion': { combat_role: 'Melee', race: 'Humanoid' },
  Goblin: { combat_role: 'Melee', race: 'Humanoid' },
  Bugbear: { combat_role: 'Melee', race: 'Humanoid' },
  'Goblin Taskmaster': { combat_role: 'Melee', race: 'Humanoid' },
  'Goblin Ratrider': { combat_role: 'Melee', race: 'Humanoid' },

  // ============================= GMG: BANDITS =============================
  'Bandit Minion': { combat_role: 'Melee', race: 'Humanoid' },
  Bandit: { combat_role: 'Melee', race: 'Humanoid' },
  'Bandit Bruiser': { combat_role: 'Melee', race: 'Humanoid' },
  'Bandit Hunter': { combat_role: 'Ranged', race: 'Humanoid' },
  'Bandit Assassin': { combat_role: 'Melee', race: 'Humanoid' },
  'Bandit Mage': { combat_role: 'Ranged', race: 'Humanoid' },
  'Bandit Captain': { combat_role: 'Melee', race: 'Humanoid' },

  // ============================= GMG: SNAKEMEN =============================
  'Snakeman Minion': { combat_role: 'Melee', race: 'Humanoid' },
  Snakeman: { combat_role: 'Melee', race: 'Humanoid' },
  'Cobra Captain': { combat_role: 'Melee', race: 'Humanoid' },
  'Giant Cobra': { combat_role: 'Melee', race: 'Humanoid' },

  // ============================= GMG: DUNGEON DENIZENS =============================
  Stirge: { combat_role: 'Melee', race: 'Beast' },
  'Greater Stirge': { combat_role: 'Melee', race: 'Beast' },
  'Tiny Mimic': { combat_role: 'Melee', race: 'Monstrosity' },
  'Small Mimic': { combat_role: 'Melee', race: 'Monstrosity' },
  'Medium Mimic': { combat_role: 'Melee', race: 'Monstrosity' },
  'Gray Ooze': { combat_role: 'Melee', race: 'Ooze' },
  'Ochre Jelly': { combat_role: 'Melee', race: 'Ooze' },
  'Black Pudding': { combat_role: 'Melee', race: 'Ooze' },
  'Elder Ooze': { combat_role: 'Ranged', race: 'Ooze' },

  // ============================= GMG: HILL & FIELD =============================
  Gnoll: { combat_role: 'Melee', race: 'Humanoid' },
  'Gnoll Packleader': { combat_role: 'Melee', race: 'Humanoid' },
  Worg: { combat_role: 'Melee', race: 'Beast' },
  'Hill Giant': { combat_role: 'Melee', race: 'Giant' },
  Bulette: { combat_role: 'Melee', race: 'Monstrosity' },
  Troll: { combat_role: 'Melee', race: 'Giant' },
  'Blue Drake': { combat_role: 'Melee' },
  Griffon: { combat_role: 'Melee', race: 'Monstrosity' },
  Roc: { combat_role: 'Ranged', race: 'Monstrosity' },

  // ============================= GMG: UNDEAD =============================
  Skeleton: { combat_role: 'Ranged' },
  Zombie: { combat_role: 'Melee' },
  Ghoul: { combat_role: 'Melee' },
  Specter: { combat_role: 'Melee' },
  'Ogre Zombie': { combat_role: 'Melee' },
  Mummy: { combat_role: 'Melee' },
  'Giant Zombie': { combat_role: 'Melee' },
  Wraith: { combat_role: 'Ranged' },
  'Mummy Lord': { combat_role: 'Melee' },

  // ============================= GMG: FOREST DENIZENS =============================
  Duskprowler: { combat_role: 'Melee', race: 'Beast' },
  Basilisk: { combat_role: 'Ranged', race: 'Monstrosity' },
  Druid: { combat_role: 'Ranged', race: 'Humanoid' },
  Seedling: { combat_role: 'Ranged', race: 'Plant' },
  Acidpod: { combat_role: 'Melee', race: 'Plant' },
  Tangler: { combat_role: 'Ranged', race: 'Plant' },
  Rootbreaker: { combat_role: 'Melee', race: 'Plant' },
  Treant: { combat_role: 'Ranged', race: 'Plant' },

  // ============================= GMG: CULTISTS/HORRORS =============================
  Cultist: { combat_role: 'Melee', race: 'Humanoid' },
  Fanatic: { combat_role: 'Melee', race: 'Humanoid' },
  Doomsayer: { combat_role: 'Ranged', race: 'Humanoid' },

  // ============================= GMG: UNDERGROUND =============================
  'Giant Spider': { combat_role: 'Ranged', race: 'Giant Bug' },
  Ettercap: { combat_role: 'Melee', race: 'Monstrosity' },
  Nestweaver: { combat_role: 'Ranged', race: 'Giant Bug' },
  Cloaker: { combat_role: 'Melee', race: 'Monstrosity' },
  'Umber Hulk': { combat_role: 'Melee', race: 'Monstrosity' },
  'Great Worm': { combat_role: 'Ranged', race: 'Monstrosity' },

  // ============================= GMG: LEGENDARY MONSTERS =============================
  'Pudge the Blunderer': { combat_role: 'Melee', race: 'Giant' },
  'Kelebek & Poppy': { combat_role: 'Melee', race: 'Humanoid' },
  'Grimbeak, the Unyielding': { combat_role: 'Ranged', race: 'Monstrosity' },
  'Thorn Quickblade': { combat_role: 'Ranged', race: 'Humanoid' },
  'Ravager of the Lowlands': { combat_role: 'Ranged', race: 'Monstrosity' },
  'Nalzar, Apex Predator': { combat_role: 'Melee' },
  'Queen Aranya, Broodmother': { combat_role: 'Melee', race: 'Giant Bug' },
  'Florindris, Bane of the Forest': { combat_role: 'Ranged' },
  'General Flameheart': { combat_role: 'Ranged', race: 'Giant' },
  'Vael, Undying Necromancer': { combat_role: 'Ranged' },
  'Titan of the Deep Woods': { combat_role: 'Ranged' },
  "Ul'vek, Psionic Despot": { combat_role: 'Ranged', race: 'Aberration' },
  'Dravok, All-Seeing Tyrant': { combat_role: 'Ranged', race: 'Aberration' },
  'Azriel, Lord of Pain & Flame': { combat_role: 'Ranged' },
  'Gloomwing the Cruel': { combat_role: 'Ranged' },
  'Alaric Draegoth, the Crimson Count': { combat_role: 'Melee' },
  'Caerys, the Hollow Star': { combat_role: 'Melee', race: 'Aberration' },
};
