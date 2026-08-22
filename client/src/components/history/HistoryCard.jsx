import { useState, useEffect } from 'react';
import { fetchHistory } from '../../services/history.service.js';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    <div className="bg-panel border border-border-soft rounded-xl p-4.5">
      <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">
        ↺ History
      </div>

      {loading && <p className="text-text-faint text-[12px]">Loading history...</p>}
      {error && <p className="text-red-400 text-[12px]">{error}</p>}
      {!loading && history.length === 0 && (
        <p className="text-text-faint text-[12px]">
          No history yet. Mark items as completed to build your history.
        </p>
      )}

      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]"
        >
          <div>
            <div className="font-medium">
              Added {entry.quantity} {entry.unit} of {entry.itemName}
            </div>
            {entry.category && (
              <div className="text-[11px] text-text-faint">{entry.category}</div>
            )}
          </div>
          <div className="text-[11px] text-text-faint whitespace-nowrap">
            {formatTime(entry.purchasedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}