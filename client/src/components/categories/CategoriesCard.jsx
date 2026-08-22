import { useState, useEffect } from 'react';
import { fetchCategories } from '../../services/category.service.js';

const CATEGORY_ICONS = {
  Dairy: '🥛',
  Fruits: '🍎',
  Vegetables: '🥦',
  Beverages: '💧',
  Snacks: '🍟',
  Grains: '🍚',
  'Personal Care': '🧴',
  Bakery: '🍞',
};

export default function CategoriesCard({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCategories();
        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-4.5">
      <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">
        ▦ Categories
      </div>

      {loading && <p className="text-text-faint text-[12px]">Loading categories...</p>}
      {error && <p className="text-red-400 text-[12px]">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory?.(cat.name)}
            className="flex flex-col items-center text-center bg-panel-2 border border-border-soft rounded-lg py-3 px-2 hover:border-teal-dim transition-colors"
          >
            <span className="text-xl mb-1">{CATEGORY_ICONS[cat.name] || '🛒'}</span>
            <span className="text-[11.5px] font-medium">{cat.name}</span>
            <span className="text-[10px] text-text-faint">{cat.itemCount} items</span>
          </button>
        ))}
      </div>
    </div>
  );
}