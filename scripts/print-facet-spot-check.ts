import { JUDGMENT_MONSTER_DATA, JUDGMENT_SPELL_MANA_COST } from './backfill-judgment-facets-data';

function sample<T>(entries: [string, T][], size: number): [string, T][] {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

function main() {
  console.log('=== Nimble monster combat_role / race spot-check (10 random rows) ===');
  for (const [name, judgment] of sample(Object.entries(JUDGMENT_MONSTER_DATA.nimble), 10)) {
    console.log(`${name}: combat_role=${judgment.combat_role}${judgment.race ? `, race=${judgment.race}` : ''}`);
  }

  console.log('\n=== SRD monster combat_role spot-check (10 random rows) ===');
  for (const [name, judgment] of sample(Object.entries(JUDGMENT_MONSTER_DATA.srd), 10)) {
    console.log(`${name}: combat_role=${judgment.combat_role}`);
  }

  console.log('\n=== Spell mana_cost spot-check (20 random rows) ===');
  for (const [name, manaCost] of sample(Object.entries(JUDGMENT_SPELL_MANA_COST), 20)) {
    console.log(`${name}: mana_cost=${manaCost}`);
  }
}

main();
