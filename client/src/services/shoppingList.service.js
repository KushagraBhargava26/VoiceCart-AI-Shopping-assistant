import { get, post, patch, del } from './api.js';

const LOCAL_ITEMS_KEY = "voicecart_local_items_store";
const LOCAL_HISTORY_KEY = "voicecart_local_history_store";

const PRICE_LOOKUP = [
  { keywords: ["water", "bisleri", "pani", "paani"], price: 20 },
  { keywords: ["milk", "doodh", "dudh"], price: 68 },
  { keywords: ["bread", "pav", "bun"], price: 45 },
  { keywords: ["egg", "anda", "ande"], price: 55 },
  { keywords: ["butter", "makkan"], price: 58 },
  { keywords: ["paneer"], price: 95 },
  { keywords: ["dahi", "curd"], price: 40 },
  { keywords: ["ghee"], price: 325 },
  { keywords: ["apple", "seb"], price: 140 },
  { keywords: ["banana", "kela", "kele"], price: 60 },
  { keywords: ["tomato", "tamatar"], price: 35 },
  { keywords: ["potato", "aloo"], price: 30 },
  { keywords: ["onion", "pyaaz", "pyaz"], price: 40 },
  { keywords: ["capsicum", "shimla mirch"], price: 25 },
  { keywords: ["chips", "kurkure", "namkeen", "biscuits", "cookie", "oreo"], price: 20 },
  { keywords: ["tea", "chai"], price: 240 },
  { keywords: ["coffee"], price: 175 },
  { keywords: ["juice"], price: 115 },
  { keywords: ["coca", "pepsi", "sprite", "soda", "cold drink"], price: 45 },
  { keywords: ["oil", "mustard oil", "tel"], price: 155 },
  { keywords: ["salt", "namak"], price: 28 },
  { keywords: ["toothpaste", "colgate", "pepsodent"], price: 110 },
  { keywords: ["soap", "dettol", "lux"], price: 48 },
  { keywords: ["shampoo", "dove", "pantene"], price: 165 },
  { keywords: ["sanitizer"], price: 50 },
  { keywords: ["face wash"], price: 140 },
  { keywords: ["rice", "chawal"], price: 65 },
  { keywords: ["atta", "flour"], price: 55 }
];

export function resolveItemPrice(itemName, providedPrice) {
  if (providedPrice && Number(providedPrice) > 0) return Number(providedPrice);

  const clean = (itemName || "").toLowerCase().trim();
  for (const entry of PRICE_LOOKUP) {
    if (entry.keywords.some((kw) => clean.includes(kw))) {
      return entry.price;
    }
  }

  return 25;
}

function archiveDeletedItemLocally(item) {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const entry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: item.name || item.itemName || "Item",
      category: item.category || "General",
      quantity: item.quantity || 1,
      unit: item.unit || "unit",
      price: item.price || item.estimatedPrice || 45,
      purchasedAt: new Date().toISOString()
    };
    const list = Array.isArray(history) ? history : [];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([entry, ...list]));
  } catch (e) {}
}

export function getLocalItems() {
  try {
    const data = localStorage.getItem(LOCAL_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalItems(items) {
  try {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {}
}

export async function fetchShoppingList() {
  try {
    const res = await get('/shopping-list');
    if (res && (res.items || Array.isArray(res))) {
      const items = res.items || res;
      saveLocalItems(items);
      const resolvedItems = items.map((item) => {
        const existingPrice = (item.price === 60 || item.price === 45) ? undefined : (item.price ?? item.estimatedPrice);
        const itemPrice = resolveItemPrice(item.name, existingPrice);
        return { ...item, price: itemPrice, estimatedPrice: itemPrice };
      });
      const cartTotal = resolvedItems.reduce((sum, item) => sum + item.price * Number(item.quantity || 1), 0);
      return {
        items: resolvedItems,
        cartTotal,
        currency: "INR"
      };
    }
    throw new Error("No server items");
  } catch (err) {
    const local = getLocalItems();
    const resolvedLocal = local.map((item) => {
      const existingPrice = (item.price === 60 || item.price === 45) ? undefined : (item.price ?? item.estimatedPrice);
      const itemPrice = resolveItemPrice(item.name, existingPrice);
      return { ...item, price: itemPrice, estimatedPrice: itemPrice };
    });
    const cartTotal = resolvedLocal.reduce((sum, item) => sum + item.price * Number(item.quantity || 1), 0);
    return {
      items: resolvedLocal,
      cartTotal,
      currency: "INR"
    };
  }
}

export async function addItem({ name, quantity, unit, category, brand, price }) {
  const resolvedPrice = resolveItemPrice(name, price);

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
  const existingIdx = local.findIndex((i) => i.name.toLowerCase() === name.toLowerCase());
  if (existingIdx >= 0) {
    local[existingIdx].quantity += quantity || 1;
    local[existingIdx].price = resolvedPrice;
    local[existingIdx].estimatedPrice = resolvedPrice;
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
  const idx = local.findIndex((i) => i.id === id);
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
  const deletedItem = local.find((i) => i.id === id);
  if (deletedItem) {
    archiveDeletedItemLocally(deletedItem);
  }
  const filtered = local.filter((i) => i.id !== id);
  saveLocalItems(filtered);

  try {
    return await del(`/shopping-list/items/${id}`);
  } catch (err) {
    return { success: true };
  }
}