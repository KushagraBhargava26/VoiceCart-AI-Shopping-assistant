import { get } from './api.js';

const FALLBACK_CATALOG = [
  // 🥛 Dairy & Eggs
  { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, currency: "₹", size: "1L" },
  { id: "p2", name: "Amul Butter 100g", brand: "Amul", category: "Dairy & Eggs", price: 58, currency: "₹", size: "100g" },
  { id: "p3", name: "Amul Fresh Malai Paneer 200g", brand: "Amul", category: "Dairy & Eggs", price: 95, currency: "₹", size: "200g" },
  { id: "p4", name: "Mother Dairy Classic Dahi 400g", brand: "Mother Dairy", category: "Dairy & Eggs", price: 40, currency: "₹", size: "400g" },
  { id: "p5", name: "Fresh Farm Eggs (Pack of 6)", brand: "Farm Fresh", category: "Dairy & Eggs", price: 55, currency: "₹", size: "6 pcs" },

  // 🍞 Bakery & Snacks
  { id: "p6", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery & Snacks", price: 45, currency: "₹", size: "400g" },
  { id: "p7", name: "Lay's Magic Masala Potato Chips", brand: "Lay's", category: "Bakery & Snacks", price: 20, currency: "₹", size: "50g" },
  { id: "p8", name: "Kurkure Masala Munch 90g", brand: "Kurkure", category: "Bakery & Snacks", price: 20, currency: "₹", size: "90g" },
  { id: "p9", name: "Oreo Vanilla Cream Biscuits", brand: "Cadbury", category: "Bakery & Snacks", price: 35, currency: "₹", size: "120g" },
  { id: "p10", name: "Haldiram Bhujia Sev 200g", brand: "Haldiram", category: "Bakery & Snacks", price: 65, currency: "₹", size: "200g" },

  // 🍎 Fruits & Vegetables
  { id: "p11", name: "Fresh Shimla Apples 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 140, currency: "₹", size: "1kg" },
  { id: "p12", name: "Fresh Robusta Bananas 1 Dozen", brand: "Fresh", category: "Fruits & Vegetables", price: 60, currency: "₹", size: "12 pcs" },
  { id: "p13", name: "Hybrid Red Tomatoes 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 35, currency: "₹", size: "1kg" },
  { id: "p14", name: "Fresh Jyoti Potatoes 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 30, currency: "₹", size: "1kg" },
  { id: "p15", name: "Fresh Green Capsicum 250g", brand: "Fresh", category: "Fruits & Vegetables", price: 25, currency: "₹", size: "250g" },

  // 🧂 Cooking & Spices
  { id: "p16", name: "Fortune Kachi Ghani Mustard Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 155, currency: "₹", size: "1L" },
  { id: "p17", name: "Amul Pure Cow Ghee 500ml", brand: "Amul", category: "Cooking & Spices", price: 325, currency: "₹", size: "500ml" },
  { id: "p18", name: "MDH Garam Masala 100g", brand: "MDH", category: "Cooking & Spices", price: 90, currency: "₹", size: "100g" },
  { id: "p19", name: "Catch Turmeric Haldi Powder 100g", brand: "Catch", category: "Cooking & Spices", price: 42, currency: "₹", size: "100g" },
  { id: "p20", name: "Tata Salt Vacuum Evaporated 1kg", brand: "Tata", category: "Cooking & Spices", price: 28, currency: "₹", size: "1kg" },

  // 🧃 Beverages & Tea
  { id: "p21", name: "Tata Tea Premium 500g", brand: "Tata", category: "Beverages & Tea", price: 240, currency: "₹", size: "500g" },
  { id: "p22", name: "Nescafé Classic Instant Coffee 50g", brand: "Nescafé", category: "Beverages & Tea", price: 175, currency: "₹", size: "50g" },
  { id: "p23", name: "Real Fruit Power Orange Juice 1L", brand: "Dabur", category: "Beverages & Tea", price: 115, currency: "₹", size: "1L" },
  { id: "p24", name: "Bisleri Mineral Water 1L", brand: "Bisleri", category: "Beverages & Tea", price: 20, currency: "₹", size: "1L" },
  { id: "p25", name: "Coca-Cola Soft Drink 750ml", brand: "Coca-Cola", category: "Beverages & Tea", price: 45, currency: "₹", size: "750ml" },

  // 🧴 Personal Care
  { id: "p26", name: "Colgate Strong Teeth Toothpaste 200g", brand: "Colgate", category: "Personal Care", price: 110, currency: "₹", size: "200g" },
  { id: "p27", name: "Dettol Antiseptic Bathing Soap 125g", brand: "Dettol", category: "Personal Care", price: 48, currency: "₹", size: "125g" },
  { id: "p28", name: "Dove Intense Repair Shampoo 180ml", brand: "Dove", category: "Personal Care", price: 165, currency: "₹", size: "180ml" },
  { id: "p29", name: "Nivea Soft Light Moisturizer 100ml", brand: "Nivea", category: "Personal Care", price: 185, currency: "₹", size: "100ml" },
  { id: "p30", name: "Parachute 100% Pure Coconut Hair Oil 200ml", brand: "Marico", category: "Personal Care", price: 90, currency: "₹", size: "200ml" },
];

export async function searchProducts({ query, brand, minPrice, maxPrice, size, category }) {
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (brand) params.set('brand', brand);
    if (minPrice !== undefined) params.set('minPrice', minPrice);
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice);
    if (size) params.set('size', size);
    if (category) params.set('category', category);

    const res = await get(`/search?${params.toString()}`);
    if (res && res.results && res.results.length > 0) {
      return res;
    }
    throw new Error("No server results, using catalog search fallback");
  } catch (err) {
    const q = (query || "").toLowerCase().trim();
    const cat = (category || "").toLowerCase().trim();

    const filtered = FALLBACK_CATALOG.filter((p) => {
      const matchCat = !cat || p.category.toLowerCase().includes(cat) || cat.includes(p.category.toLowerCase().split(' ')[0]);
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    return { results: filtered.length > 0 ? filtered : FALLBACK_CATALOG.slice(0, 6) };
  }
}