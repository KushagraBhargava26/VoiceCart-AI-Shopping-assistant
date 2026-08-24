import { get, post } from './api.js';

const LOCAL_HISTORY_KEY = "voicecart_local_history_store";

const SEED_HISTORY = [
  { id: 'h1', name: 'Amul Taaza Fresh Milk 1L', category: 'Dairy & Eggs', quantity: 2, unit: 'L', price: 68, purchasedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'h2', name: 'Britannia Brown Bread 400g', category: 'Bakery & Snacks', quantity: 1, unit: 'unit', price: 45, purchasedAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'h3', name: 'Bisleri Mineral Water 1L', category: 'Beverages & Tea', quantity: 2, unit: 'L', price: 20, purchasedAt: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 'h4', name: 'Tata Salt 1kg', category: 'Cooking & Spices', quantity: 1, unit: 'unit', price: 28, purchasedAt: new Date(Date.now() - 3600000 * 72).toISOString() },
  { id: 'h5', name: 'Colgate Strong Teeth Toothpaste 200g', category: 'Personal Care', quantity: 1, unit: 'unit', price: 110, purchasedAt: new Date(Date.now() - 3600000 * 96).toISOString() }
];

export function getLocalHistory() {
  try {
    const data = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(SEED_HISTORY));
      return SEED_HISTORY;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_HISTORY;
  } catch (e) {
    return SEED_HISTORY;
  }
}

export function saveLocalHistory(historyItems) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(historyItems));
  } catch (e) {}
}

export function archiveItemToHistory(item) {
  const history = getLocalHistory();
  const historyEntry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: item.name || item.itemName || "Item",
    category: item.category || "General",
    quantity: item.quantity || 1,
    unit: item.unit || "unit",
    price: item.price || item.estimatedPrice || 45,
    purchasedAt: new Date().toISOString()
  };
  const updated = [historyEntry, ...history];
  saveLocalHistory(updated);
}

export async function fetchHistory() {
  try {
    const res = await get('/history');
    if (res && (Array.isArray(res) && res.length > 0 || Array.isArray(res?.history) && res.history.length > 0)) {
      const serverList = Array.isArray(res) ? res : res.history;
      const local = getLocalHistory();
      const combinedMap = new Map();
      [...serverList, ...local].forEach(h => combinedMap.set(h.id || h.name, h));
      return Array.from(combinedMap.values());
    }
    return getLocalHistory();
  } catch (err) {
    console.warn("History API unreachable, using persistent local history:", err.message);
    return getLocalHistory();
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