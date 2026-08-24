import { get } from './api.js';

const FALLBACK_CATALOG = [
  { id: "p1", name: "Amul Taaza Milk 1L", brand: "Amul", category: "Dairy", price: 68, size: "1L" },
  { id: "p2", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery", price: 45, size: "400g" },
  { id: "p3", name: "Colgate Strong Teeth Toothpaste 200g", brand: "Colgate", category: "Personal Care", price: 110, size: "200g" },
  { id: "p4", name: "Fortune Sunflower Oil 1L", brand: "Fortune", category: "Cooking", price: 155, size: "1L" },
  { id: "p5", name: "Tata Salt 1kg", brand: "Tata", category: "Pantry", price: 28, size: "1kg" }
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

    return await get(`/search?${params.toString()}`);
  } catch (err) {
    console.warn("Search API unreachable, using resilient catalog fallback:", err.message);
    const q = (query || category || "").toLowerCase().trim();
    const filtered = FALLBACK_CATALOG.filter(p => 
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
    return { results: filtered.length ? filtered : FALLBACK_CATALOG };
  }
}