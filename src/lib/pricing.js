import { FOUNDATION_NAIRA, PATHWAY_NAIRA, MENTORSHIP_NAIRA } from '../data/pathways.js';
const ALLOWED_IDS = new Set(['video', 'graphics', 'prompting', 'websites', 'digital-products']);

export function normalizeSelection(pathwayIds = []) {
  if (!Array.isArray(pathwayIds)) throw new Error('Choose valid learning pathways.');
  const unique = [...new Set(pathwayIds)];
  if (unique.some((id) => typeof id !== 'string' || !ALLOWED_IDS.has(id))) throw new Error('One or more selected pathways are invalid.');
  return unique;
}
export function calculateMonthlyPrice(pathwayIds = [], mentorship = false) {
  const pathways = normalizeSelection(pathwayIds);
  if (typeof mentorship !== 'boolean') throw new Error('Invalid mentorship selection.');
  return FOUNDATION_NAIRA + pathways.length * PATHWAY_NAIRA + (mentorship ? MENTORSHIP_NAIRA : 0);
}
export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}
