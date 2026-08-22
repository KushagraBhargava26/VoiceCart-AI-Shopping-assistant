import { get } from './api.js';

export function fetchHistory() {
  return get('/history');
}