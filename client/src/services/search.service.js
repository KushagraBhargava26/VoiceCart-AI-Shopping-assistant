import { get } from './api.js';

export function searchProducts({ query, brand, minPrice, maxPrice, size, category }) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (brand) params.set('brand', brand);
  if (minPrice !== undefined) params.set('minPrice', minPrice);
  if (maxPrice !== undefined) params.set('maxPrice', maxPrice);
  if (size) params.set('size', size);
  if (category) params.set('category', category);

  return get(`/search?${params.toString()}`);
}