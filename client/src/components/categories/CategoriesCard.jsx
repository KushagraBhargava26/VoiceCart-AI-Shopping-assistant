import { useState, useEffect } from "react";
import { fetchCategories } from "../../services/category.service.js";

const CATEGORY_ICONS = {
  Dairy: "🥛",
  Fruits: "🍎",
  Vegetables: "🥦",
  Beverages: "🧃",
  Snacks: "🍟",
  Grains: "🍚",
  "Personal Care": "🧴",
  Bakery: "🍞",
};

function SkeletonCell() {
  return (
    <div className="flex flex-col items-center text-center bg-panel-2 border border-border-soft rounded-lg py-3 px-2 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-border-soft mb-1" />
      <div className="h-2.5 w-16 bg-border-soft rounded mb-1" />
      <div className="h-2 w-10 bg-border-soft rounded" />
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

export default function CategoriesCard({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCategories();
        const list = data?.categories || (Array.isArray(data) ? data : []);
        setCategories(list);
        setError(null);
      } catch (err) {
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">▦ Categories</div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCell key={i} />
          ))}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="text-text-dim text-[12px]">No categories found. Add products with categories to see them here.</p>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.name)}
              className="flex flex-col items-center text-center bg-panel-2 border border-border-soft rounded-lg py-3 px-2 hover:border-teal-dim transition-colors">
              <span className="text-xl mb-1">{CATEGORY_ICONS[cat.name] || "🛒"}</span>
              <span className="text-[11.5px] font-medium">{cat.name}</span>
              <span className="text-[10px] text-text-faint">{cat.itemCount} items</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}