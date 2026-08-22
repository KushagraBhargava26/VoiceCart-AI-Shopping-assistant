import { get } from './api.js';

export function fetchCategories() {
  return get('/categories');
}