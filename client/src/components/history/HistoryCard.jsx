import { useState, useEffect } from "react";
import { fetchHistory } from "../../services/history.service.js";
import { addItem } from "../../services/shoppingList.service.js";
import { getItemIcon } from "../../utils/itemIcons.js";

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-soft animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3 w-40 bg-panel-2 rounded" />
        <div className="h-2 w-20 bg-panel-2 rounded" />
      </div>
      <div className="h-6 w-16 bg-panel-2 rounded" />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 border border-red-400/30 bg-red-400/5 rounded-lg px-3 py-2.5 text-[12px] mb-3">
      <span className="text-red-400 mt-px">✕</span>
      <p className="text-red-400">{message}</p>
    </div>
  );
}

export default function HistoryCard({ refreshKey, onItemAdded }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderedIds, setReorderedIds] = useState(new Set());
  const [reorderingId, setReorderingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchHistory();
        const list = data?.history || (Array.isArray(data) ? data : []);
        setHistory(list);
        setError(null);
      } catch (err) {
        setError(err.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  async function handleReorder(entry) {
    setReorderingId(entry.id);
    try {
      await addItem({
        name: entry.itemName,
        quantity: entry.quantity,
        unit: entry.unit,
        category: entry.category,
      });
      setReorderedIds((prev) => new Set(prev).add(entry.id));
      onItemAdded?.();
      // Reset button after 3 seconds so they can reorder again if needed
      setTimeout(() => {
        setReorderedIds((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        });
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setReorderingId(null);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">↺ Purchase History</div>
        {history.length > 0 && (
          <span className="text-[11px] text-text-dim bg-panel-2 border border-border-soft px-2 py-0.5 rounded-full">
            {history.length} {history.length === 1 ? "record" : "records"}
          </span>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}

      {!loading && !error && history.length === 0 && (
        <p className="text-text-dim text-[12px]">
          No history yet. Items you add via voice or manually will appear here once removed from your list.
        </p>
      )}

      {!loading && (
        <div className="divide-y divide-border-soft/60">
          {history.map((entry) => {
            const isAdded = reorderedIds.has(entry.id);
            const isAdding = reorderingId === entry.id;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2.5 hover:bg-panel-2/30 px-2 -mx-2 rounded-lg text-[13px] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg filter drop-shadow-sm">{getItemIcon(entry.itemName, entry.category)}</span>
                  <div>
                    <div className="font-medium text-text-main">
                      {entry.quantity} {entry.unit} of {entry.itemName}
                    </div>
                    <div className="text-[11px] text-text-faint flex items-center gap-2">
                      {entry.category && <span>{entry.category}</span>}
                      <span>• {formatTime(entry.purchasedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReorder(entry)}
                  disabled={isAdded || isAdding}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                    isAdded
                      ? "border-teal/40 bg-teal/10 text-teal cursor-default"
                      : isAdding
                      ? "border-border-soft text-text-dim cursor-wait"
                      : "border-teal-dim text-teal hover:bg-teal/10 hover:border-teal"
                  }`}>
                  {isAdded ? "✓ Added" : isAdding ? "Adding..." : "+ Reorder"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}