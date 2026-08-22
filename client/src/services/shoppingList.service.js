import { get, post, patch, del } from './api.js';

export function fetchShoppingList() {
  return get('/shopping-list');
}

export function addItem({ name, quantity, unit, category, brand }) {
  return post('/shopping-list/items', { name, quantity, unit, category, brand });
}

export function updateItem(id, updates) {
  return patch(`/shopping-list/items/${id}`, updates);
}

export function deleteItem(id) {
  return del(`/shopping-list/items/${id}`);
}