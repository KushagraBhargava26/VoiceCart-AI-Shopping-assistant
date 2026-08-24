import { useState, useEffect } from "react";
import { fetchHistory } from "../../services/history.service.js";
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
      <div className="h-3 w-16 bg-panel-2 rounded" />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 border border-red-400/30 bg-red-400/5 rounded-lg px-3 py-2.5 text-[12px]">
      <span className="text-red-400 mt-px">✕</span>
      <p className="text-red-400">{message}</p>
    </div>
  );
}

export default function HistoryCard({ refreshKey }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchHistory();
        setHistory(data.history);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">↺ History</div>

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

      {!loading &&
        history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getItemIcon(entry.itemName, entry.category)}</span>
              <div>
                <div className="font-medium">
                  {entry.quantity} {entry.unit} of {entry.itemName}
                </div>
                {entry.category && <div className="text-[11px] text-text-faint">{entry.category}</div>}
              </div>
            </div>
            <div className="text-[11px] text-text-faint whitespace-nowrap">{formatTime(entry.purchasedAt)}</div>
          </div>
        ))}
    </div>
  );
}