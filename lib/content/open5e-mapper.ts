import type { MonsterInput } from './monsters';

export interface Open5eMonster {
  name: string;
  challenge_rating?: string;
  armor_class?: number;
  hit_points?: number;
  speed?: { walk?: number };
  type?: string;
  desc?: string;
}

export function mapOpen5eMonsterToRow(raw: Open5eMonster, systemId: string, sourceId: string): MonsterInput {
  return {
    name: raw.name,
    system_id: systemId,
    source_id: sourceId,
    is_homebrew: false,
    rating_label: raw.challenge_rating ? `CR ${raw.challenge_rating}` : undefined,
    tags: raw.type ? [raw.type] : [],
    description: raw.desc ?? '',
    stats: {
      ...(raw.armor_class !== undefined ? { 'Armor Class': String(raw.armor_class) } : {}),
      ...(raw.hit_points !== undefined ? { 'Hit Points': String(raw.hit_points) } : {}),
      ...(raw.speed?.walk !== undefined ? { Speed: `${raw.speed.walk} ft.` } : {}),
    },
  };
}
