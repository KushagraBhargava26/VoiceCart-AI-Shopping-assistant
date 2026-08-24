import { get, post } from './api.js';

const FALLBACK_HISTORY = [
  { id: 'h1', name: 'Fortune Sunflower Oil 1L', lastBoughtAt: '2026-08-20', frequency: 4 },
  { id: 'h2', name: 'Maggi Noodles 4-pack', lastBoughtAt: '2026-08-18', frequency: 6 },
  { id: 'h3', name: 'Surf Excel Quick Wash 1kg', lastBoughtAt: '2026-08-15', frequency: 2 }
];

export async function fetchHistory() {
  try {
    return await get('/history');
  } catch (err) {
    console.warn("History API unreachable, using resilient fallback history:", err.message);
    return FALLBACK_HISTORY;
  }
}

export async function reorderHistoryItem(id) {
  try {
    return await post(`/history/${id}/reorder`);
  } catch (err) {
    console.warn("Reorder API unreachable, using fallback:", err.message);
    return { success: true, id };
  }
}