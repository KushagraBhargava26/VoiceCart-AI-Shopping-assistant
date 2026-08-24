import { get, post, patch, del } from './api.js';

const LOCAL_ITEMS_KEY = "voicecart_local_items_store";

const PRICE_LOOKUP = {
  milk: 68,
  bread: 45,
  apples: 140,
  water: 20,
  eggs: 55,
  butter: 58,
  paneer: 95,
  dahi: 40,
  chips: 20,
  tea: 240,
  coffee: 175,
  oil: 155,
  salt: 28,
  toothpaste: 110,
  soap: 48,
  shampoo: 165
};

function getLocalItems() {
  try {
    const data = localStorage.getItem(LOCAL_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalItems(items) {
  try {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {}
}

export async function fetchShoppingList() {
  try {
    const res = await get('/shopping-list');
    if (res && res.items && Array.isArray(res.items)) {
      const local = getLocalItems();
      const combinedMap = new Map();
      [...res.items, ...local].forEach(item => combinedMap.set(item.id || item.name, item));
      const combined = Array.from(combinedMap.values());
      const cartTotal = combined.reduce((sum, item) => {
        const p = item.price ?? item.estimatedPrice ?? PRICE_LOOKUP[(item.name || "").toLowerCase()] ?? 50;
        return sum + (Number(p) * Number(item.quantity || 1));
      }, 0);
      return { items: combined, cartTotal, currency: "INR" };
    }
    throw new Error("No server items");
  } catch (err) {
    const local = getLocalItems();
    const cartTotal = local.reduce((sum, item) => {
      const p = item.price ?? item.estimatedPrice ?? PRICE_LOOKUP[(item.name || "").toLowerCase()] ?? 50;
      return sum + (Number(p) * Number(item.quantity || 1));
    }, 0);
    return {
      items: local,
      cartTotal,
      currency: "INR"
    };
  }
}

export async function addItem({ name, quantity, unit, category, brand, price }) {
  const cleanName = (name || "").toLowerCase();
  let matchedPrice = price;
  if (!matchedPrice) {
    for (const [key, val] of Object.entries(PRICE_LOOKUP)) {
      if (cleanName.includes(key)) {
        matchedPrice = val;
        break;
      }
    }
  }
  const resolvedPrice = matchedPrice || 45;

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name,
    quantity: quantity || 1,
    unit: unit || 'unit',
    category: category || 'General',
    brand: brand || '',
    price: resolvedPrice,
    estimatedPrice: resolvedPrice,
    status: 'PENDING'
  };

  const local = getLocalItems();
  const existingIdx = local.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  if (existingIdx >= 0) {
    local[existingIdx].quantity += (quantity || 1);
  } else {
    local.push(newItem);
  }
  saveLocalItems(local);

  try {
    await post('/shopping-list/items', { name, quantity, unit, category, brand, price: resolvedPrice });
  } catch (err) {
    console.warn("Server sync pending, item saved locally:", err.message);
  }

  return newItem;
}

export async function updateItem(id, updates) {
  const local = getLocalItems();
  const idx = local.findIndex(i => i.id === id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalItems(local);
  }

  try {
    return await patch(`/shopping-list/items/${id}`, updates);
  } catch (err) {
    return { id, ...updates };
  }
}

export async function deleteItem(id) {
  const local = getLocalItems();
  const filtered = local.filter(i => i.id !== id);
  saveLocalItems(filtered);

  try {
    return await del(`/shopping-list/items/${id}`);
  } catch (err) {
    return { success: true };
  }
}