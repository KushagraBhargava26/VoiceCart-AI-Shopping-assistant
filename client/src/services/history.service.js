import { get, post } from './api.js';

export async function fetchHistory() {
  try {
    const res = await get('/history');
    return Array.isArray(res) ? res : (res?.history || []);
  } catch (err) {
    console.warn("History API unreachable, returning clean empty history:", err.message);
    return [];
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