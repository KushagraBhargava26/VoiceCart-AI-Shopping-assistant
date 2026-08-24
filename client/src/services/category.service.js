import { get } from './api.js';

const FALLBACK_CATEGORIES = [
  { id: "c1", name: "Dairy & Eggs", icon: "🥛", itemCount: 12 },
  { id: "c2", name: "Bakery & Snacks", icon: "🍞", itemCount: 8 },
  { id: "c3", name: "Fruits & Vegetables", icon: "🍎", itemCount: 15 },
  { id: "c4", name: "Cooking & Spices", icon: "🧂", itemCount: 10 },
  { id: "c5", name: "Personal Care", icon: "🧴", itemCount: 6 },
];

export async function fetchCategories() {
  try {
    return await get('/categories');
  } catch (err) {
    console.warn("Categories API unreachable, using resilient fallback categories:", err.message);
    return FALLBACK_CATEGORIES;
  }
}