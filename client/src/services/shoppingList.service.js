import { get, post, patch, del } from './api.js';

const LOCAL_ITEMS_KEY = "voicecart_local_items_store";
const LOCAL_HISTORY_KEY = "voicecart_local_history_store";

const NOISE_WORDS = [
  "add", "adb", "ad", "app", "adding", "put", "buy", "need", "want", "get",
  "chahiye", "daal", "daalo", "karo", "bhejo", "rakho", "laao", "item", "unit",
  "1", "2", "3", "4", "5", "l", "litre", "litr e", "kg", "g", "gm", "ml"
];

export function isInvalidItemName(name) {
  if (!name) return true;
  const clean = name.toString().trim().toLowerCase();
  if (clean.length < 2) return true;
  if (NOISE_WORDS.includes(clean)) return true;
  return false;
}

const PRICE_LOOKUP = [
  { keywords: ["water", "bisleri", "pani", "paani"], price: 20 },
  { keywords: ["milk", "doodh", "dudh", "amul milk"], price: 68 },
  { keywords: ["bread", "pav", "bun", "brown bread"], price: 45 },
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
  { keywords: ["rice", "chawal", "basmati"], price: 65 },
  { keywords: ["atta", "flour", "aashirvaad"], price: 55 }
];

export function resolveItemPrice(itemName, providedPrice) {
  if (providedPrice && Number(providedPrice) > 0) return Number(providedPrice);

  const clean = (itemName || "").toLowerCase().trim();
  for (const entry of PRICE_LOOKUP) {
    if (entry.keywords.some((kw) => clean.includes(kw))) {
      return entry.price;
    }
  }

  return 45;
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
      price: item.price || item.estimatedPrice || resolveItemPrice(item.name),
      purchasedAt: new Date().toISOString()
    };
    const list = Array.isArray(history) ? history : [];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([entry, ...list]));
  } catch (e) {}
}

export function getLocalItems() {
  try {
    const data = localStorage.getItem(LOCAL_ITEMS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(i => i && i.name && !isInvalidItemName(i.name));
  } catch (e) {
    return [];
  }
}

export function saveLocalItems(items) {
  try {
    const valid = (Array.isArray(items) ? items : []).filter(i => i && i.name && !isInvalidItemName(i.name));
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(valid));
  } catch (e) {}
}

export async function fetchShoppingList() {
  try {
    const res = await get('/shopping-list');
    if (res && (res.items || Array.isArray(res))) {
      const rawItems = res.items || res;
      const items = rawItems.filter(i => i && i.name && !isInvalidItemName(i.name));
      saveLocalItems(items);
      const resolvedItems = items.map((item) => {
        const itemPrice = resolveItemPrice(item.name, item.price ?? item.estimatedPrice);
        return { ...item, price: itemPrice, estimatedPrice: itemPrice };
      });
      const cartTotal = resolvedItems.reduce((sum, item) => sum + item.price * Number(item.quantity || 1), 0);
      // partialTotal: true if any item had no matching price in catalog (defaulted to 45)
      const partialTotal = resolvedItems.some(item => {
        const clean = (item.name || "").toLowerCase().trim();
        return !PRICE_LOOKUP.some(e => e.keywords.some(kw => clean.includes(kw)));
      });
      return {
        items: resolvedItems,
        cartTotal,
        partialTotal,
        currency: "INR"
      };
    }
    throw new Error("No server items");
  } catch (err) {
    const local = getLocalItems();
    const resolvedLocal = local.map((item) => {
      const itemPrice = resolveItemPrice(item.name, item.price ?? item.estimatedPrice);
      return { ...item, price: itemPrice, estimatedPrice: itemPrice };
    });
    const cartTotal = resolvedLocal.reduce((sum, item) => sum + item.price * Number(item.quantity || 1), 0);
    const partialTotal = resolvedLocal.some(item => {
      const clean = (item.name || "").toLowerCase().trim();
      return !PRICE_LOOKUP.some(e => e.keywords.some(kw => clean.includes(kw)));
    });
    return {
      items: resolvedLocal,
      cartTotal,
      partialTotal,
      currency: "INR"
    };
  }
}

export async function addItem({ name, quantity, unit, category, brand, price }) {
  const cleanName = (name || "").toString().trim();
  if (isInvalidItemName(cleanName)) {
    console.warn("Invalid noise item attempted, ignoring:", name);
    return null;
  }

  const resolvedPrice = resolveItemPrice(cleanName, price);

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: cleanName,
    quantity: quantity || 1,
    unit: unit || 'unit',
    category: category || 'General',
    brand: brand || '',
    price: resolvedPrice,
    estimatedPrice: resolvedPrice,
    status: 'PENDING'
  };

  // 1. Instant local optimistic update for 0ms UI lag
  const local = getLocalItems();
  const existingIdx = local.findIndex((i) => i.name.toLowerCase() === cleanName.toLowerCase());
  if (existingIdx >= 0) {
    local[existingIdx].quantity += quantity || 1;
    local[existingIdx].price = resolvedPrice;
    local[existingIdx].estimatedPrice = resolvedPrice;
  } else {
    local.push(newItem);
  }
  saveLocalItems(local);

  // 2. Non-blocking async database write
  post('/shopping-list/items', { name: cleanName, quantity: quantity || 1, unit: unit || 'unit', category, brand, price: resolvedPrice })
    .then((res) => {
      if (res && res.data && res.data.id) {
        const freshLocal = getLocalItems();
        const itemToUpdate = freshLocal.find(i => i.id === newItem.id);
        if (itemToUpdate) {
          itemToUpdate.id = res.data.id;
          saveLocalItems(freshLocal);
        }
      }
    })
    .catch((err) => {
      console.warn("Server DB sync background note:", err.message);
    });

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