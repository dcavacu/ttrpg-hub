export type SourceType = 'official' | 'homebrew';

export interface System {
  id: string;
  name: string;
}

export interface Source {
  id: string;
  name: string;
  is_homebrew: boolean;
}

export type CombatRole = 'Melee' | 'Ranged';
export type MonsterTier = 'Normal' | 'Legendary' | 'Minion';
export type ManaCostBucket = '0' | '1-2' | '3+';

export interface Monster {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  rating_label: string | null;
  combat_role: CombatRole | null;
  race: string | null;
  tier: MonsterTier;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export interface Item {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  item_type: string | null;
  rarity: string | null;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export interface Spell {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  level: string | null;
  school: string | null;
  mana_cost: number | null;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export interface Rule {
  id: string;
  name: string;
  system: System;
  source: Source;
  is_homebrew: boolean;
  category: string | null;
  tags: string[];
  description: string;
  stats: Record<string, string>;
}

export interface ContentFilters {
  systemId?: string;
  sourceType?: SourceType;
  search?: string;
  tags?: string[];
  combatRole?: CombatRole;
  race?: string;
  tier?: MonsterTier;
  itemType?: string;
  rarity?: string;
  school?: string;
  manaCostBucket?: ManaCostBucket;
  category?: string;
}
