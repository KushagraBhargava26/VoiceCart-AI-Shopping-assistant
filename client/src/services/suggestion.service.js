import { get } from './api.js';

export function fetchSuggestions() {
  return get('/suggestions');
}