// lib/cows.ts
export const COWS_ITEMS = [
  'pulse','sweating','restlessness','pupils','aches','rhinorrhea_lacrimation',
  'gi_upset','tremor','yawning','anxiety_irritability','gooseflesh'
] as const;

export type CowsItemKey = typeof COWS_ITEMS[number];
export type CowsScores = Record<CowsItemKey, number>;

export function cowsTotal(scores: CowsScores) {
  return Object.values(scores).reduce((a, b) => a + (b || 0), 0);
}
export function cowsSeverity(total: number) {
  if (total <= 4) return 'none';
  if (total <= 12) return 'mild';
  if (total <= 24) return 'moderate';
  if (total <= 36) return 'mod-severe';
  return 'severe';
}
