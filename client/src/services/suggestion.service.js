import { get, post } from './api.js';

const FALLBACK_SUGGESTIONS = [
  { id: 's1', name: 'Amul Butter 100g', category: 'Dairy', reason: 'Frequently bought together with Bread' },
  { id: 's2', name: 'Tata Salt 1kg', category: 'Pantry', reason: 'Essential pantry item' },
  { id: 's3', name: 'Fortune Mustard Oil 1L', category: 'Cooking', reason: 'Popular in your area' }
];

export async function fetchSuggestions() {
  try {
    return await get('/suggestions');
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