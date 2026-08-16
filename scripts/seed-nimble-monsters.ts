import { createSupabaseClient } from '../lib/supabase/client';
import { createMonster, type MonsterInput } from '../lib/content/monsters';

const SYSTEM_NIMBLE = 'f9f3ee85-7dc8-4db9-a0e8-4a818462f056';
const SOURCE_FEY = 'e2029979-d16f-40c4-a38c-4466b0c4df7f';
const SOURCE_FIENDS = '242cef4b-23bf-4a39-ab33-5430192b6727';
const SOURCE_GIANT_BUGS = '803cab3f-5ae0-48be-a61b-c9c33303dea0';
const SOURCE_GMG = '20251ac1-786a-4b14-8e9f-0f6e8fa4cee4';

type Row = Omit<MonsterInput, 'system_id' | 'is_homebrew' | 'source_id'>;

function fey(m: Row): MonsterInput {
  return { ...m, system_id: SYSTEM_NIMBLE, source_id: SOURCE_FEY, is_homebrew: false };
}
function fiend(m: Row): MonsterInput {
  return { ...m, system_id: SYSTEM_NIMBLE, source_id: SOURCE_FIENDS, is_homebrew: false };
}
function bug(m: Row): MonsterInput {
  return { ...m, system_id: SYSTEM_NIMBLE, source_id: SOURCE_GIANT_BUGS, is_homebrew: false };
}
function gmg(m: Row): MonsterInput {
  return { ...m, system_id: SYSTEM_NIMBLE, source_id: SOURCE_GMG, is_homebrew: false };
}

const MONSTERS: MonsterInput[] = [
  // ============================= FEY =============================
  fey({
    name: 'Sprite',
    rating_label: 'Lvl 1/2',
    tags: ['Fey'],
    description:
      'A minor fey that appears to mortals as a winged ball of light. Sprites enjoy a carefree life, but may resort to violence if someone intrudes on their fun. Subject to Spritely Evasion: attacks against Faerie-type fey are rolled with disadvantage and miss on a 2 or less. Fae Trick: deals 1d4+4 damage.',
    stats: { Size: 'Tiny', HP: '12', Speed: 'Fly' },
  }),
  fey({
    name: 'Faerie',
    rating_label: 'Lvl 2',
    tags: ['Fey'],
    description:
      'Tiny, mischievous winged humanoids that go about their jokes and schemes with boundless enthusiasm. Subject to Spritely Evasion: attacks against Faerie-type fey are rolled with disadvantage and miss on a 2 or less. Tricksy Magic (Range 6): deals 1d4+10 psychic damage.',
    stats: { Size: 'Tiny', HP: '20', Speed: 'Fly' },
  }),
  fey({
    name: 'Faerie Troubadour',
    rating_label: 'Lvl 3',
    tags: ['Fey'],
    description:
      'Faeries love music, and a Troubadour\'s magical tunes escalate whatever chaos other Faeries are causing nearby. Subject to Spritely Evasion. Invigorating Presence (Reach 4): nearby Fey gain medium armor and advantage on attacks. Clamorous Chorus (Reach 4): enemies make a WIL save, taking 15 psychic damage minus the save result.',
    stats: { Size: 'Tiny', HP: '26', Speed: 'Fly' },
  }),
  fey({
    name: 'Faerie Merrymaker',
    rating_label: 'Lvl 4',
    tags: ['Fey'],
    description:
      'Faerie Merrymakers always carry a bag of tricks, and their Pyrotechnics are a welcome addition to any party. Subject to Spritely Evasion. Prank Bomb (Range 4): deals 2d4+10 damage; on hit, choose Sticky Gum (target Slowed 1 round) or Smelly Gas (target Poisoned 1 round).',
    stats: { Size: 'Tiny', HP: '38', Speed: 'Fly' },
  }),
  fey({
    name: 'Faerie Trickmage',
    rating_label: 'Lvl 6',
    tags: ['Fey'],
    description:
      'Trickmages use illusions to drag bystanders into their convoluted plots, hiding their true motives until the final reveal. Subject to Spritely Evasion. Stop Hitting Yourselves! (Reaction, 1/round, Reach 4): swaps the position of two creatures. Illusory Assault (Reach 4): creates 3 illusory fey minions (d4) in empty spaces adjacent to a hero that attack immediately; if a minion would attack with advantage, its die size increments one step instead.',
    stats: { Size: 'Tiny', HP: '50', Speed: 'Fly' },
  }),
  fey({
    name: 'Gremlin',
    rating_label: 'Lvl 3',
    tags: ['Fey'],
    description:
      'Ugly, pot-bellied little troublemakers who spend all day moving and hiding household objects and insulting anyone they come across. Come Get Some!: if no heroes are Taunted, a Gremlin may Taunt all heroes for 1 round. Weeee!: deals 1d6+10 damage; if the target is Small or larger, gains Riding on them. If an attack misses a Gremlin that is Riding a hero, it hits the ridden hero instead — Gremlins find this hilarious.',
    stats: { Size: 'Small', HP: '38' },
  }),
  fey({
    name: 'Gremlin Wrestler',
    rating_label: 'Lvl 4',
    tags: ['Fey'],
    description:
      'Gremlin Wrestlers are nasty bullies that immobilize much larger opponents with a mix of practical martial arts and fey magic. Come Get Some! Punching Up: can Grapple Large creatures. I\'mma Mess You Up!: deals 2d6+10 damage; on hit, target is Grappled (escape DC 12) and, if already Grappled, also knocked Prone.',
    stats: { Size: 'Small', HP: '46' },
  }),
  fey({
    name: 'Gremlin Roastmaster',
    rating_label: 'Lvl 6',
    tags: ['Fey'],
    description:
      'High-status Gremlins that lead a gang of their peers using insults and intimidation, using dirty tricks and cheap shots against anyone who threatens their gang. Come Get Some! Take a look at this tough guy! (Reach 6): heroes who miss their attacks suffer 5 psychic damage. Cheap Shot: deals 1d6+10 damage, or 20 damage instead if the target is Hampered.',
    stats: { Size: 'Small', HP: '68' },
  }),
  fey({
    name: 'Bogey',
    rating_label: 'Lvl 10',
    tags: ['Fey'],
    description:
      'Distant cousins of Gremlins; their lanky, hulking forms belie their cunning nature. Unlike most Fey, Bogeys are overtly malicious, taking cruel satisfaction in the pain and sadness of those they lure into the dark. Come Get Some! Taste for Violence: if a Bogey has 2 or more adjacent heroes, it uses a d20 for its attacks. Choose twice: Smash and Grab (1d10+5 damage, on hit Grappled escape DC 14) or Headbutt (if Grappling target, 1d10+10 damage and Dazed).',
    stats: { Size: 'Large', HP: '120' },
  }),
  fey({
    name: 'Mav, The Winter Queen',
    rating_label: 'Level 10 Solo Avatar of Seasons',
    tags: ['Fey', 'Legendary'],
    description:
      'A formidable fey monarch who rules over a wintry domain, the equal and opposite ruler to Titania, the good-natured May Queen. Mav aspires to bring about a winter that never ends in the mortal realm. Wind Ward: attacks from Range 6 or beyond have disadvantage against her. Ice Avatar: resistant to Ice, vulnerable to Fire (when dealt Fire damage, her next attack is made with advantage). ACTIONS: after each hero\'s turn, choose one: Winter\'s Wrath (1 use, Reach 8) creates a 6x6 wintry storm area dealing 10 damage, plus 10 more to anyone entering it or ending their turn there; Wolf-Spirit\'s Bite moves 10 and attacks for 1d10+8, dragging the target 2 spaces on hit; Stormlord\'s Gust (Reach 8) forces all heroes to make a DC 15 STR save or be moved up to 4 spaces in the same direction (half as far on success). BLOODIED: at 140 HP her storm grows to 8x8, she is no longer vulnerable to Fire, and her forced movement doubles. LAST STAND: 100 more damage banishes her to the Wildscapes; her storm ends and she summons icy shards covering the ground within Reach 12, dealing 3 damage per space moved through the area.',
    stats: { HP: '280', Armor: 'Medium', Saves: 'ALL+' },
  }),
  fey({
    name: 'Razzle, Gremlin Iconoclast',
    rating_label: 'Level 7 Small, Insufferable Rascal',
    tags: ['Fey', 'Legendary'],
    description:
      'Razzle is an unspeakably awful little creature — this makes him quite popular amongst Gremlins. "The Boys": when combat begins, 2 Gremlin minions per hero arrive as well. Endless Stream of Vile Insults: all heroes are permanently Taunted by Razzle. ACTIONS: after each hero\'s turn, choose one: Poke Eyes, Pull Hair (if a minion died last turn) teleports to an enemy, gains Riding, and attacks for 1d6+6 (on hit Blinded 1 round, then summons 1 minion/hero if heroes outnumber gremlins); Get \'em Boys! (if no minions died last turn) all minions move then attack for 1d6 each (1d8 vs a Blinded or Ridden hero). BLOODIED: "Razzle Dazzle!" — at 100 HP a flash of glitter Blinds all heroes for 1 round, and Razzle may teleport 8 and summon 1 minion/hero. LAST STAND: 70 more damage banishes him to the Wildscapes; 3 Gremlin minions per hero arrive to protect him, and Razzle turns invisible until the end of the next hero\'s turn.',
    stats: { HP: '200', Armor: 'Medium', Saves: 'STR+, WIL+' },
  }),

  // ============================= FIENDS =============================
  fiend({
    name: 'Nalfeshnee',
    rating_label: 'Lvl 19',
    tags: ['Fiend'],
    description:
      'A grotesque swine-fiend, bloated with dark magic. Spellthief: can cast a spell it saw cast this round. Ichorbolt (Range 6): deals d66 damage to creatures in a 3x3 area.',
    stats: { Size: 'Large', HP: '290', Speed: 'Teleport 12' },
  }),
  fiend({
    name: 'Glabrezu',
    rating_label: 'Lvl 14',
    tags: ['Fiend'],
    description:
      'A mighty fiend with terrible pincers and a heavy carapace. Doomclaw (2x, Reach 2): deals 3d6+10 damage; on damage the target is Grappled (escape DC 17), and if grappled by both claws must escape from each separately. Tear Asunder (on a creature Grappled by both claws): deals 50 unpreventable damage; if the target is at 0 HP, it must make a DC 17 STR save or be torn in two, dying instantly.',
    stats: { Size: 'Large', HP: '110', Armor: 'Heavy' },
  }),
  fiend({
    name: 'Hezrou',
    rating_label: 'Lvl 13',
    tags: ['Fiend'],
    description:
      'A nightmarish toad-fiend, large enough to swallow a horse whole. Bite (2x, highest die is Primary): deals 2d6+6 damage. On crit, the target is Consumed: at the end of each of the target\'s turns it suffers 2d6+6 damage (ignoring armor) and 1 Wound, and its attacks gain advantage and ignore armor, until it teleports away or escapes (DC 15).',
    stats: { Size: 'Large', HP: '150', Armor: 'Medium', Speed: 'Jump' },
  }),
  fiend({
    name: 'Vrock',
    rating_label: 'Lvl 11',
    tags: ['Fiend'],
    description:
      'A foul, carrion bird, often kept by fiends as a living alarm system. Horrid Screech (Reach 6): deals 20 psychic damage ignoring armor, and enemies are also Dazed on a failed DC 15 STR save; at Reach 18, deals 10 damage instead but grants advantage on the save.',
    stats: { Size: 'Large', HP: '130', Speed: 'Fly' },
  }),
  fiend({
    name: 'Incubus/Succubus',
    rating_label: 'Lvl 8',
    tags: ['Fiend'],
    description:
      'Cruel tempters who use their allure to sow chaos and inflict pain. Infernal Allure: at the beginning of each round, Allures 1 hero on a failed DC 15 WIL save, spending one of their actions this round; they gain advantage on the save for each time they\'ve failed it this encounter. Brimstone Whip (Reach 3): deals 2d6+6 damage.',
    stats: { HP: '90' },
  }),
  fiend({
    name: 'Hookspawn',
    rating_label: 'Lvl 6',
    tags: ['Fiend'],
    description:
      'Its enormous scythe-like hooks prevent prey from fleeing. Rend (2x): deals 1d6+6 damage; on damage the target is Lacerated, suffering 1 damage for each space it moves (or is moved) until healed or a DC 15 Examination check ends it.',
    stats: { Size: 'Large', HP: '68' },
  }),
  fiend({
    name: 'Spiny Fiend',
    rating_label: 'Lvl 4',
    tags: ['Fiend'],
    description:
      'Covered in wickedly sharp spines that serve as both a defense and a cruel offense. Spines: melee attackers take 3 damage in return. Claws (2x): deals 1d6+6 damage. Shoot Spine (Range 12): deals 1d6+6 damage.',
    stats: { HP: '49' },
  }),
  fiend({
    name: 'Imp',
    rating_label: 'Lvl 2',
    tags: ['Fiend'],
    description:
      'Cowardly opportunists who strike whenever attention falters. Cowardly: gains advantage on attacks when an ally is adjacent, disadvantage otherwise. Sting: deals 1d6+6 damage.',
    stats: { Size: 'Small', HP: '34', Speed: 'Fly' },
  }),
  fiend({
    name: 'Stenchling',
    rating_label: 'Lvl 1/2',
    tags: ['Fiend'],
    description:
      'Scavengers whose foul stench makes them a menace to all. Bite: deals 2d6 damage. Putrid Cloud (on death): deals 2d6 poison damage to enemies within Reach 2.',
    stats: { Size: 'Small', HP: '18' },
  }),
  fiend({
    name: 'Executor',
    rating_label: 'Lvl 18',
    tags: ['Fiend'],
    description:
      'Direct envoys to Vorgrath, these towering, supreme judges wield dominion over the minds of those who dare stand against them. Torment (Reach 8): selects up to 3 enemies, each of whom must secretly choose Courage (suffer 2d20 damage) or Cowardice (take no damage; but if ALL choose Cowardice, everyone suffers 2d20 damage and 1 Wound).',
    stats: { Size: 'Large', HP: '270' },
  }),
  fiend({
    name: 'Lashfiend',
    rating_label: 'Lvl 10',
    tags: ['Fiend'],
    description:
      'Vengeful fiends with spiny, whip-like tails who revel in revenge. "I Offer You REVENGE!": when attacked, the target may choose to make a DC 15 STR save. Punish (Reach 8): deals 2d20+10 damage; if its Offer was accepted, it rolls an additional d20 — on a successful save the hero chooses one of the rolled dice for the Lashfiend to suffer instead, taking the remaining damage themselves.',
    stats: { Size: 'Large', HP: '130' },
  }),
  fiend({
    name: 'Justiciar',
    rating_label: 'Lvl 6',
    tags: ['Fiend'],
    description:
      'Large judges of Fiendlaw with enormous, gaping maws who bellow judgments toward foes, forcing them into terrible deals. Infernal Edict: when damaged by the Justiciar, enemies must accept the next Offer they receive, and suffer 5 damage whenever they act while it is not their turn. Cruel Judgment (Reach 6): deals 1d20+5 damage.',
    stats: { Size: 'Large', HP: '70' },
  }),
  fiend({
    name: 'Overlord',
    rating_label: 'Lvl 15',
    tags: ['Fiend'],
    description:
      'Eyeless, robed lawmakers who tip the scales ever in their own favor, enforcing deals through malevolent cunning. Cruel Dealer: whenever an enemy rejects an Offering, they take 10 psychic damage. ACTIONS (Reach 8): Rise, My Minions! summons 3 fiendish minions (size d8); We Offer You Clarity! has each fiendish minion Offer to Taunt an enemy.',
    stats: { Size: 'Large', HP: '200' },
  }),
  fiend({
    name: 'Hierarch',
    rating_label: 'Lvl 13',
    tags: ['Fiend'],
    description:
      'High-Judges of Fiendlaw who tip the scales ever in their own favor. Tip the Scales: enemies roll with disadvantage (+1 disadvantage), allies roll with advantage (+1 advantage). I Offer You ABSOLUTION! (Reach 8): permits 1 hero to kneel (Prone), otherwise punishes them for 2d20+10 damage.',
    stats: { Size: 'Large', HP: '170' },
  }),
  fiend({
    name: 'Pactmonger',
    rating_label: 'Lvl 3',
    tags: ['Fiend'],
    description:
      'Cruel predators who seek out and feed upon the weak-willed and power-hungry. I Offer You POWER! (Reach 8): offers a hero an additional action, then Reckoning (Reach 8) deals 2d8+4 damage, or twice as much if the target already accepted an Offer this round.',
    stats: { HP: '40' },
  }),
  fiend({
    name: 'Grumbulus',
    rating_label: 'Lvl 2',
    tags: ['Fiend'],
    description:
      'Blackmailing little secret-hoarders who leverage illicit information to hold sway over other fiends. Gnash: deals 2d8+4 damage. I Offer You SECRETS! (1 use): when an attacker would kill it, offers control of a random Fiend on the attacker\'s next turn — if accepted, it can\'t be harmed this round.',
    stats: { Size: 'Small', HP: '32' },
  }),
  fiend({
    name: 'Quasit',
    rating_label: 'Lvl 1',
    tags: ['Fiend'],
    description:
      'Diminutive, horned fellows with exquisitely tailored suits. Mobile: moves 3 spaces away after attacking. Slash: deals 1d8+4 damage. I Offer You RICHES! (1 use): when an attacker would kill it, offers LVL gold pieces — if accepted, it can\'t be harmed this round.',
    stats: { Size: 'Tiny', HP: '20' },
  }),
  fiend({
    name: 'Lumbrax',
    rating_label: 'Lvl 4',
    tags: ['Fiend'],
    description:
      'Hulking, powerful, but lazy — they prefer to have their underlings do most physical labor for them. "I Offer You REPRIEVE!": if accepted, summons 3 minions (size d8); if rejected, uses Brutalize instead, dealing 2d20 damage.',
    stats: { Size: 'Large', HP: '50' },
  }),
  fiend({
    name: 'Vorgrath, the Insatiable',
    rating_label: 'Level 14 Solo Progenitor of Fiends',
    tags: ['Fiend', 'Legendary'],
    description:
      'The Progenitor of Fiends. ACTIONS: after each hero\'s turn, performs 1 action (recommended in order): Bow Before Me! has each hero roll 3d20 and choose to bow (become Prone) or take that much damage; Serve Me! (on a Prone target) spends 3 of their actions for them (they regain any spent actions); Suffer! flies 8 then uses Ichorbolt (Range 8) dealing d66 damage to creatures in a 3x3 area. BLOODIED: "BLEED WITH ME!" — at 187 HP, Vorgrath inflicts Lacerated on all heroes (suffer 1 damage per space moved or forcibly moved; healing or a DC 15 Examination check ends it). LAST STAND: "Your Pain Will Be Unending!" — 140 more damage and he dies; until then he can force a hero within Reach 8 to Interpose for him (1 time use).',
    stats: { HP: '375', Armor: 'Medium', Saves: 'ALL+' },
  }),

  // ============================= GIANT BUGS =============================
  bug({
    name: 'Bug Minion',
    rating_label: 'Minion',
    tags: ['Giant Bug'],
    description:
      'Wherever there is a bug, there are more bugs nearby. Multiple small creatures can fit in a single space, and a surrounded hero facing 10-20 minions can be in serious danger. Bite: deals 1d4 damage, or 2 damage instead on a hit (follows minion rules).',
    stats: { Size: 'Small' },
  }),
  bug({
    name: 'Giant Bug',
    rating_label: 'Lvl 1/3',
    tags: ['Giant Bug'],
    description:
      'Many giant bug species are able to eat anything and live anywhere, infesting caves, wildernesses, and even urban environs. Swarming Pheromones: at the end of each round, summons a Bug Minion. Bite: deals 1d4 damage.',
    stats: { Size: 'Small', HP: '12' },
  }),
  bug({
    name: 'Toughrider Bug',
    rating_label: 'Lvl 1',
    tags: ['Giant Bug'],
    description:
      'Possesses a tough chitin coat and powerful jaws able to grip anything to the death; can fell entire forests if left unchecked. Swarming Pheromones: at the end of each round, summons a Bug Minion. Strong Jaws: deals 1d4+4 damage; on hit gains Riding on the target.',
    stats: { Size: 'Small', HP: '20', Armor: 'Medium' },
  }),
  bug({
    name: 'Jacker Bug',
    rating_label: 'Lvl 2',
    tags: ['Giant Bug'],
    description:
      'When stung, every drop of blood in the victim\'s body bends toward protecting their toxic captor until they die. Swarming Pheromones: at the end of each round, summons a Bug Minion. Jacker Toxin: deals 1d4+4 damage; on damage the target is Hijacked, forced to Interpose for the Jacker for free once per round when able (healing ends it).',
    stats: { Size: 'Small', HP: '34' },
  }),
  bug({
    name: 'Acidshot Bug',
    rating_label: 'Lvl 2',
    tags: ['Giant Bug'],
    description:
      'Possesses caustic sacs of acid and the deft skill to fire them at long range, also oozing it at anyone who ventures too close. Swarming Pheromones: at the end of each round, summons a Bug Minion. Acid Splash: melee attackers take 2 damage in return. Acid Shot (Range 6): deals 1d4+4 damage.',
    stats: { Size: 'Small', HP: '34' },
  }),
  bug({
    name: 'Bonfire Bug',
    rating_label: 'Lvl 3',
    tags: ['Giant Bug'],
    description:
      'Molting season makes these infernal insects aggressive; do not approach. Swarming Pheromones: at the end of each round, summons a Bug Minion. Sizzle: deals 1d4+4 damage. Skittering Eruption: moves 3 then deals 1d20 damage to all adjacent creatures.',
    stats: { Size: 'Small', HP: '34' },
  }),
  bug({
    name: 'Hivedriver Bug',
    rating_label: 'Lvl 4',
    tags: ['Giant Bug'],
    description:
      'These bugs live long enough to grow to the size of a coach and become a living hive — kill on sight. Swarming Pheromones: at the end of each round, summons a Bug Minion. Distress Call: when attacked, summons a Bug Minion. Swarm: summons a Bug Minion. Bite: deals 1d4+4 damage; on crit, summons a Bug Minion.',
    stats: { Size: 'Large', HP: '34' },
  }),
  bug({
    name: 'Vicejaw Bug',
    rating_label: 'Lvl 4',
    tags: ['Giant Bug'],
    description:
      'Dedicated soldiers used to protect a colony, with long, vice-like mandibles that have a powerful grip. Chitinous Plating: reduces all non-critical damage by 10. Vicejaw (Reach 2): deals 2d10+8 damage; on hit the target is Grappled (escape DC 14), and attacks that miss the Vicejaw Bug damage the grappled target instead.',
    stats: { Size: 'Large', HP: '25' },
  }),
  bug({
    name: 'Thrum Bug',
    rating_label: 'Lvl 4',
    tags: ['Giant Bug'],
    description:
      'Herbivorous bugs with hollow resonance chambers and legs that can mimic sounds from other terrifying creatures. Chitinous Plating: reduces all non-critical damage by 10. Ominous Vibrations (Reach 4): enemies make a WIL save, suffering 12 psychic damage minus the save result; on damage, they are Frightened for 1 round.',
    stats: { Size: 'Large', HP: '25' },
  }),
  bug({
    name: 'Spitbug',
    rating_label: 'Lvl 5',
    tags: ['Giant Bug'],
    description:
      'Its projectiles do not technically originate from its mouth, but scholars agreed naming the attack "spit" would have been too crude. Chitinous Plating: reduces all non-critical damage by 10. Acid Spit (Range 8): deals 2d10+5 damage. Gooey Spit (Range 8): deals 1d10+5 damage; on hit the target is Restrained (escape DC 12).',
    stats: { Size: 'Large', HP: '30' },
  }),
  bug({
    name: 'Maneater Bug',
    rating_label: 'Lvl 5',
    tags: ['Giant Bug'],
    description:
      'A misnomer — it will gladly devour any person it can ambush. Chitinous Plating: reduces all non-critical damage by 10. Stalker: starts first, anywhere on the battlefield. Quick Strike (2x): deals 1d10+10 damage; on damage the target is Grappled and takes -5 to their Initiative roll. Devour (on a Grappled creature): deals 2d20+10 damage.',
    stats: { Size: 'Large', HP: '30' },
  }),
  bug({
    name: 'Rhino Bug',
    rating_label: 'Lvl 6',
    tags: ['Giant Bug'],
    description:
      'Among the strongest bugs in the world; many attempts have been made to tame them, to no avail. They flip each other over with their horns in contests of dominance. Chitinous Plating: reduces all non-critical damage by 10. Charge: moves 6 in a line, dealing 2d10+10 damage to all creatures moved through; on damage they are knocked Prone.',
    stats: { Size: 'Large', HP: '40' },
  }),
  bug({
    name: 'Ballistic Bug',
    rating_label: 'Lvl 6',
    tags: ['Giant Bug'],
    description:
      'When disturbed it displays a spectacular defense mechanism: a noxious eruption of boiling oil. Chitinous Plating: reduces all non-critical damage by 10. Noxious Blast (Cone 4): deals 3d10+10 damage and Poisons for 1 round; can\'t use this attack again next round.',
    stats: { Size: 'Large', HP: '40' },
  }),
  bug({
    name: 'Broodfly Drake',
    rating_label: 'Level 9 Solo Large Beetledragon',
    tags: ['Giant Bug', 'Legendary', 'Dragon'],
    description:
      'A massive beetle-dragon hybrid that commands swarms of bugs. Chitinous Plates: reduces all non-critical damage by 10. Broodcall: at the end of each of its turns, summons 1 Bug Minion per hero. ACTIONS: after each hero\'s turn, moves 4 then chooses one: Pheromone Spit (Reach 6) deals 3d4+10 damage, and on hit all bug minions move and then attack the same target; Crush flies 8 then deals 2d20+10 damage to creatures in a 2x2 area, taking this damage itself as well. BLOODIED: at 45 HP, loses its Chitinous Plates ability. LAST STAND: 90 more damage and it dies; until then its minions move and attack at the end of each of its turns.',
    stats: { HP: '90', Armor: 'Medium', Saves: 'STR+, WIL+' },
  }),

  // ============================= GAME MASTER GUIDE =============================
  // --- Kobolds ---
  gmg({
    name: 'Kobold Minion',
    rating_label: 'Lvl 1/4',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. Stab: deals 1d4 damage (follows minion rules).',
    stats: { Size: 'Small' },
  }),
  gmg({
    name: 'Kobold',
    rating_label: 'Lvl 1/3',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. Stab: deals 1d4+2 damage (or Sling, Range 8).',
    stats: { Size: 'Small', HP: '12' },
  }),
  gmg({
    name: 'Kobold Sneak',
    rating_label: 'Lvl 1/2',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. Revenge!: when an ally dies, may move up to 6 spaces before using Nooooo!. Stab: deals 1d4+2 damage (or Sling, Range 8).',
    stats: { Size: 'Small', HP: '15' },
  }),
  gmg({
    name: 'Kobold Clanger',
    rating_label: 'Lvl 1',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. CLANG!: allies who hear its clanging roll 1 additional die whenever they attack.',
    stats: { Size: 'Small', HP: '16', Armor: 'Heavy' },
  }),
  gmg({
    name: 'Kobold Trapper',
    rating_label: 'Lvl 1',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. Throw Scorpion (2x, Range 8): deals 1d4+2 damage. Trap!: when an enemy moves adjacent to it or an ally, triggers one of its traps (1/encounter each) — BEEES! deals 5d4 damage (can\'t miss, half to all adjacent creatures) or HIDDEN NET! Restrains the target (escape DC 10).',
    stats: { Size: 'Small', HP: '26' },
  }),
  gmg({
    name: 'Kobold Denwarden',
    rating_label: 'Lvl 1',
    tags: ['Kobolds'],
    description:
      'Small, maniacal dragonlings, fiercely protective of their own. Nooooo!: when an ally within 2 spaces dies, attacks once for free. Hold!: adjacent allies gain Medium Armor. Stab (2x): deals 1d4+2 damage (or Sling, Range 8).',
    stats: { HP: '20', Armor: 'Medium' },
  }),
  // --- Goblins ---
  gmg({
    name: 'Goblin Minion',
    rating_label: 'Lvl 1/4',
    tags: ['Goblins'],
    description:
      'Green, cunning, and thriving on the edge of chaos — will mock you mercilessly if given the chance. Haha, Missed Me!: whenever an attack misses it, deals 1 psychic damage in return. Stab: deals 1d6 damage (follows minion rules).',
    stats: { Size: 'Small' },
  }),
  gmg({
    name: 'Goblin',
    rating_label: 'Lvl 1/3',
    tags: ['Goblins'],
    description:
      'Green, cunning, and thriving on the edge of chaos — will mock you mercilessly if given the chance. Haha, Missed Me!: whenever an attack misses it, deals 1 psychic damage in return. Stab: deals 1d6+2 damage (or Shoot, Range 8).',
    stats: { Size: 'Small', HP: '15' },
  }),
  gmg({
    name: 'Bugbear',
    rating_label: 'Lvl 2',
    tags: ['Goblins'],
    description:
      'Green, cunning, and thriving on the edge of chaos. Haha, Missed Me!: whenever an attack misses it, deals 1 psychic damage in return. Cleave: deals 2d6+4 damage. Javelin (Range 8): deals 1d6+2 damage.',
    stats: { HP: '30', Armor: 'Medium' },
  }),
  gmg({
    name: 'Goblin Taskmaster',
    rating_label: 'Lvl 2',
    tags: ['Goblins'],
    description:
      'Green, cunning, and thriving on the edge of chaos. Haha, Missed Me!: whenever an attack misses it, deals 1 psychic damage in return. Meat Shield: can force other goblins to Interpose for it. Stab: deals 1d6+2 damage (or Shoot, Range 8), then Get in here!: calls a goblin minion to join the fight.',
    stats: { Size: 'Small', HP: '30', Armor: 'Medium' },
  }),
  gmg({
    name: 'Goblin Ratrider',
    rating_label: 'Lvl 2',
    tags: ['Goblins'],
    description:
      'Green, cunning, and thriving on the edge of chaos, mounted on a giant rat. Haha, Missed Me!: whenever an attack misses it, deals 1 psychic damage in return. CHAAARGE!: if it moves at least 4 spaces in a straight line, attacks with advantage once. Bite & Stab (2x): deals 1d6+2 damage; on crit, target is knocked Prone.',
    stats: { HP: '30', Speed: '10' },
  }),
  // --- Bandits ---
  gmg({
    name: 'Bandit Minion',
    rating_label: 'Lvl 1/4',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Stab: deals 1d8 damage (follows minion rules).',
    stats: {},
  }),
  gmg({
    name: 'Bandit',
    rating_label: 'Lvl 1/3',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Stab: deals 1d8+1 damage (or Shoot, Range 8).',
    stats: { HP: '12' },
  }),
  gmg({
    name: 'Bandit Bruiser',
    rating_label: 'Lvl 2',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Bash: deals 2d8+4 damage.',
    stats: { HP: '24', Armor: 'Medium' },
  }),
  gmg({
    name: 'Bandit Hunter',
    rating_label: 'Lvl 1',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Battlebow: deals 2d8+2 damage (Range 12).',
    stats: { HP: '22' },
  }),
  gmg({
    name: 'Bandit Assassin',
    rating_label: 'Lvl 2',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Sneak: invisible until it attacks. Poison Blade (2x): deals 1d8+2 damage; on damage the target is Dazed.',
    stats: { HP: '24' },
  }),
  gmg({
    name: 'Bandit Mage',
    rating_label: 'Lvl 4',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Spark Step: when damaged, teleports up to 4 spaces. Arc Lightning: deals 3d8 damage (Range 12), also striking the next closest creature; on a miss, damages itself instead.',
    stats: { HP: '41' },
  }),
  gmg({
    name: 'Bandit Captain',
    rating_label: 'Lvl 4',
    tags: ['Bandits'],
    description:
      'You\'ve got money, they want money — a perfect match. Parry: treats attacks against it that roll a 2 as a miss. Slice (3x): deals 1d8+1 damage (or Shoot, Range 8).',
    stats: { HP: '36', Armor: 'Medium' },
  }),
  // --- Snakemen ---
  gmg({
    name: 'Snakeman Minion',
    rating_label: 'Lvl 1/4',
    tags: ['Snakemen'],
    description:
      'Aggressive hissing noises. Coiling Strike: on a melee crit, Grapples the target (escape DC 10). Strike: deals 1d6 melee or ranged damage (follows minion rules).',
    stats: {},
  }),
  gmg({
    name: 'Snakeman',
    rating_label: 'Lvl 1',
    tags: ['Snakemen'],
    description:
      'Aggressive hissing noises. Coiling Strike: on a melee crit, Grapples the target (escape DC 10). Slash: deals 1d6+6 damage (or Spit, Range 8).',
    stats: { HP: '26' },
  }),
  gmg({
    name: 'Cobra Captain',
    rating_label: 'Lvl 4',
    tags: ['Snakemen'],
    description:
      'Aggressive hissing noises. Coiling Strike: on a melee crit, Grapples the target (escape DC 10). Slash (2x): deals 1d6+6 damage (or Spit, Range 8).',
    stats: { HP: '36', Armor: 'Medium' },
  }),
  gmg({
    name: 'Giant Cobra',
    rating_label: 'Lvl 8',
    tags: ['Snakemen'],
    description:
      'Aggressive hissing noises. Coiling Strike: on a melee crit, Grapples the target (escape DC 10). Crush: deals 2d6+20 damage, with advantage against smaller creatures.',
    stats: { Size: 'Large', HP: '80', Armor: 'Medium' },
  }),
  // --- Dungeon Denizens ---
  gmg({
    name: 'Stirge',
    rating_label: 'Lvl 1/2',
    tags: ['Dungeon Denizens'],
    description:
      'For some creatures, you are the loot at the end of the dungeon. Evasive Flier: attacks against stirges are made with disadvantage. Latch On: deals 1d4+2 damage; on hit, the target becomes Latched On — the stirge moves where its target moves until either dies, its attacks can\'t miss or be Defended/Interposed against, and attacks that miss the stirge damage the target instead.',
    stats: { Size: 'Tiny', HP: '10' },
  }),
  gmg({
    name: 'Greater Stirge',
    rating_label: 'Lvl 6',
    tags: ['Dungeon Denizens'],
    description:
      'For some creatures, you are the loot at the end of the dungeon. Evasive Flier: attacks against stirges are made with disadvantage. Latch On: deals 1d12+10 damage; on hit, the target becomes Latched On (see Stirge).',
    stats: { Size: 'Small', HP: '60' },
  }),
  gmg({
    name: 'Tiny Mimic',
    rating_label: 'Lvl 1',
    tags: ['Dungeon Denizens'],
    description:
      'Disguises itself as a small item — a cup, shoe, apple, candlestick, potion, or pebble. Ambusher: mimics always start first, and heroes roll Initiative with disadvantage. Sticky: mimic hits also Grapple, and it can grapple any number of creatures; when crit, it releases 1 creature of the attacker\'s choice. Pseudopod: deals 1d4 damage (escape DC 9). Bite (on a Grappled creature): deals 1d12 damage.',
    stats: { HP: '28' },
  }),
  gmg({
    name: 'Small Mimic',
    rating_label: 'Lvl 2',
    tags: ['Dungeon Denizens'],
    description:
      'Disguises itself as a mid-size item — a backpack, shield/weapon, chair, crate, or tree stump. Ambusher: mimics always start first, and heroes roll Initiative with disadvantage. Sticky: mimic hits also Grapple any number of creatures; when crit, releases 1 creature of the attacker\'s choice. Pseudopod: deals 1d6 damage (escape DC 11). Bite (on a Grappled creature): deals 1d20 damage.',
    stats: { HP: '41' },
  }),
  gmg({
    name: 'Medium Mimic',
    rating_label: 'Lvl 6',
    tags: ['Dungeon Denizens'],
    description:
      'Disguises itself as a large piece of furniture — a table, treasure chest, barrel, bookshelf, door, or bed. Ambusher: mimics always start first, and heroes roll Initiative with disadvantage. Sticky: mimic hits also Grapple any number of creatures; when crit, releases 1 creature of the attacker\'s choice. Pseudopod: deals 1d8 damage (escape DC 13). Bite (on a Grappled creature): deals 2d20 damage.',
    stats: { HP: '79' },
  }),
  gmg({
    name: 'Gray Ooze',
    rating_label: 'Lvl 1',
    tags: ['Dungeon Denizens'],
    description:
      'Digestive Touch: contact with an ooze inflicts the Digested condition, dealing extra damage for each time the target has been Digested this encounter. Goopy: when crit or dealt slashing damage, summons X ooze minions (size d6) whose attacks inflict Digested. Acidic Touch (2x): deals 1d6+2 damage.',
    stats: { HP: '28' },
  }),
  gmg({
    name: 'Ochre Jelly',
    rating_label: 'Lvl 4',
    tags: ['Dungeon Denizens'],
    description:
      'Digestive Touch: contact inflicts the Digested condition, dealing extra damage for each time Digested this encounter. Goopy: when crit or dealt slashing damage, summons X ooze minions (size d6) whose attacks inflict Digested. Acidic Touch (2x): deals 1d6+3 damage.',
    stats: { Size: 'Large', HP: '52' },
  }),
  gmg({
    name: 'Black Pudding',
    rating_label: 'Lvl 8',
    tags: ['Dungeon Denizens'],
    description:
      'Digestive Touch: contact inflicts the Digested condition, dealing extra damage for each time Digested this encounter. Goopy: when crit or dealt slashing damage, summons X ooze minions (size d6) whose attacks inflict Digested. Acidic Touch (2x, Reach 2): deals 1d6+5 damage.',
    stats: { Size: 'Large', HP: '90' },
  }),
  gmg({
    name: 'Elder Ooze',
    rating_label: 'Lvl 12',
    tags: ['Dungeon Denizens'],
    description:
      'Digestive Touch: contact inflicts the Digested condition, dealing extra damage for each time Digested this encounter. Goopy: when crit or dealt slashing damage, summons X ooze minions (size d6) whose attacks inflict Digested. Acidic Touch (3x, Reach 3): deals 1d6+6 damage.',
    stats: { Size: 'Huge', HP: '150' },
  }),
  // --- Hill & Field ---
  gmg({
    name: 'Gnoll',
    rating_label: 'Lvl 1',
    tags: ['Hill & Field'],
    description:
      'Mighty brutes and cunning beasts, always on the lookout for easy prey. Frenzy: advantage against Bloodied creatures. Ravage (2x): deals 1d10 damage. Shoot (Range 12): deals 1d10 damage.',
    stats: { HP: '28' },
  }),
  gmg({
    name: 'Gnoll Packleader',
    rating_label: 'Lvl 4',
    tags: ['Hill & Field'],
    description:
      'Mighty brutes and cunning beasts, always on the lookout for easy prey. Frenzy: advantage against Bloodied creatures. Bark Orders: 2 allies can move, then Ravage (3x): deals 1d10 damage.',
    stats: { HP: '39', Armor: 'Medium' },
  }),
  gmg({
    name: 'Worg',
    rating_label: 'Lvl 1',
    tags: ['Hill & Field'],
    description:
      'Mighty brutes and cunning beasts, always on the lookout for easy prey. Savage: always crits when attacking a Grappled creature. Rip Apart (2x): deals 1d6+2 damage; on hit the target is Grappled (escape DC 10).',
    stats: { Size: 'Large', HP: '28', Speed: '10' },
  }),
  gmg({
    name: 'Hill Giant',
    rating_label: 'Lvl 12',
    tags: ['Hill & Field'],
    description:
      'Mighty brutes and cunning beasts, always on the lookout for easy prey. Brute: on hit, knocks the target back its Primary Die in spaces. Smash (2x, Reach 2): deals 1d6+15 damage. Boulder! (Range 12): deals 1d6+20 damage.',
    stats: { Size: 'Huge', HP: '140', Speed: '8' },
  }),
  gmg({
    name: 'Bulette',
    rating_label: 'Lvl 10',
    tags: ['Hill & Field'],
    description:
      'A burrowing predator. Burst Forth!: combat starts with the heaviest character making a DC 14 DEX save or being Grappled (escape DC 14) and taking 1d12+20 damage (half on save). Drag Below (on a Grappled creature): deals 2d12 damage then drags them below and burrows away. Leap & Bite (if not grappling): leaps 6 and attacks for 1d12+20 damage; on hit the target is Grappled.',
    stats: { Size: 'Large', HP: '74', Armor: 'Heavy', Speed: 'Burrow' },
  }),
  gmg({
    name: 'Troll',
    rating_label: 'Lvl 10',
    tags: ['Hill & Field'],
    description:
      'Mighty brutes and cunning beasts. Regenerate: does not die at 0 HP — only fire, radiant damage, or a crit while at 0 HP can kill it. Choose twice: Claws (Reach 2) deal 1d4+10 damage, on crit knocking the target Prone; Bite (on a Prone creature) deals 1d4+20 damage.',
    stats: { Size: 'Large', HP: '100', Armor: 'Medium', Speed: '8' },
  }),
  gmg({
    name: 'Blue Drake',
    rating_label: 'Lvl 2',
    tags: ['Hill & Field', 'Dragon'],
    description:
      'A small drake with a shocking bite. Shocking Bite: deals 1d12+5 damage (ignores metal armor). On Death: deals 1d12 damage back (ignores metal armor).',
    stats: { HP: '34', Speed: 'Fly 12' },
  }),
  gmg({
    name: 'Griffon',
    rating_label: 'Lvl 4',
    tags: ['Hill & Field'],
    description:
      'A winged predator that hunts from above. Talons: deals 2d6+10 damage; on hit the target is Grappled (escape DC 14). Fly & Drop (if grappling): flies upward 12 spaces and releases the target for 6d6 fall damage.',
    stats: { Size: 'Large', HP: '50', Speed: 'Fly 12' },
  }),
  gmg({
    name: 'Roc',
    rating_label: 'Lvl 17',
    tags: ['Hill & Field'],
    description:
      'A colossal bird of prey capable of snatching multiple targets at once. Pluck Up (Reach 4, up to 2 creatures): deals 3d12+20 damage; on hit the targets are Grappled (escape DC 18). Crush & Drop: flies upward 20 spaces, deals 20 damage to Grappled creatures, then releases them for 10d6 fall damage.',
    stats: { Size: 'Gargantuan', HP: '195', Armor: 'Medium', Speed: 'Fly 20' },
  }),
  // --- Undead ---
  gmg({
    name: 'Skeleton',
    rating_label: 'Lvl 1/3',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Grave Arrow (Range 8): deals 1d4+3 damage.',
    stats: { HP: '10' },
  }),
  gmg({
    name: 'Zombie',
    rating_label: 'Lvl 1/2',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Crunch: deals 1d4+4 damage; on damage the target is Grappled.',
    stats: { HP: '15' },
  }),
  gmg({
    name: 'Ghoul',
    rating_label: 'Lvl 1',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Sickening Claw: deals 1d4+8 damage; on damage the target is Dazed.',
    stats: { HP: '20' },
  }),
  gmg({
    name: 'Specter',
    rating_label: 'Lvl 3',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Deathly Touch: deals 1d4 damage; on damage the target\'s HP is set to 0.',
    stats: { HP: '30', Speed: 'Fly' },
  }),
  gmg({
    name: 'Ogre Zombie',
    rating_label: 'Lvl 5',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Greatclub (2x): deals 1d4+8 damage; on crit the target is knocked Prone.',
    stats: { Size: 'Large', HP: '46' },
  }),
  gmg({
    name: 'Mummy',
    rating_label: 'Lvl 6',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Slam (2x): deals 1d4+8 damage; on damage the target is Dazed.',
    stats: { HP: '54' },
  }),
  gmg({
    name: 'Giant Zombie',
    rating_label: 'Lvl 8',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Decaying Swipe (2x): deals 1d4+10 damage; on damage knocks the target back its Primary Die in spaces.',
    stats: { Size: 'Huge', HP: '73' },
  }),
  gmg({
    name: 'Wraith',
    rating_label: 'Lvl 10',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Soul Rend (2x, Range 8): deals 1d4+10 damage; on damage deals 1 Wound.',
    stats: { HP: '94', Speed: 'Fly' },
  }),
  gmg({
    name: 'Mummy Lord',
    rating_label: 'Lvl 21',
    tags: ['Undead'],
    description:
      'Hate the living for not being dead, hate themselves for not being living. Unliving, Undying: the first time it dies, resets to 1 HP instead. Cursed Gaze: when crit, the attacker makes a DC 20 INT save or suffers 1 Wound. ACTIONS: Scarab Swarm summons 10 scarab minions (d6) within 6 spaces, then Slam (2x) deals 1d4+20 damage, and on damage the target is Dazed.',
    stats: { HP: '280' },
  }),
  // --- Forest Denizens ---
  gmg({
    name: 'Duskprowler',
    rating_label: 'Lvl 6',
    tags: ['Forest Denizens'],
    description:
      'Every shadow hides a predator in the forest. Illusory Aura: attacks against it have disadvantage 2; taking damage suppresses this effect until the end of the next hero\'s turn. Ravage (2x): deals 2d8+2 damage.',
    stats: { Size: 'Large', HP: '70' },
  }),
  gmg({
    name: 'Basilisk',
    rating_label: 'Lvl 7',
    tags: ['Forest Denizens'],
    description:
      'Its petrifying gaze turns the unwary to stone. Stone Gaze: Dazes 1 creature within sight, then uses Envenom, dealing 1d8+10 damage with advantage against Dazed targets. Flesh to Stone: creatures Dazed by the Basilisk remain so for 10 minutes; being Dazed 3 times results in Petrification.',
    stats: { HP: '48', Armor: 'Heavy' },
  }),
  gmg({
    name: 'Druid',
    rating_label: 'Lvl 8',
    tags: ['Forest Denizens'],
    description:
      'A forest guardian who channels the fury of nature. Beastshift: gains +4 speed and Medium armor for the round, dealing 4d4+10 damage. Hurricane (Reach 3): deals 4d4+10 damage to all enemies within reach; on damage, moves targets anywhere else within Reach.',
    stats: { HP: '90' },
  }),
  gmg({
    name: 'Seedling',
    rating_label: 'Lvl 1/2',
    tags: ['Forest Denizens'],
    description:
      'A Briarbane — soulless, thorny plant beings fertilized by blood. Peeling Bark: damage degrades its Armor by one step (Heavy to Medium to none). Thorn Seed (Range 6): deals 2d6+2 damage.',
    stats: { Size: 'Small', HP: '8', Armor: 'Heavy (degrades)' },
  }),
  gmg({
    name: 'Acidpod',
    rating_label: 'Lvl 1',
    tags: ['Forest Denizens'],
    description:
      'A Briarbane — soulless, thorny plant beings fertilized by blood. Peeling Bark: damage degrades its Armor by one step (Heavy to Medium to none). Grab: DC 12 DEX save or the target is Grappled. Caustic Eruption (on death): deals 4d6 acid damage to all adjacent creatures.',
    stats: { Size: 'Small', HP: '8', Armor: 'Heavy (degrades)' },
  }),
  gmg({
    name: 'Tangler',
    rating_label: 'Lvl 2',
    tags: ['Forest Denizens'],
    description:
      'A Briarbane — soulless, thorny plant beings fertilized by blood. Peeling Bark: damage degrades its Armor by one step (Heavy to Medium to none). Tangle (2x, Reach 6): deals 1d6+2 damage; on hit the target is Grappled (escape DC 12, or any fire or slashing damage).',
    stats: { HP: '20', Armor: 'Heavy (degrades)' },
  }),
  gmg({
    name: 'Rootbreaker',
    rating_label: 'Lvl 5',
    tags: ['Forest Denizens'],
    description:
      'A Briarbane — soulless, thorny plant beings fertilized by blood. Peeling Bark: damage degrades its Armor by one step (Heavy to Medium to none). Slam: deals 3d6+6 damage; on crit knocks back 2 spaces.',
    stats: { Size: 'Large', HP: '50', Armor: 'Heavy (degrades)' },
  }),
  gmg({
    name: 'Treant',
    rating_label: 'Lvl 14',
    tags: ['Forest Denizens'],
    description:
      'A Briarbane — soulless, thorny plant beings fertilized by blood. Peeling Bark: damage degrades its Armor by one step (Heavy to Medium to none). Enrage: attacks with advantage when unarmored. Choose twice: Slam (Reach 3) deals 2d6+10 damage, on damage knocking Prone; Stomp (against a Hampered target) deals 2d6+20 damage.',
    stats: { Size: 'Huge', HP: '170', Armor: 'Heavy (degrades)' },
  }),
  // --- Cultists/Horrors ---
  gmg({
    name: 'Cultist',
    rating_label: 'Lvl 1',
    tags: ['Cultists/Horrors'],
    description:
      'Driven by twisted beliefs, fanatical cultists perform dark rituals to awaken ancient evils. Fanatical Zeal: while not at max HP, makes all rolls with advantage, and its crits also inflict Despair (disadvantage on the target\'s next attack this encounter). Oblation of Blood!: if undamaged, attacks itself for 2 damage and inflicts Despair on adjacent enemies. Dreadful Blade: deals 1d6+6 damage. Blood Boil (Range 12, against a Bloodied creature): deals 3d6+6 damage.',
    stats: { HP: '28' },
  }),
  gmg({
    name: 'Fanatic',
    rating_label: 'Lvl 3',
    tags: ['Cultists/Horrors'],
    description:
      'Driven by twisted beliefs, fanatical cultists perform dark rituals to awaken ancient evils. Fanatical Zeal: while not at max HP, makes all rolls with advantage, and its crits also inflict Despair. Oblation of Blood!: if undamaged, attacks itself for 2 damage and inflicts Despair on adjacent enemies. Whispers of Madness: a contested STR check Grapples the target (reroll to escape, or any radiant damage); on success deals 3d6+6 psychic damage that cannot be Defended or Interposed against.',
    stats: { HP: '41' },
  }),
  gmg({
    name: 'Doomsayer',
    rating_label: 'Lvl 5',
    tags: ['Cultists/Horrors'],
    description:
      'Driven by twisted beliefs, fanatical cultists perform dark rituals to awaken ancient evils. Feverish Chant (Concentration): reduces all damage done to allies who can hear it to 1. Ecstatic Ravings: deals 2d6 psychic damage to all enemies who can hear it.',
    stats: { HP: '58' },
  }),
  // --- Underground ---
  gmg({
    name: 'Giant Spider',
    rating_label: 'Lvl 2',
    tags: ['Underground'],
    description:
      'Nightmarish denizens of the deep that lurk in dark tunnels and cavernous depths. Shoot Web (Range 6): deals 1d8+2 damage; on hit the target is Restrained (escape DC 12, or any slashing/fire damage). Bite (against a Hampered target): deals 2d8+4 damage and Poisons (magical healing ends it).',
    stats: { HP: '27', Armor: 'Medium' },
  }),
  gmg({
    name: 'Ettercap',
    rating_label: 'Lvl 4',
    tags: ['Underground'],
    description:
      'Nightmarish denizens of the deep that lurk in dark tunnels and cavernous depths. Web Garrote: deals 1d8+2 damage; on hit the target is Grappled (escape DC 13) and Silenced until it escapes (cannot cast spells or use abilities requiring speech).',
    stats: { HP: '49' },
  }),
  gmg({
    name: 'Nestweaver',
    rating_label: 'Lvl 6',
    tags: ['Underground'],
    description:
      'Nightmarish denizens of the deep that lurk in dark tunnels and cavernous depths. Summons 2 spider minions (d8), then chooses one: Shoot Web (Range 6) deals 1d8+2 damage, on hit Restrained (escape DC 12, or slashing/fire damage); Bite (against a Hampered target) deals 3d8+6 damage and Poisons.',
    stats: { Size: 'Large', HP: '54', Armor: 'Medium' },
  }),
  gmg({
    name: 'Cloaker',
    rating_label: 'Lvl 13',
    tags: ['Underground'],
    description:
      'Nightmarish denizens of the deep that lurk in dark tunnels and cavernous depths. Ambusher: always starts first, heroes roll Initiative with disadvantage. Mutual Harm: takes half damage from attacks while grappling a creature (they take the other half). Wrap: deals 2d10+20 damage; on hit the target is Grappled (escape DC 16). Horrifying Wail: DC 16 WIL save or creatures within 6 spaces are Frightened and must spend 1 action moving as far away as possible.',
    stats: { Size: 'Large', HP: '110', Speed: 'Fly 10' },
  }),
  gmg({
    name: 'Umber Hulk',
    rating_label: 'Lvl 10',
    tags: ['Underground'],
    description:
      'Nightmarish denizens of the deep that lurk in dark tunnels and cavernous depths. Confounding Pheromones: enemies make a DC 15 WIL save at the start of their turn or are Confused that turn (the GM spends their next action); gains advantage 1 on the save for each failure this encounter. Mandible & Claws (2x): deals 1d10+10 damage.',
    stats: { Size: 'Large', HP: '70', Armor: 'Heavy' },
  }),
  gmg({
    name: 'Great Worm',
    rating_label: 'Lvl 16',
    tags: ['Underground'],
    description:
      'A colossal burrowing worm. Tremor Sight: gains advantage against creatures that moved since its last turn. Crush: creatures in a 2x6 area take 50 damage on a failed DC 18 DEX save (those who fail may spend 1 action to dive out of the way instead, moving half speed and landing Prone). Bite/Swallow: deals 1d4+40 damage; on crit the target is Swallowed, taking 20 damage at the start of each turn while its attacks can\'t miss and ignore armor.',
    stats: { Size: 'Huge', HP: '140', Armor: 'Heavy', Speed: 'Burrow 8' },
  }),
  // --- Legendary Monsters ---
  gmg({
    name: 'Pudge the Blunderer',
    rating_label: 'Level 2 Solo Dumb Ogre',
    tags: ['Legendary'],
    description:
      'A dim-witted ogre boss. ACTIONS: after each hero\'s turn, choose one: Move & Smack moves 8 and attacks for 1d8+2 (on damage, target knocked Prone); Grab & Throw deals 1d8+2 damage and, on damage, throws the target at another hero within 6 spaces — both make a DC 12 DEX save or take 1d8+2 damage and are knocked Prone (half damage on save). BLOODIED: at 37 HP, Pudge\'s damage increases to 1d12+2. LAST STAND: 20 more damage and he dies; until then Pudge can move 6 spaces and use Grab & Throw each turn.',
    stats: { HP: '75', Armor: 'Medium', Saves: 'STR+, INT-' },
  }),
  gmg({
    name: 'Kelebek & Poppy',
    rating_label: 'Level 3 Solo Bug Druid & His Stinky Pet',
    tags: ['Legendary'],
    description:
      'A pair boss encounter: Kelebek, an Entomancer (HP 60, Medium armor, INT+ WIL+), and Poppy, his Giant Stinkbug companion (HP 60, Heavy armor, STR+). Kelebek\'s Vinelash moves 6 then deals 2d6 damage, on damage moving the target to an unoccupied space within 10 spaces. Poppy\'s Stink Cloud triggers when Poppy is damaged: enemies within 2 spaces make a STR save (DC equal to the higher of 10 or the damage done), and on a failure must spend their next action vomiting and cannot take reactions that round. Poppy\'s Crushing Mandibles moves 6 and deals 4d6 damage to up to 2 adjacent creatures. ACTIONS: after each hero\'s turn, choose Kelebek OR Poppy to act. BLOODIED: when Kelebek is reduced to 30 HP, Poppy always Interposes for him. LAST STAND: when Poppy dies, the room fills with noxious gas — all heroes have a maximum of 2 actions each turn.',
    stats: { 'Kelebek HP': '60', 'Poppy HP': '60', Armor: 'Kelebek: Medium, Poppy: Heavy' },
  }),
  gmg({
    name: 'Grimbeak, the Unyielding',
    rating_label: 'Level 3 Solo Large Owlbear',
    tags: ['Legendary'],
    description:
      'A relentless owlbear boss. Brutal: treats the highest die rolled as the Primary Die, and knocks the target Prone on a crit. ACTIONS: after each hero\'s turn, choose one: Savage Screech (1 use) deals 2d6 damage (ignoring armor) to all enemies within Reach 12, DC 11 WIL save or Frightened for 1 round; Rend & Tear deals 2d6+10 damage; Beak moves 8 and deals 2d6 damage. BLOODIED: at 50 HP, Savage Screech recharges. LAST STAND: 30 more damage and she dies; until then her attacks use d10s instead of d6s.',
    stats: { Size: 'Large', HP: '100', Armor: 'Medium', Saves: 'STR+' },
  }),
  gmg({
    name: 'Thorn Quickblade',
    rating_label: 'Level 4 Solo Human Criminal',
    tags: ['Legendary'],
    description:
      'A cunning human duelist and criminal. Strike Back: when crit, makes a Heart Piercer or Stormquill attack in return. ACTIONS: after each hero\'s turn, choose one: Stormquill (crossbow) moves 4 and deals 4d4+10 damage (Range 8); Heart Piercer (rapier) moves 8 and deals 2d4+3 damage (on crit Dazed). BLOODIED: Smoke Bomb — at 62 HP he becomes invisible until the end of his next turn, then moves 8 ignoring opportunity attacks. LAST STAND: Mortal Panic! 30 more damage and he\'s dead; until then he Strikes Back every time he\'s hit (1/turn).',
    stats: { HP: '125', Armor: 'Medium', Saves: 'DEX+' },
  }),
  gmg({
    name: 'Ravager of the Lowlands',
    rating_label: 'Level 5 Solo Large Manticore',
    tags: ['Legendary'],
    description:
      'A savage manticore terrorizing the lowlands. Feral Instinct: whenever crit, can fly 10 spaces. ACTIONS: after each hero\'s turn, choose one: Venomous Stinger (1 use, Reach 3) deals 5d12 damage; Ravage deals 1d12+20 damage; Claw flies 10 and deals 1d12+6 damage. BLOODIED: at 65 HP, his Venomous Stinger recharges. LAST STAND: 40 more damage and he dies; until then, the first time each turn he takes damage he uses Move & Claw.',
    stats: { Size: 'Large', HP: '130', Armor: 'Medium', Saves: 'STR+, DEX+' },
  }),
  gmg({
    name: 'Nalzar, Apex Predator',
    rating_label: 'Level 6 Solo Large Grey Drake',
    tags: ['Legendary', 'Dragon'],
    description:
      'An apex predator drake. Tail Swipe: when dealt slashing or lightning damage, knocks a hero within 3 spaces Prone. Torn Wings: each slashing crit reduces her Wing Buffet DC by 1. ACTIONS: after each hero\'s turn, choose one: Devour (against Prone creatures only, Reach 2) deals 4d12+6 damage; Wing Buffet flies 8, lands, and hits a Cone 8 for 1d12 damage, then DC 14 STR save or knocked Prone (advantage if behind cover or another hero). BLOODIED: at 90 HP, her Wing Buffet range and DC increase by 2. LAST STAND: 60 more damage and she dies; until then, each turn she moves 6 and uses Devour (ignoring the Prone requirement).',
    stats: { Size: 'Large', HP: '180', Armor: 'Medium', Saves: 'STR+, DEX+' },
  }),
  gmg({
    name: 'Queen Aranya, Broodmother',
    rating_label: 'Level 6 Solo Large Matriarch of Spiders',
    tags: ['Legendary'],
    description:
      'The matriarch ruler of a spider brood. Weave Web: creatures she hits are entangled in a sticky web (Dazed). Flammable Webs: fire critical hits suppress her Weave Web for 1 turn. ACTIONS: after each hero\'s turn, choose one: Impale (Reach 2) deals 2d8+8 damage then skitters away up to 8 spaces; Hatch Brood summons spiderling minions (1/hero, size d8) that act only when commanded; Dinner Time! commands all spiderling minions to move up to 6 spaces and attack once each. BLOODIED: "Avenge Your Queen, My Brood!" — at 80 HP, summons 3 spiderling minions per hero within Reach 8. LAST STAND: 40 more damage and she dies; until then, Hatch Brood after each of her turns.',
    stats: { Size: 'Large', HP: '160', Armor: 'Medium', Saves: 'ALL+' },
  }),
  gmg({
    name: 'Florindris, Bane of the Forest',
    rating_label: 'Level 7 Solo Large Floral Dragon',
    tags: ['Legendary', 'Dragon'],
    description:
      'A corrupted floral dragon that dominates the forest. Aura of Wind: ranged attacks against her have disadvantage, and at the end of her turn she pushes adjacent creatures 2 spaces away. Wither: resistant to necrotic damage, but it suppresses Aura of Wind for 1 turn. ACTIONS: after each hero\'s turn, choose one: Petal Storm (1 use) deals 3d10+10 damage to all enemies within Reach 8 (half on DC 13 DEX save); Rend flies 10 before or after attacking (Reach 2) and deals 1d10+10 damage to up to 2 targets, on hit inflicting Thornblight (5 damage per space forcibly moved, magical healing ends it); Gust (Reach 8) moves a target 1d10 spaces. BLOODIED: at 100 HP, enemies within Reach 12 gain Thornblight and Petal Storm recharges. LAST STAND: 70 more damage and she dies; until then Aura of Wind and Gust move creatures twice as far.',
    stats: { Size: 'Large', HP: '200', Armor: 'Medium', Saves: 'ALL+' },
  }),
  gmg({
    name: 'General Flameheart',
    rating_label: 'Level 8 Solo Huge Flame Titan',
    tags: ['Legendary'],
    description:
      'A towering titan wreathed in flame. Cinder Armor: immune to fire; when damaged, deals 5 fire damage to all adjacent creatures. Extinguish Flame: cold or radiant crits extinguish areas ignited by Molten Fury and suppress Cinder Armor for 1 turn. ACTIONS: after each hero\'s turn, choose one: Inferno Cleave moves 8 then strikes a 2x2 area for 2d10+10 fire damage; Molten Fury lobs a fireball at the furthest hero not already burning, igniting a 2x2 area for 2d10+10 damage plus 10 more at the end of each turn if they remain. BLOODIED: at 87 HP, on his next turn he uses Molten Fury a number of times equal to half the heroes (rounded up). LAST STAND: 80 more damage and he dies; until then the area of his attacks increases to 3x3.',
    stats: { Size: 'Huge', HP: '175', Armor: 'Heavy', Saves: 'STR+, WIL+' },
  }),
  gmg({
    name: 'Vael, Undying Necromancer',
    rating_label: 'Level 9 Solo Luminary of Malice',
    tags: ['Legendary', 'Undead'],
    description:
      'An undying necromancer bound to a lifebinding spirit named Bane. Protect Master!: whenever Vael would fail a save or take 20 or more damage, he may sacrifice Bane instead, spending his next turn moving up to 6 spaces and re-summoning it. ACTIONS: after each hero\'s turn, Bane attacks for 1d12+6, then Vael chooses one: DOOM (Range 12, against an undamaged target) — DC 14 WIL save or 5d12 damage (half on save); Veilwalker\'s Rebuke (Range 8) deals 2d12+6 damage, doubled against those behind cover, and 1/round he may swap places with them; Cruelty\'s Edge deals 1d4+2 damage, on hit DC 14 WIL save or Dazed and Frightened, then moves 6. BLOODIED: at 125 HP, Vael gains the reaction Shield of Cruelty (1 time use) — if damaged, he may reflect that much radiant damage back at the attacker. LAST STAND: "DEATH, AN OLD FRIEND" — 90 more damage and he dies; until then he gains Heavy Armor, the hero who most recently damaged him is reduced to 0 HP, and Bane is sacrificed into a Vengeful Spirit dealing 1d12+6 necrotic damage to creatures within Reach 3 at the end of each of his turns.',
    stats: { HP: '250', Saves: 'INT++, WIL++' },
  }),
  gmg({
    name: 'Titan of the Deep Woods',
    rating_label: 'Level 10 Solo Gargantuan Skeleton',
    tags: ['Legendary', 'Undead'],
    description:
      'A colossal animated skeleton haunting the deep woods. Splintering Legions: bludgeoning damage or any crit causes bones to splinter off and animate, forming a d10 minion. Brittle Bones: resistant to piercing, vulnerable to bludgeoning. ACTIONS: after each hero\'s turn, choose one: Devastating Strike (Reach 4) deals 1d4+30 damage, on hit knocking back 6 spaces; Crushing Stomp moves up to 10 spaces and deals 1d4+20 damage to up to 2 targets along the path, on hit knocking them Prone; Beckoning Doom forces the 2 furthest heroes to make a DC 16 STR save or be moved adjacent to it. LAST STAND: "Shattered Legion" — at 0 HP, the Titan collapses into 4 skeleton minions per hero (d10 sized); if any remain, they reassemble into the Titan the next evening.',
    stats: { Size: 'Gargantuan', HP: '240', Armor: 'Heavy', Saves: 'STR+++' },
  }),
  gmg({
    name: "Ul'vek, Psionic Despot",
    rating_label: 'Level 11 Solo Medium Brain-Eating Aberration',
    tags: ['Legendary'],
    description:
      'A psionic aberration that dominates minds. Mind Shield: whenever it would fail a save or take 30 or more damage while it has a creature Dominated, it may avoid the attack instead, but all Dominated creatures come to their senses. ACTIONS: after each hero\'s turn, choose one: Dominate (if no creature is Dominated) makes half of the heroes suffer 2d12 psychic damage (ignoring armor), DC 15 WIL save or also Dominated (rolls made with disadvantage; spends first action each turn moving, attacking, or casting a cantrip; damage ends it); Consume (against a Dominated creature) is a contested DEX or STR check — on success, Grapples and deals 6d12 damage that cannot be Defended or Interposed against; Control teleports 8 (Reach 8), DC 15 WIL save or forces an enemy to spend an action attacking or casting a cantrip (attacks with disadvantage on save). BLOODIED: at 150 HP, gains Illusory Shift — a reaction (1 use) to swap places with a Dominated creature, making them the new target of an attack. LAST STAND: 110 more damage and he dies; until then Dominated no longer ends on taking damage, and every hero makes a WIL save or becomes Dominated.',
    stats: { HP: '300', Saves: 'INT++, WIL++, DEX+' },
  }),
  gmg({
    name: 'Dravok, All-Seeing Tyrant',
    rating_label: 'Level 12 Solo Large Aberration',
    tags: ['Legendary'],
    description:
      'An aberration covered in teeth and eyes. "My plans, flawless!": makes all saves with +1 Advantage, while attacks against it have Disadvantage. Weakness: taking more than 12 piercing or slashing damage makes its "plans FLAWED" until the end of the next hero\'s turn. ACTIONS: after each hero\'s turn, moves 6 then uses Eye Ray (Range 10, randomly chosen) or Terrible Maw (melee, 4d4, every die can crit and is Vicious). Eye Rays: Warping Ray deals 3d6 damage, on hit Dazed and exchanges places with the target; Petrification Ray permanently Dazes (healing ends it; 3 stacks = Petrified); Terror Ray deals 5d10 psychic damage and inflicts Terrified (Frightened, screaming allies within 6 spaces suffer disadvantage, ends when its plans are FLAWED); Gravitation Ray deals 2d6 damage and pushes that many spaces (Prone on a 7+); Charm Ray forces a DC 16 WIL save or the target spends 3 actions attacking/moving as directed (2 actions on save); Death Ray forces a DC 16 STR save or the target drops to 0 HP (gains 1 Wound on save; a Dying creature that fails dies). BLOODIED: "To Dust!" — at 110 HP, uses Petrification Ray against every enemy, and its save DC increases to 18. LAST STAND: 70 more damage and it dies; until then each turn it moves or uses Warping Ray, then Devastation Beam (2d12+20 damage in a 10-space long, 2-space wide line).',
    stats: { Size: 'Large', HP: '325', Saves: 'INT++, WIL++' },
  }),
  gmg({
    name: 'Azriel, Lord of Pain & Flame',
    rating_label: 'Level 14 Solo Huge Balor',
    tags: ['Legendary', 'Fiend'],
    description:
      'A towering balor lord who revels in pain. PAIN!: crits against Azriel are Vicious, and he deals damage equal to the crit dice back to the attacker. ACTIONS: after each hero\'s turn, choose one: Crackling Whip moves 6 (Reach 6) and deals 3d12 damage, on hit Grappling and pulling the target adjacent (escape DC 17 STR or DEX, or until he uses the whip again); Doom Sword deals 3d12+10 fire damage to all creatures within Reach 2. BLOODIED: at 160 HP, he can use Crackling Whip twice each turn. LAST STAND: "YES, MORE PAIN!" — 180 more damage and he dies; until then every hit against him is a crit.',
    stats: { Size: 'Huge', HP: '320', Armor: 'Heavy', Saves: 'ALL+' },
  }),
  gmg({
    name: 'Gloomwing the Cruel',
    rating_label: 'Level 15 Solo Huge Rot Dragon',
    tags: ['Legendary', 'Dragon', 'Undead'],
    description:
      'A rotting, cruel dragon shrouded in decay. Aura of Rot: creatures within 6 spaces take 5 necrotic damage at the end of their turns. Light Sensitivity: radiant damage suppresses Aura of Rot until the end of the next hero\'s turn. ACTIONS: after each hero\'s turn, choose one: Rot Breath (1 use) flies 10 then hits a Cone 8 for DC 17 DEX save or 8d10 necrotic damage (half on save); Bite (Reach 2) moves 6 then deals 3d10 damage, on damage inflicting Cruelty\'s Gift (healing halved and vulnerable to necrotic damage until healed); Claws (Reach 2) deal 3d10 slashing plus 10 necrotic damage; Tail (Reach 4) deals 1d10 damage and knocks back that many spaces. BLOODIED: at 160 HP, Rot Breath recharges. LAST STAND: 150 more damage and he dies; until then the damage and range of his Aura of Rot doubles.',
    stats: { Size: 'Huge', HP: '320', Armor: 'Heavy', Saves: 'ALL++' },
  }),
  gmg({
    name: 'Alaric Draegoth, the Crimson Count',
    rating_label: 'Level 16 Solo Vampire Lord',
    tags: ['Legendary', 'Undead'],
    description:
      'A vampire lord who commands a swarm of blood bats. Sanguine Cloak (1/turn): deals 1d10 necrotic damage whenever hit, reducing the attack by that amount. Sunscorn: vulnerable to radiant damage; after taking it, uses Beguile as a reaction (rolling with disadvantage). ACTIONS: after each hero\'s turn, summons 1 blood bat minion (d10) within 8 spaces, then chooses one: Ebonfang deals 1d10+15 damage, considering the target Bloodied for 1 round, and flies 8 before or after attacking; Beguile (if no creature is Beguiled) Beguiles a target on a failed DC 18 WIL save (disadvantage if Bloodied) — Beguiled creatures are Dazed and cannot Defend or allow anyone to Interpose for them until damaged; Beckon & Bite moves a Beguiled creature adjacent and bites for 2d10+30 damage and 1 Wound. BLOODIED: at 160 HP, gains Mistform (no longer vulnerable to radiant) and Bat Decoy (whenever he would take damage, first swaps places with a bat minion, 1/round). LAST STAND: 160 more damage and he dies; until then his Sanguine Cloak, attacks, and bats roll d20s instead of d10s.',
    stats: { HP: '320', Saves: 'ALL++' },
  }),
  gmg({
    name: 'Caerys, the Hollow Star',
    rating_label: 'Level 20 Solo World-Ending Cataclysm',
    tags: ['Legendary'],
    description:
      '"She Who Is Our Desire & End" — a cosmic, world-ending entity. Ravages of Time: at the beginning of each round, all heroes suffer 1 Wound. Slipstream: 3/encounter, when she would suffer a negative effect, she may swap places with a creature of her choice, making them the target instead; all heroes recover 1 Wound. ACTIONS: after each hero\'s turn, choose 1 option not yet chosen this cycle (reset once all have been chosen): Wormhole teleports 12 and deals 3d20 damage to a creature adjacent to where she began or ended; Immensity (Reach 12) forces a DC 20 STR save (disadvantage if within Reach 4) or 3d20 damage and Prone (half on save); Glimpse Your End forces a DC 20 WIL save or the target is DOOMED (concentration ends, next damage roll against them is maximized); Plasma Storm (Reach 6) forces a DC 20 DEX save or 2d20 lightning and 2d20 fire damage (half on save); Singularity (Reach 2) deals 5d20 bludgeoning damage; Almighty Push & Pull (Range 12) forces a DC 20 STR save or the target is launched 20 ft. into the air, repeating until they save, taking 1d20 fall damage per 10 ft. fallen. BLOODIED: at 310 HP, uses Gravitational Mastery (moves all objects and creatures within 16 spaces anywhere else in the area) and gains Gravitational Lensing (the hero with the most HP is marked; she takes half damage from all sources, her mark takes the other half, until the mark drops to 0 HP). LAST STAND: uses Gravitational Mastery, then 200 more damage and she dies; until then she chooses twice each turn, and if still alive after 1 round, uses Reset Time to reset back to full HP.',
    stats: { HP: '620', Armor: 'Heavy', Saves: 'ALL+++' },
  }),
];

async function main() {
  const client = createSupabaseClient();

  // Idempotency guard: prevent re-seeding if any Nimble monster sources already exist.
  const { data: existing, error: existingError } = await client
    .from('monsters')
    .select('id')
    .in('source_id', [SOURCE_FEY, SOURCE_FIENDS, SOURCE_GIANT_BUGS, SOURCE_GMG])
    .limit(1);
  if (existingError) throw new Error(`Failed to check for existing monsters: ${existingError.message}`);
  if (existing && existing.length > 0) {
    throw new Error('Nimble monsters already seeded. Delete existing rows for these sources before re-running this script.');
  }

  let created = 0;
  for (const monster of MONSTERS) {
    await createMonster(client, monster);
    created += 1;
  }

  console.log(`Seeded ${created} Nimble monsters.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
