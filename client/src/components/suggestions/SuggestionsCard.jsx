import { useState, useEffect } from "react";
import { fetchSuggestions } from "../../services/suggestion.service.js";
import { addItem, fetchShoppingList } from "../../services/shoppingList.service.js";
import { getItemIcon } from "../../utils/itemIcons.js";

const TYPE_ICONS = {
  FREQUENT_ITEM: "🔁",
  SEASONAL: "🍂",
  COMPLEMENTARY: "🔄",
};

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-soft animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-panel-2" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-panel-2 rounded" />
          <div className="h-2 w-20 bg-panel-2 rounded" />
        </div>
      </div>
      <div className="h-6 w-14 bg-panel-2 rounded-md" />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 border border-red-400/30 bg-red-400/5 rounded-lg px-3 py-2.5 mb-3 text-[12px]">
      <span className="text-red-400 mt-px">✕</span>
      <p className="text-red-400">{message}</p>
    </div>
  );
}

export default function SuggestionsCard({ refreshKey, onItemAdded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentListNames, setCurrentListNames] = useState(new Set());

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [suggData, listData] = await Promise.all([fetchSuggestions(), fetchShoppingList()]);
        const suggList = Array.isArray(suggData) ? suggData : (suggData?.suggestions || []);
        const currentItems = listData?.items || (Array.isArray(listData) ? listData : []);
        setSuggestions(suggList);
        setCurrentListNames(new Set(currentItems.map((i) => (i.name || "").toLowerCase())));
        setError(null);
      } catch (err) {
        setError(err.message);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  async function handleAdd(suggestion) {
    try {
      await addItem({ name: suggestion.item, quantity: 1, unit: "unit" });
      setCurrentListNames((prev) => new Set(prev).add(suggestion.item.toLowerCase()));
      onItemAdded?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">✨ Smart Suggestions</div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <p className="text-text-dim text-[12px]">
          No suggestions right now. Add items to your list to get personalised suggestions.
        </p>
      )}

      {!loading &&
        suggestions.map((s, idx) => {
          const isAdded = currentListNames.has(s.item.toLowerCase());
          return (
            <div
              key={`${s.type}-${s.item}-${idx}`}
              className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-lg">{getItemIcon(s.item)}</span>
                  <span className="absolute -bottom-1 -right-1 text-[9px] leading-none">{TYPE_ICONS[s.type] || "✨"}</span>
                </div>
                <div>
                  <div className="font-medium capitalize">{s.item}</div>
                  <div className="text-[11px] text-text-dim">{s.message}</div>
                </div>
              </div>
              <button
                onClick={() => handleAdd(s)}
                disabled={isAdded}
                className={`text-[11px] px-3 py-1 rounded-md border transition-colors ${
                  isAdded
                    ? "border-border-soft text-text-faint cursor-default"
                    : "border-purple/40 text-purple hover:bg-purple/10"
                }`}>
                {isAdded ? "Added" : "+ Add"}
              </button>
            </div>
          );
        })}
    </div>
  );
}