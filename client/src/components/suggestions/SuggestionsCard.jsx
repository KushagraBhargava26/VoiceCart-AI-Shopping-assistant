import { useState, useEffect } from 'react';
import { fetchSuggestions } from '../../services/suggestion.service.js';
import { addItem, fetchShoppingList } from '../../services/shoppingList.service.js';

const TYPE_ICONS = {
  FREQUENT_ITEM: '🔁',
  SEASONAL: '🍂',
  SUBSTITUTE: '🔄',
};

export default function SuggestionsCard({ refreshKey, onItemAdded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [currentListNames, setCurrentListNames] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [suggestionData, listData] = await Promise.all([
          fetchSuggestions(),
          fetchShoppingList(),
        ]);
        setSuggestions(suggestionData);
        setCurrentListNames(
          new Set(listData.items.map((item) => item.name.toLowerCase()))
        );
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  async function handleAdd(suggestion) {
    try {
      await addItem({ name: suggestion.item, quantity: 1, unit: 'unit' });
      setCurrentListNames((prev) => new Set(prev).add(suggestion.item.toLowerCase()));
      onItemAdded?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-4.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          ✨ Smart Suggestions
        </div>
      </div>

      {loading && <p className="text-text-faint text-[12px]">Loading suggestions...</p>}
      {error && <p className="text-red-400 text-[12px]">{error}</p>}
      {!loading && suggestions.length === 0 && (
        <p className="text-text-faint text-[12px]">No suggestions right now.</p>
      )}

      {suggestions.map((s, idx) => {
        const isAdded = currentListNames.has(s.item.toLowerCase());
        return (
          <div
            key={`${s.type}-${s.item}-${idx}`}
            className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{TYPE_ICONS[s.type] || '✨'}</span>
              <div>
                <div className="font-medium capitalize">{s.item}</div>
                <div className="text-[11px] text-text-faint">{s.message}</div>
              </div>
            </div>
            <button
              onClick={() => handleAdd(s)}
              disabled={isAdded}
              className={`text-[11px] px-3 py-1 rounded-md border ${
                isAdded
                  ? 'border-border-soft text-text-faint cursor-default'
                  : 'border-purple/40 text-purple hover:bg-purple/10'
              }`}
            >
              {isAdded ? 'Added' : '+ Add'}
            </button>
          </div>
        );
      })}
    </div>
  );
}