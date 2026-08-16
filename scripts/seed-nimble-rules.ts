import { createSupabaseClient } from '../lib/supabase/client';
import { createRule, type RuleInput } from '../lib/content/rules';

const SYSTEM_ID = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056'; // Nimble
const SOURCE_ID = '75824afb-fb75-46a6-886e-f0f8320e4600'; // Core Rules

type SeedRule = Pick<RuleInput, 'name' | 'category' | 'tags' | 'description'>;

const RULES: SeedRule[] = [
  // ---------------------------------------------------------------------
  // Core Mechanics
  // ---------------------------------------------------------------------
  {
    name: 'Strength (STR)',
    category: 'Core Mechanics',
    tags: ['Stat'],
    description:
      "One of the four core stats. Represents raw physical power, resilience, endurance, and resistance to harm. Affects STR weapon damage, resistance to Wounds, HP recovery, Concentration saves, STR saves, carrying capacity, Grappling, and the Might skill. A hero's stat maximum is typically +5.",
  },
  {
    name: 'Dexterity (DEX)',
    category: 'Core Mechanics',
    tags: ['Stat'],
    description:
      "Represents agility, reflexes, and precision with blades or bows. Affects DEX weapon damage, Initiative, DEX saves, Grappling, and can contribute to Armor, as well as the Stealth and Finesse skills. A hero's stat maximum is typically +5.",
  },
  {
    name: 'Intelligence (INT)',
    category: 'Core Mechanics',
    tags: ['Stat'],
    description:
      "Reflects knowledge and reasoning across fields like the arcane, tactics, or street smarts. Affects languages, spellcasting, use of wands and spell scrolls, INT saves, as well as the Arcana, Examination, and Lore skills. A hero's stat maximum is typically +5.",
  },
  {
    name: 'Will (WIL)',
    category: 'Core Mechanics',
    tags: ['Stat'],
    description:
      "Represents force of personality, courage, and wisdom. Shapes interactions with both nature and society. Affects spellcasting and WIL saves, as well as the Insight, Influence, Naturecraft, and Perception skills. A hero's stat maximum is typically +5.",
  },
  {
    name: 'Arcana',
    category: 'Core Mechanics',
    tags: ['Skill', 'INT'],
    description:
      'Your understanding of magical phenomena, spells, and enchantments. Used to identify magical effects, decipher arcane symbols, and discern the properties of magical items. Also grants insight into the abilities and weaknesses of magical beings like Aberrations, Elementals, and Oozes.',
  },
  {
    name: 'Examination',
    category: 'Core Mechanics',
    tags: ['Skill', 'INT'],
    description:
      'Your aptitude for thorough analysis and deduction. Used to diagnose injuries, determine causes of death, uncover clues, and unravel the workings of traps or mechanical devices. Also grants insight into the abilities and weaknesses of Constructs.',
  },
  {
    name: 'Finesse',
    category: 'Core Mechanics',
    tags: ['Skill', 'DEX'],
    description:
      'Your ability to use your hands and feet in careful ways. Used for activities such as picking locks, disarming traps, piloting vehicles, tinkering, card tricks, stealing or planting items, climbing a mossy wall, or any other task requiring precise, careful movement.',
  },
  {
    name: 'Influence',
    category: 'Core Mechanics',
    tags: ['Skill', 'WIL'],
    description:
      'Your persuasiveness, charm, and ability to influence others through charisma or cunning. Used to convince or deceive people, negotiate deals, build trust, win allies to your cause, or put on a captivating performance.',
  },
  {
    name: 'Insight',
    category: 'Core Mechanics',
    tags: ['Skill', 'WIL'],
    description:
      "Your ability to understand people and situations beyond the obvious. Used to sense motives, detect lies, read hidden emotions, make sense of clues, and think ahead when faced with uncertainty. Can be used retroactively: a GM may call for an Insight check to determine whether your hero would have thought to prepare for something (e.g. 'Oh no, I forgot to buy rope!').",
  },
  {
    name: 'Might',
    category: 'Core Mechanics',
    tags: ['Skill', 'STR'],
    description:
      'Your ability to apply strength effectively. Used for lifting heavy objects, breaking through obstacles, climbing, swimming, jumping, or performing feats of strength.',
  },
  {
    name: 'Lore',
    category: 'Core Mechanics',
    tags: ['Skill', 'INT'],
    description:
      'Your understanding of the history of civilization, kingdoms, and religions. Used to recall historical events and grasp the significance of cultural practices. Extends to knowledge of the abilities and behavior of Celestials, Dragons, Fey, Fiends, Giants, Humanoids, and Undead.',
  },
  {
    name: 'Naturecraft',
    category: 'Core Mechanics',
    tags: ['Skill', 'WIL'],
    description:
      'Your expertise in wilderness survival, navigation, tracking, and the handling of animals. Used to thrive in the wild, identify flora, fauna, and track creatures with precision. Encompasses knowledge of Beasts, Monstrosities, and Plants, including their behavior, habitats, and characteristics.',
  },
  {
    name: 'Perception',
    category: 'Core Mechanics',
    tags: ['Skill', 'WIL'],
    description:
      "Your overall ability to notice subtle details in your surroundings. Used to spot hidden objects, detect secret passages, sense subtle environmental changes, and sense when you're being followed or observed. Encompasses picking up on non-obvious cues and hidden threats.",
  },
  {
    name: 'Stealth',
    category: 'Core Mechanics',
    tags: ['Skill', 'DEX'],
    description:
      'Your proficiency in staying unseen and moving quietly. Used to hide, slip past guards, evade detection, and move without drawing attention.',
  },
  {
    name: 'Advantage & Disadvantage',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      'If a hero is in a favorable situation, the GM may allow them to roll with advantage: roll 1 additional die of the same type and remove the lowest result. In a grim situation or on a long-shot idea, the GM may impose disadvantage: roll 1 additional die and remove the highest result instead. Multiple instances of advantage or disadvantage each add one more extra die (removing the lowest for advantage, or the highest for disadvantage). Each instance of advantage cancels out one instance of disadvantage before dice are rolled.',
  },
  {
    name: 'Skill Checks & Saves',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      'To affect the world (convince an NPC, spot a trap, pick a lock, etc.), the GM may call for a skill check: roll 1d20 and add your skill bonus (max +12). Meet or exceed the Difficulty Challenge (DC) to succeed. A roll of 1 always fails and a roll of 20 always succeeds, regardless of other bonuses. Typical DCs: Easy 8, Medium 12, Challenging 15, Very Difficult 18, Extremely Difficult 20+. Saves: when the world affects you instead, roll 1d20 and add the relevant stat (STR, DEX, INT, or WIL) instead of a skill. A roll of 1 always fails a save, 20 always succeeds; you may also choose to auto-fail a save instead of rolling. STR Save resists forced movement, restraint, poison, and extreme temperatures. DEX Save is for agility/speed, e.g. diving for cover or staying upright on ice. INT Save helps see through tricks and illusions. WIL Save helps resist charm or fear effects. Unless otherwise noted, the DC for an effect a hero causes is 10+KEY. Each hero also has 1 advantaged save, 1 disadvantaged save, and 2 neutral saves based on their class (e.g. a Berserker with STR+/INT- rolls all STR saves with advantage and all INT saves with disadvantage).',
  },
  {
    name: 'Size',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      'Guidelines for comparing differently sized creatures/objects. Tiny: can be carried in a typical pocket (many fit comfortably in 1 space). Small: can be carried in a backpack (2 fit comfortably in 1 space). Medium: the average human size (1 fits comfortably in 1 space). Large: roughly bear-sized (1 fits in a 2x2 area). Huge: roughly the size of a small house (1 fits in a 3x3 area). Gargantuan: as large as a castle keep (1 fills a 4x4 area or greater).',
  },
  {
    name: 'Hit Points & Dying',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'HP'],
    description:
      'Hit Points (HP) represent a hero\'s ability to endure damage. Damage reduces HP, which cannot go below 0. When reduced to 0 HP, a hero gains 1 Wound and also gains the Dying condition until they regain HP. While Dying, actions are limited to 1, Concentration is broken, and further harm is dangerous: attacking or casting a spell while Dying causes 1 Wound unless the hero makes a successful DC 10 STR save; taking damage while Dying causes 2 Wounds (3 on a crit). Death: a hero dies upon taking 6 Wounds total (unless an ability changes this number). There are rare, often costly ways to revive a hero who has died. Optional Gritty Dying Rules exist for a harder/more lethal game: reduce the max Wounds a hero can take (as low as 1-2 for very lethal games), optionally with each Wound imposing a cumulative -1 penalty to rolls.',
  },
  {
    name: 'Wounds',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'HP'],
    description:
      'Wounds are serious injuries that serve as a long-term gauge of how close a hero is to death. Unlike HP, which recovers quickly, Wounds may take many days of rest to heal (usually 1 Wound per Safe Rest). A hero dies upon taking 6 Wounds total (unless changed by an ability).',
  },
  {
    name: 'Temporary HP',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'HP'],
    description:
      "Some abilities or effects grant temporary HP (temp HP), which is reduced before regular HP when taking damage. Temp HP does not combine: if a hero has temp HP and would gain more, they choose which amount to keep rather than adding them together. Temp HP expires after a Safe Rest.",
  },
  {
    name: 'Hit Dice',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'HP'],
    description:
      "Hit Dice (HD) represent a hero's ability to quickly recuperate from minor injuries and are spent to regain HP (typically during a Field Rest). Heroes start with a maximum of 1 Hit Die at level 1, and this limit increases by 1 each time they level up. Hit Dice are fully recovered during a Safe Rest.",
  },
  {
    name: 'Speed',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'Movement'],
    description:
      "A character's Speed is how fast they can move, which is 6 spaces unless otherwise noted. Play is typically done on a grid of 1-inch squares or hexagons, each representing roughly 5 ft. or 1 meter, so a hero with Speed 6 can move up to 6 spaces horizontally or diagonally on their turn. A character can move through spaces occupied by allies, or through spaces occupied by enemies treated as Difficult Terrain (half speed), as long as they don't end their movement in an occupied space.",
  },
  {
    name: 'Range & Reach',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'Movement'],
    description:
      'Certain abilities, weapons, and spells specify a Range or Reach determining how far away a target can be affected; if none is specified, it defaults to Reach 1. In Melee: if any enemy is adjacent to you, your Ranged attacks are made with disadvantage (Reach attacks are not affected by this). Long Range: you can take disadvantage 1 to gain +2 Range on a Ranged attack, up to a maximum of +6 Range.',
  },
  {
    name: 'Falling & Forced Movement',
    category: 'Core Mechanics',
    tags: ['Core Mechanic', 'Movement'],
    description:
      'When a character is forcibly moved but stopped by an obstacle, they take 1d6 bludgeoning damage for every space the movement was shortened by; if they hit another creature, both creatures split this damage. Falling inflicts 1d6 bludgeoning damage for every 10 ft. (2 spaces) fallen. As an alternative to counting exact spaces, distances can be abstracted into Close, Midrange, and Far bands: a move from Midrange can reach Close or Far; Close creatures can be affected at Reach/Range 4, Midrange up to 6, and beyond that is Far.',
  },
  {
    name: 'Concentration',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      'A character can only concentrate on one activity at a time. Whenever a concentrating character is crit, they must make a DC 10 STR save; failing breaks Concentration and the activity fails. Concentration is also automatically broken whenever a character drops to 0 HP or becomes Incapacitated.',
  },
  {
    name: 'Cover & Hiding',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      "A creature mostly obscured from line of sight (behind a tree, a larger ally, a knocked-over table, in poor lighting, etc.) has Cover and imposes disadvantage on attacks made against it. A creature completely obscured from view has Full Cover and typically cannot be targeted by an attack. To hide in combat, a creature must have Cover from those it's hiding from and spend an action making a DC 15 Stealth check (automatic success if it has Full Cover). The first attack made while hidden is made with advantage, after which the creature is no longer hidden -- unless that attack kills the target and no other enemy can see the hider, in which case they may remain hidden.",
  },
  {
    name: 'Grappling',
    category: 'Core Mechanics',
    tags: ['Core Mechanic'],
    description:
      "A creature can attempt to grab another creature it is within Reach of, provided it has at least 1 arm free (or another way to grab them). This forces a target to make a STR or DEX save (DC 10 + the grappler's STR or DEX); on a failure, a target the grappler's size or smaller becomes Grappled, while a target larger than the grappler causes the grappler to gain the Riding condition instead. A Grapple can be ended by forced movement that pushes the grappler away, by the grappled creature becoming Incapacitated, or by the grappled creature spending an action and succeeding on a STR or DEX save.",
  },

  // ---------------------------------------------------------------------
  // Conditions
  // ---------------------------------------------------------------------
  {
    name: 'Blinded',
    category: 'Conditions',
    tags: ['Condition'],
    description: "Can't see. Attacks made against a Blinded creature have advantage, and its own attacks are made with disadvantage.",
  },
  {
    name: 'Bloodied',
    category: 'Conditions',
    tags: ['Condition'],
    description: 'At half HP or less.',
  },
  {
    name: 'Charmed',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      'Sees the charmer as an ally. The charmer has advantage on social interactions with the Charmed creature.',
  },
  {
    name: 'Dazed',
    category: 'Conditions',
    tags: ['Condition'],
    description: 'Heroes lose 1 action; monsters can perform one less action on their next turn.',
  },
  {
    name: 'Dying',
    category: 'Conditions',
    tags: ['Condition', 'HP'],
    description:
      'At 0 HP. Actions are limited to 1, Concentration is broken, and further harm is dangerous: attacking or casting a spell while Dying causes 1 Wound unless the hero makes a successful DC 10 STR save. Taking damage while Dying causes 2 Wounds, or 3 on a crit.',
  },
  {
    name: 'Frightened',
    category: 'Conditions',
    tags: ['Condition'],
    description: 'Disadvantage on rolls while the source of the fear is nearby; speed is halved when moving closer to the source of fear.',
  },
  {
    name: 'Grappled/Restrained',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      "Grappled: cannot move, and attacks against the Grappled creature have advantage. Grappled is inflicted on a creature the grappler's size or smaller that fails a save against a Grapple attempt (a target larger than the grappler causes the grappler to gain the Riding condition instead -- see Grappling). Forced movement that pushes the grappler away, incapacitation, or spending an action and succeeding on a STR or DEX save can end it. Restrained functions identically to Grappled, but is caused by objects (e.g., chains, rope, roots) rather than a creature, and ignores size restrictions. It can be ended through any logical means, such as picking a lock or cutting/burning the rope.",
  },
  {
    name: 'Hampered',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      'Any creature with its actions or movement reduced by an effect (e.g., being Dazed, Grappled, Prone, or standing in Difficult Terrain) is considered Hampered.',
  },
  {
    name: 'Incapacitated',
    category: 'Conditions',
    tags: ['Condition'],
    description: "Can't do anything. Attacks against an Incapacitated creature have advantage, and melee attacks that hit it automatically crit.",
  },
  {
    name: 'Invisible',
    category: 'Conditions',
    tags: ['Condition'],
    description: "Cannot be seen. An Invisible creature's attacks have advantage, and attacks made against it have disadvantage.",
  },
  {
    name: 'Petrified',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      'Incapacitated, with all the benefits and drawbacks of being a rock: immune to most damage except from large explosions, picks, or similar tools.',
  },
  {
    name: 'Poisoned',
    category: 'Conditions',
    tags: ['Condition'],
    description: 'Disadvantage on rolls.',
  },
  {
    name: 'Prone',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      "Movement costs twice as much while Prone, and the Prone creature's own attacks are made with disadvantage. Melee attacks against a Prone creature have advantage; Ranged attacks against it have disadvantage. Spend 3 spaces of Speed to stand up.",
  },
  {
    name: 'Riding',
    category: 'Conditions',
    tags: ['Condition'],
    description: "You move together with the creature you are riding. Any attacks that miss you instead strike the creature you're riding.",
  },
  {
    name: 'Slowed',
    category: 'Conditions',
    tags: ['Condition'],
    description: "Speed is halved during the affected creature's next turn.",
  },
  {
    name: 'Taunted',
    category: 'Conditions',
    tags: ['Condition'],
    description: 'Disadvantage on attacks, except against the most recent creature that Taunted you.',
  },
  {
    name: 'Wounded',
    category: 'Conditions',
    tags: ['Condition', 'HP'],
    description: 'Has taken any Wounds. A hero typically has a maximum of 6 Wounds, and dies upon reaching that limit.',
  },
  {
    name: 'Other Minor Statuses',
    category: 'Conditions',
    tags: ['Condition'],
    description:
      'Minor statuses such as Smoldering, Charged, or Distracted do nothing on their own and end whenever combat does. Some spells and abilities have additional effects against targets with these statuses.',
  },

  // ---------------------------------------------------------------------
  // Combat
  // ---------------------------------------------------------------------
  {
    name: 'Heroic Actions',
    category: 'Combat',
    tags: ['Combat'],
    description:
      "On their turn, heroes get 3 actions to attack, move, cast spells, etc. Generally, doing any single thing in combat costs 1 action, though some very strong spells or abilities may cost more. All 3 actions recharge at the end of a hero's turn, so there's no need to save them up -- spend them all and get them all back for the next turn.",
  },
  {
    name: 'Attack',
    category: 'Combat',
    tags: ['Combat', 'Heroic Action'],
    description:
      'Any spell or ability that can harm an enemy counts as an attack. Roll the die listed on the spell, weapon, or ability and deal that much damage; rolling a 1 means the attack misses and has no effect. For attacks with multiple dice, the leftmost die is the Primary Die, and it determines whether the attack hits or misses. Exploding Critical Hits: rolling the maximum on a Primary Die is a critical hit (crit) -- roll the Primary Die again and add the result to the total, repeating each time the maximum is rolled again, with no limit. Crits ignore monster Armor. Rushed Attacks: a hero can attack more than once on their turn, but each additional attack after the first is rushed, imposing cumulative disadvantage for each further attack (increasing the chance to miss and lowering average damage). For abilities that trigger a save instead of an attack roll (e.g. Grappling), enemies instead roll with increasing instances of advantage on subsequent uses.',
  },
  {
    name: 'Move',
    category: 'Combat',
    tags: ['Combat', 'Heroic Action'],
    description:
      'A character can move up to their Speed (6 spaces, unless otherwise noted) as an action. This movement can be broken up with other actions, and a hero can spend multiple actions to Move multiple times in a turn. Moving through Difficult Terrain halves movement speed; moving on a climbable surface (trees, a cliffside, certain buildings, etc.) counts as Difficult Terrain.',
  },
  {
    name: 'Cast Spell',
    category: 'Combat',
    tags: ['Combat', 'Heroic Action'],
    description:
      "Casting a spell requires a hero to have 1 hand free (or a held spellcasting focus), the ability to speak, and may require mana. A spell's mana cost equals its tier; cantrips cost no mana. Upcasting: some spells have a greater effect for each additional mana spent on them, but a hero can only upcast a spell up to the tier they have unlocked.",
  },
  {
    name: 'Assess',
    category: 'Combat',
    tags: ['Combat', 'Heroic Action'],
    description:
      'An action that brings creativity and role-playing into combat. Choose one of the following, then make a DC 12 skill check (whatever skill makes sense for the situation): Ask a Question about a weakness, ability, or immediate plans of enemies, the environment, or the story -- the GM answers honestly. Create an Opening, increasing the next Primary Die roll against a target by 1 this round. Anticipate Danger, reducing all Primary Dice rolled against you by 1 this round. A hero cannot Assess using the same skill more than once in a single encounter, as enemies adapt to repeated tactics.',
  },
  {
    name: 'Free Actions',
    category: 'Combat',
    tags: ['Combat', 'Heroic Action'],
    description:
      'Free Actions do not cost an action or any other resource (such as mana) unless otherwise specified. Heroes can perform one simple task for free per turn -- opening an unlocked door, shouting a simple phrase, dropping an item, ending concentration, etc.',
  },
  {
    name: 'Heroic Reactions',
    category: 'Combat',
    tags: ['Combat'],
    description:
      "Reactions cost 1 action and are performed when it is not the acting hero's turn. A hero can perform each individual reaction no more than once per round, and using a reaction means starting their next turn with fewer actions.",
  },
  {
    name: 'Defend',
    category: 'Combat',
    tags: ['Combat', 'Heroic Reaction'],
    description:
      "A Heroic Reaction: reduce damage from a single attack by your Armor whenever you use this reaction. At the GM's discretion, some damage may not be avoidable this way (e.g. psychic damage, or certain areas of effect).",
  },
  {
    name: 'Interpose',
    category: 'Combat',
    tags: ['Combat', 'Heroic Reaction'],
    description:
      "A Heroic Reaction: if a creature within 2 spaces of you would be struck by an attack, you can push them out of the way and become the new target of the attack instead, entering their space and moving them to an adjacent space of your choice. Interpose can be combined with Defend in the same reaction (as long as you have enough actions to spend on both), but afterward neither reaction can be used again until your next turn is over, since each is limited to once per round.",
  },
  {
    name: 'Opportunity Attack',
    category: 'Combat',
    tags: ['Combat', 'Heroic Reaction'],
    description:
      'A Heroic Reaction: a melee attack made with disadvantage against an adjacent enemy as it willingly moves away from you. Only heroes can make opportunity attacks -- monsters do not.',
  },
  {
    name: 'Help',
    category: 'Combat',
    tags: ['Combat', 'Heroic Reaction'],
    description:
      "A Heroic Reaction: grant an ally advantage on a roll if you can reasonably explain to the GM how you could help in that situation (limited to one Help reaction per roll). The GM may call for a skill check or grant the advantage automatically, depending on how good the idea is.",
  },
  {
    name: 'Monsters & Armor',
    category: 'Combat',
    tags: ['Combat', 'Monsters'],
    description:
      'Most monsters are unarmored, but tougher foes may have Medium or Heavy Armor. Monsters with Armor take damage from only the dice rolled, ignoring all damage modifiers (unless those modifiers are negative). Monsters with Heavy Armor take only half the damage from the dice rolled, likewise ignoring damage modifiers. Crits and damage vulnerabilities ignore monster armor entirely, meaning different heroes, weapons, spells, and abilities will be more or less effective against different kinds of armor.',
  },
  {
    name: 'Minions',
    category: 'Combat',
    tags: ['Combat', 'Monsters'],
    description:
      'Minions are weak enemies that die from any amount of damage. They move and attack at the same time as a group, cannot crit, and their feeble attacks can be Defended against as if they were a single attack. Dealing a large amount of damage to a minion can, at the GM\'s discretion, overflow to other minions within range.',
  },
  {
    name: 'Starting Combat',
    category: 'Combat',
    tags: ['Combat', 'Initiative'],
    description:
      'A combat encounter begins when the GM calls for Initiative. Each hero rolls 1d20 and adds their Initiative bonus (typically their DEX): a single-digit result means they start combat with 1 action, a two-digit result means 2 actions, and a result of 20 or higher (or a natural 20) grants all 3 actions. Regardless of the Initiative roll, every hero gains all 3 actions back at the end of their first turn. Monsters typically act last, though some may be fast enough to act sooner; a monster or monster group acts at the same point in the round each round. Surprise: if a party maneuvers skillfully enough to catch enemies completely off guard, the GM may grant the party advantage on Initiative or, in extreme cases, let each hero start with all 3 actions without rolling Initiative at all. Conversely, if the heroes are surprised, they may have to roll Initiative with disadvantage or, in extreme cases, may automatically start combat with only 1 action, or the monsters may all act first. Merely being hidden or attacking first is not sufficient to gain Surprise -- a target that is on guard or aware of your presence cannot be surprised.',
  },
  {
    name: 'Turn Order',
    category: 'Combat',
    tags: ['Combat', 'Initiative'],
    description:
      'When combat begins, by default the heroes go first, with whichever player is ready first (or whoever makes the most narrative sense) acting first, and play proceeding clockwise around the table. Monsters typically act last.',
  },
  {
    name: 'Turns, Rounds, & Encounters',
    category: 'Combat',
    tags: ['Combat'],
    description:
      "A Turn is when one individual hero or monster group acts, representing roughly 6 seconds of in-world time. A Round is when all players and monsters have taken a turn. An Encounter is all of the rounds in a particular combat. 1/Turn abilities: if you perform a once-per-turn ability on your own turn and can find a way to perform it again on another creature's turn, you may do so (e.g. combining an ability with an Opportunity Attack). 1/Round abilities reset whenever your own turn begins (e.g. Defend cannot be used again until your turn comes back around). Acting Over Multiple Turns: for activities costing more than 1 action, actions can be spent across multiple turns in combat as long as Concentration is maintained and no other actions or reactions (besides free ones) are performed in the meantime.",
  },

  // ---------------------------------------------------------------------
  // Resting
  // ---------------------------------------------------------------------
  {
    name: 'Catch Breath',
    category: 'Resting',
    tags: ['Resting', 'Field Rest'],
    description:
      'A Field Rest option requiring at least 10 minutes to tend to injuries. Expend any number of Hit Dice one at a time, rolling each and adding your STR, to regain that much HP. (If your STR is negative, subtract it from each Hit Die expended instead.)',
  },
  {
    name: 'Make Camp',
    category: 'Resting',
    tags: ['Resting', 'Field Rest'],
    description:
      'A Field Rest option: if you rest for at least 8 hours with food and sleep, take the maximum value for each Hit Die expended instead of rolling, still adding your STR to each Hit Die as usual.',
  },
  {
    name: 'Safe Rests',
    category: 'Resting',
    tags: ['Resting'],
    description:
      'Safe Rests take place in a safe location designated by the GM -- typically lodging at an inn overnight, but could also be a secret oasis, a well-stocked cabin, near a sacred shrine, or similar. Camping in the open wilderness or in a dungeon is not sufficient to gain the benefits of a Safe Rest. After a Safe Rest, heroes recover all HP, Hit Dice, mana (and other class-specific resources), and heal 1 Wound. Safe Rests are a good opportunity for Downtime activities. Lodging costs (per person/day): Poor 5 sp, Comfortable 2 gp, Lavish 10 gp; Lavish inns let players gain one Temporary Boon the following day.',
  },
  {
    name: 'Downtime',
    category: 'Resting',
    tags: ['Resting', 'Downtime'],
    description:
      'Downtime is the time between adventures, spent recuperating and pursuing Downtime Activities -- not every moment needs to be narrated or role-played, and much of it can be skipped over. Example activities: Retrain (retrain chosen abilities/features or, if it fits the story, even a subclass), Gather Information (meet NPCs, pick up news, collect rumors/job leads), Personal Goals (pursue backstory goals or smaller side quests), Buy & Sell (get equipment, sell treasure), Perform (play music, tell stories, compete, or perform publicly for gold or fame), Craft (create weapons, armor, or simple items from acquired materials), Socialize (build alliances, make friends or enemies), Invest (use gold to invest in businesses or trade ventures), Mentor (teach a skill or ability to another character or NPC), Research (investigate a mystery, study ancient texts, uncover hidden knowledge), Serve (aid a patron or deity for a favor, or perform charity), and Build (establish a home base, start a business, craft siege weapons, or build anything else the GM and setting allow).',
  },

  // ---------------------------------------------------------------------
  // Optional Rules
  // ---------------------------------------------------------------------
  {
    name: 'Multiclassing',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      "If the GM wants to allow additional creativity for experienced players (and potentially broken combos), when heroes level up they may choose any class instead of continuing their current one. For example, a level 4 Berserker leveling up could pick Commander and take the level 1 Commander features instead of level 5 Berserker features -- ending up with 4 d12 Hit Dice and a single d10 Hit Die. A hero gains all the equipment proficiencies of every class they've taken, but uses the advantaged/disadvantaged saves of whichever class has the highest level. The GM may need to make the game substantially more challenging if multiclassing is allowed, and may veto any particularly overpowered, unfun, or implausible combination.",
  },
  {
    name: 'Small Groups',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      "A GM and a single hero can play with the aid of a sidekick -- an NPC the hero's player controls in combat, with the GM controlling it outside of combat. Sidekicks get 2 actions and are always 1 level below the hero character. If the main hero dies, the sidekick can be upgraded 1 level and hire its own sidekick to keep the adventure going. A GM can optionally allow one or two sidekicks with a party of 2-3 heroes as well.",
  },
  {
    name: 'Large Groups',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'Third-party adventures are typically balanced for parties of 3-5 players. Playing with very large groups (6-10+ heroes) can be made far more manageable simply by limiting each hero to 2 actions instead of 3 on their turn. No other rebalancing is needed.',
  },
  {
    name: 'Fast Resting',
    category: 'Optional Rules',
    tags: ['Optional', 'Resting'],
    description: 'For a much more heroic and fast-paced story, a Safe Rest can be allowed to heal all Wounds instead of just 1.',
  },
  {
    name: 'Critical Healing',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'Treat healing rolls just like attack rolls: rolling the maximum die value is a crit (roll again and add, exactly like an attack crit), while rolling a 1 is a failure to heal. This variant is fun for groups that enjoy big, dramatic, swingy moments. Consider incrementing the die size by one step if using this variant (d4 -> d6 -> d8 -> d10 -> d12).',
  },
  {
    name: 'Thrown Potions',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'Treat thrown potions like Ranged attacks with Range 8. The potion misses on a roll of 1; otherwise it heals for half as much, since some of it splashes away and is wasted.',
  },
  {
    name: 'Sucker Punch',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'A character standing up from Prone gives adjacent enemies the chance to make an opportunity attack against them -- this applies to both heroes and monsters.',
  },
  {
    name: 'Playing Dead',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'Whenever a hero drops to 0 HP, they can attempt to play dead by falling Prone and making an Influence check (or another skill check appropriate to the situation).',
  },
  {
    name: 'Inspiration',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'Whenever a hero does something memorable -- role-plays a great moment, makes everyone laugh, misses an attack multiple times in a row, or otherwise engages in desired behavior -- the GM can grant Inspiration: the ability to reroll any single die. Inspiration expires after a Safe Rest.',
  },
  {
    name: 'Retreat',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      "Any hero may call for a retreat on their turn. If the party agrees -- unless there's a good story reason they can't escape (e.g., trapped in nets and surrounded) -- the GM allows them to flee. Each hero describes their own escape (casting a spell, using equipment, making a skill check). Consequences may follow, such as taking damage, suffering a Wound, or failing a quest, though a particularly clever escape may let the party leave without additional consequence.",
  },
  {
    name: 'Different Key Stats',
    category: 'Optional Rules',
    tags: ['Optional'],
    description: "Players can swap a class's KEY or Secondary stats if it makes narrative or mechanical sense (e.g. DEX and WIL for the Cheat).",
  },
  {
    name: 'Complex Characters',
    category: 'Optional Rules',
    tags: ['Optional'],
    description: 'A GM may allow heroes to pick 2 Backgrounds and/or ancestry bonuses instead of just 1.',
  },
  {
    name: 'Custom Weapon Dice',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      'For larger weapon die sizes, dice of a different size can be used as long as they add up to the same initial die size. For example, a 1d10 glaive could instead use 1d4+1d6 or 1d6+1d4, using the first listed die as the Primary Die.',
  },
  {
    name: 'I Had the High Ground',
    category: 'Optional Rules',
    tags: ['Optional'],
    description:
      "Taking a crit while at a... [Note: the Nimble Core Rules book cuts this rule off mid-sentence at the bottom of the Optional Variant Rules page -- the rest of its text is not present in the printed source.]",
  },

  // ---------------------------------------------------------------------
  // Measuring Spaces
  // ---------------------------------------------------------------------
  {
    name: 'Diagonal Spaces',
    category: 'Measuring Spaces',
    tags: ['Movement'],
    description:
      "Treating diagonal spaces as adjacent is the default assumption in Nimble, as it tends to be easier and faster (though it can cause some spatial 'weirdness'). Tables that prefer more precision can instead treat diagonals as not adjacent at all, or count every other diagonal as adjacent (fiddlier, but a good balance). Whatever heroes can do (moving or attacking diagonally), monsters can do as well.",
  },
  {
    name: 'Cones & Lines',
    category: 'Measuring Spaces',
    tags: ['Movement'],
    description:
      'For a cone, start at the character and extend up to X spaces outward; the cone can be up to X spaces wide at its farthest edge (it can be made narrower than X, but not wider). For a line, start at the character and extend the area up to X spaces in a single direction (it can be made shorter, but not longer), 1 space wide. A space is included in the effect if it is at least half covered by the cone or line.',
  },

  // ---------------------------------------------------------------------
  // Glossary (terms not already captured above)
  // ---------------------------------------------------------------------
  {
    name: 'Ally',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'A friendly creature, not yourself.',
  },
  {
    name: 'Blindsight X',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'The ability to sense creatures and obstacles within X spaces, ignoring the effects of being Blinded, darkness, and invisibility.',
  },
  {
    name: 'Cantrip',
    category: 'Glossary',
    tags: ['Glossary', 'Spells'],
    description: "A basic spell that costs 0 mana to cast; its power increases as the caster levels up.",
  },
  {
    name: 'Climbing',
    category: 'Glossary',
    tags: ['Glossary', 'Movement'],
    description: 'A creature with a climbing speed can move across vertical surfaces as though they were flat ground.',
  },
  {
    name: 'd44/d66/d88',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'Roll 2 of the same die: the leftmost die result is the tens place, and the second is the ones place. These rolls cannot miss or crit.',
  },
  {
    name: 'Darkvision X',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'The ability to see normally in the dark, up to X spaces.',
  },
  {
    name: 'Decrement/Increment',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'Use a die one size smaller or larger, following the progression d4 -> d6 -> d8 -> d10 -> d12 -> d20.',
  },
  {
    name: 'Difficult Terrain',
    category: 'Glossary',
    tags: ['Glossary', 'Movement'],
    description:
      'Speed is halved while moving through Difficult Terrain (e.g., moving through the space of an enemy, climbing a climbable surface, etc.).',
  },
  {
    name: 'Distracted',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'A target is Distracted if it is adjacent to or Taunted by an ally, or if it cannot see you.',
  },
  {
    name: 'KEY',
    category: 'Glossary',
    tags: ['Glossary'],
    description:
      "When an ability or spell references 'KEY,' use one of your Key Stats. If a stat is listed before a die roll, roll a number of dice equal to the stat -- e.g., 'WIL d8' with a WIL of 2 means rolling 2d8 (two eight-sided dice).",
  },
  {
    name: 'Knockback/Push X',
    category: 'Glossary',
    tags: ['Glossary', 'Movement'],
    description:
      'Forcibly move a creature X spaces, ignoring Difficult Terrain. Other creatures or the environment may halt the movement prematurely and deal damage (see Falling & Forced Movement).',
  },
  {
    name: 'LVL',
    category: 'Glossary',
    tags: ['Glossary'],
    description: "Shorthand used in ability text; replace it with the hero's current level.",
  },
  {
    name: 'Mana',
    category: 'Glossary',
    tags: ['Glossary', 'Spells'],
    description: 'A resource used to fuel spellcasting; classes gain and spend mana according to their class features.',
  },
  {
    name: 'Move X',
    category: 'Glossary',
    tags: ['Glossary', 'Movement'],
    description: 'Move up to that many spaces.',
  },
  {
    name: 'Paralyzed, Stunned, Unconscious',
    category: 'Glossary',
    tags: ['Glossary', 'Condition'],
    description:
      "These all function as Incapacitated: the affected creature can't do anything, attacks against it have advantage, and melee attacks that hit against it automatically crit.",
  },
  {
    name: 'Resistance',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'Take half as much damage from a given source or damage type.',
  },
  {
    name: 'Skill Points',
    category: 'Glossary',
    tags: ['Glossary'],
    description: "Points spent to increase a hero's skills. Heroes start with 4 at level 1 and gain 1 more each level.",
  },
  {
    name: 'Spellcasting Focus',
    category: 'Glossary',
    tags: ['Glossary', 'Spells'],
    description: 'An item that can be used instead of a free hand to cast spells.',
  },
  {
    name: 'Target',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'A selected creature or object being affected by an attack, spell, or ability. It must be within Range/Reach and able to be sensed.',
  },
  {
    name: 'Teleport',
    category: 'Glossary',
    tags: ['Glossary', 'Movement'],
    description: 'Move instantaneously from one point to another. Teleporting does not provoke opportunity attacks.',
  },
  {
    name: 'Unheld',
    category: 'Glossary',
    tags: ['Glossary'],
    description: 'Not touched, worn, or held by anyone.',
  },
  {
    name: 'Vulnerable',
    category: 'Glossary',
    tags: ['Glossary'],
    description:
      'When a creature is vulnerable to a damage type, that damage ignores its armor entirely; if the creature is unarmored, it instead takes double damage from that type.',
  },
];

async function main() {
  const client = createSupabaseClient();

  // Idempotency guard: prevent re-seeding if Nimble Core Rules rules already exist.
  const { data: existing, error: existingError } = await client
    .from('rules')
    .select('id')
    .eq('source_id', SOURCE_ID)
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing rules: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error('Nimble Core Rules rules already seeded. Delete existing rows for this source before re-running this script.');
  }

  let created = 0;
  for (const rule of RULES) {
    await createRule(client, {
      name: rule.name,
      system_id: SYSTEM_ID,
      source_id: SOURCE_ID,
      is_homebrew: false,
      category: rule.category,
      tags: rule.tags,
      description: rule.description,
    });
    created += 1;
  }

  console.log(`Seeded ${created} rules from the Nimble Core Rules.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
