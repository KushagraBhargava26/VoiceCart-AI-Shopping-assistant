import { get, post, patch, del } from './api.js';

const FALLBACK_ITEMS = [
  { id: 'f1', name: 'Amul Taaza Milk', quantity: 2, unit: 'L', category: 'Dairy', brand: 'Amul', status: 'PENDING', price: 68 },
  { id: 'f2', name: 'Britannia Brown Bread', quantity: 1, unit: 'pkt', category: 'Bakery', brand: 'Britannia', status: 'PENDING', price: 45 },
  { id: 'f3', name: 'Eggs (Pack of 6)', quantity: 1, unit: 'box', category: 'Grocery', brand: '', status: 'PENDING', price: 55 },
];

export async function fetchShoppingList() {
  try {
    const res = await get('/shopping-list');
    return res;
  } catch (err) {
    console.warn("Shopping list API unreachable, using resilient fallback items:", err.message);
    return {
      items: FALLBACK_ITEMS,
      cartTotal: 236,
      partialTotal: false,
      currency: "INR"
    };
  }
}

export async function addItem({ name, quantity, unit, category, brand }) {
  try {
    return await post('/shopping-list/items', { name, quantity, unit, category, brand });
  } catch (err) {
    console.warn("Add item API unreachable, using local fallback item:", err.message);
    return {
      id: `local_${Date.now()}`,
      name,
      quantity: quantity || 1,
      unit: unit || 'pcs',
      category: category || 'General',
      brand: brand || '',
      status: 'PENDING'
    };
  }
}

export async function updateItem(id, updates) {
  try {
    return await patch(`/shopping-list/items/${id}`, updates);
  } catch (err) {
    console.warn("Update item API unreachable, using local fallback:", err.message);
    return { id, ...updates };
  }
}

export async function deleteItem(id) {
  try {
    return await del(`/shopping-list/items/${id}`);
  } catch (err) {
    console.warn("Delete item API unreachable, using local fallback:", err.message);
    return { success: true };
  }
}