import { useState, useEffect } from "react";
import { fetchCategories } from "../../services/category.service.js";

const CATEGORY_ICONS = {
  "Dairy & Eggs": "🥛",
  "Dairy": "🥛",
  "Bakery & Snacks": "🍞",
  "Bakery": "🍞",
  "Fruits & Vegetables": "🍎",
  "Fruits": "🍎",
  "Vegetables": "🥦",
  "Cooking & Spices": "🧂",
  "Cooking": "🍳",
  "Beverages & Tea": "🧃",
  "Beverages": "🥤",
  "Personal Care": "🧴",
  "Snacks": "🍿",
  "Grains": "🍚",
};

function SkeletonCell() {
  return (
    <div className="flex items-center gap-3 bg-panel-2 border border-border-soft rounded-xl p-3.5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-border-soft shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3.5 w-24 bg-border-soft rounded" />
        <div className="h-2.5 w-32 bg-border-soft rounded" />
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 border border-red-400/30 bg-red-400/5 rounded-xl px-3 py-2.5 mb-4 text-[12px]">
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
        const list = Array.isArray(data) ? data : (data?.categories || []);
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
    <div className="bg-panel border border-border-soft rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-text-main">
          <span>▦</span> Grocery Categories
        </div>
        <span className="text-[11px] text-text-faint">
          {categories.length} Categories Available
        </span>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCell key={i} />
          ))}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="text-text-dim text-xs py-4 text-center">
          No categories found. Add products with categories to see them listed here.
        </p>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const name = (cat?.name || "Category").toString();
            const icon = cat?.icon || CATEGORY_ICONS[name] || "🛒";
            const itemCount = cat?.itemCount || 10;
            const description = cat?.description || "Browse items in catalog";

            return (
              <button
                key={cat.id || name}
                onClick={() => onSelectCategory?.(name)}
                className="flex items-center gap-3.5 text-left bg-panel-2 border border-border-soft hover:border-teal-dim rounded-xl p-3.5 transition-all hover:bg-panel group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-text-main group-hover:text-teal transition-colors truncate">
                      {name}
                    </h4>
                    <span className="text-[10px] font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full shrink-0">
                      {itemCount} items
                    </span>
                  </div>
                  <p className="text-[11px] text-text-dim truncate mt-0.5">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}