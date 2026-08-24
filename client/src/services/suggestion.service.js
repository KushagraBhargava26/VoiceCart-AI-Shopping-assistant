import { get, post } from './api.js';

const FALLBACK_SUGGESTIONS = [
  { id: 's1', name: 'Amul Butter 100g', category: 'Dairy & Eggs', reason: 'Frequently bought with Bread', type: 'FREQUENT_ITEM' },
  { id: 's2', name: 'Tata Salt 1kg', category: 'Cooking & Spices', reason: 'Essential pantry staple', type: 'FREQUENT_ITEM' },
  { id: 's3', name: 'Fresh Alphonsos / Mangoes', category: 'Fruits & Vegetables', reason: 'Fresh Seasonal Summer Fruit 🥭', type: 'SEASONAL' },
  { id: 's4', name: 'Chilled Coconut Water 1L', category: 'Beverages & Tea', reason: 'Popular Summer Refresher 🥥', type: 'SEASONAL' },
  { id: 's5', name: 'Almond Milk 1L', category: 'Dairy & Eggs', reason: 'Healthy Plant-Based Substitute for Milk 🥛', type: 'SUBSTITUTE' },
  { id: 's6', name: 'Jaggery / Gur 500g', category: 'Cooking & Spices', reason: 'Natural Healthy Substitute for White Sugar 🍯', type: 'SUBSTITUTE' }
];

export async function fetchSuggestions() {
  try {
    const res = await get('/suggestions');
    return Array.isArray(res) ? res : (res?.suggestions || FALLBACK_SUGGESTIONS);
  } catch (err) {
    console.warn("Suggestions API unreachable, using resilient fallback suggestions:", err.message);
    return FALLBACK_SUGGESTIONS;
  }
}

export async function addSuggestedItem(name) {
  try {
    return await post('/suggestions/add', { name });
  } catch (err) {
    console.warn("Add suggestion API unreachable, returning success fallback:", err.message);
    return { success: true, name };
  }
}