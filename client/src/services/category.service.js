import { get } from './api.js';

const FALLBACK_CATEGORIES = [
  { id: "c1", name: "Dairy & Eggs", icon: "🥛", itemCount: 12, description: "Milk, Butter, Paneer, Dahi, Eggs, Cheese" },
  { id: "c2", name: "Bakery & Snacks", icon: "🍞", itemCount: 14, description: "Bread, Biscuits, Chips, Namkeen, Nachos" },
  { id: "c3", name: "Fruits & Vegetables", icon: "🍎", itemCount: 15, description: "Apples, Bananas, Tomatoes, Potato, Onions" },
  { id: "c4", name: "Cooking & Spices", icon: "🧂", itemCount: 15, description: "Mustard Oil, Ghee, Salt, Haldi, Masala" },
  { id: "c5", name: "Beverages & Tea", icon: "🧃", itemCount: 12, description: "Tea, Coffee, Juice, Mineral Water, Soft Drinks" },
  { id: "c6", name: "Personal Care", icon: "🧴", itemCount: 12, description: "Soap, Shampoo, Toothpaste, Lotion, Sanitizer" },
];

export async function fetchCategories() {
  try {
    const res = await get('/categories');
    return Array.isArray(res) ? res : (res?.categories || FALLBACK_CATEGORIES);
  } catch (err) {
    console.warn("Categories API unreachable, using resilient fallback categories:", err.message);
    return FALLBACK_CATEGORIES;
  }
}