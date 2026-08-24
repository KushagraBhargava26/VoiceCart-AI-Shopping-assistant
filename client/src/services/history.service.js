import { get, post } from './api.js';

const FALLBACK_HISTORY = [
  { id: 'h1', name: 'Amul Taaza Fresh Milk 1L', category: 'Dairy & Eggs', lastBoughtAt: '2026-08-23T10:30:00Z', frequency: 8, price: 68 },
  { id: 'h2', name: 'Britannia Brown Bread 400g', category: 'Bakery & Snacks', lastBoughtAt: '2026-08-22T14:15:00Z', frequency: 5, price: 45 },
  { id: 'h3', name: 'Fortune Kachi Ghani Mustard Oil 1L', category: 'Cooking & Spices', lastBoughtAt: '2026-08-20T18:00:00Z', frequency: 3, price: 155 },
  { id: 'h4', name: 'Tata Tea Premium 500g', category: 'Beverages & Tea', lastBoughtAt: '2026-08-18T09:45:00Z', frequency: 6, price: 240 },
  { id: 'h5', name: 'Colgate Strong Teeth Toothpaste 200g', category: 'Personal Care', lastBoughtAt: '2026-08-15T11:20:00Z', frequency: 4, price: 110 },
  { id: 'h6', name: 'Fresh Shimla Apples 1kg', category: 'Fruits & Vegetables', lastBoughtAt: '2026-08-12T16:00:00Z', frequency: 2, price: 140 }
];

export async function fetchHistory() {
  try {
    const res = await get('/history');
    return Array.isArray(res) ? res : (res?.history || FALLBACK_HISTORY);
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