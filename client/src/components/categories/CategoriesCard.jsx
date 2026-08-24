import { useState, useEffect } from "react";
import { fetchCategories } from "../../services/category.service.js";
import { searchProducts } from "../../services/search.service.js";
import { addItem } from "../../services/shoppingList.service.js";
import { getItemIcon } from "../../utils/itemIcons.js";

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

export default function CategoriesCard({ onSelectCategory, onItemAdded }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCat, setSelectedCat] = useState(null);
  const [catProducts, setCatProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

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

  async function handleCategoryClick(categoryName) {
    if (selectedCat === categoryName) {
      setSelectedCat(null);
      setCatProducts([]);
      return;
    }

    setSelectedCat(categoryName);
    setLoadingProducts(true);
    setSuccessMsg(null);
    try {
      const res = await searchProducts({ category: categoryName });
      const products = res?.results || (Array.isArray(res) ? res : []);
      setCatProducts(products);
    } catch (err) {
      console.warn("Failed to load category products:", err);
      setCatProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleAddProduct(product) {
    try {
      await addItem({
        name: product.name,
        quantity: 1,
        unit: product.size || "unit",
        brand: product.brand || "",
        category: product.category || selectedCat || "General",
      });
      setSuccessMsg(`Added ${product.name} to shopping list!`);
      onItemAdded?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-2xl p-5 sm:p-6 space-y-5">
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
            const itemCount = cat?.itemCount || 5;
            const description = cat?.description || "Browse items in catalog";
            const isSelected = selectedCat === name;

            return (
              <button
                key={cat.id || name}
                onClick={() => handleCategoryClick(name)}
                className={`flex items-center gap-3.5 text-left rounded-xl p-3.5 transition-all shadow-sm border ${
                  isSelected
                    ? "bg-teal/10 border-teal text-text-main"
                    : "bg-panel-2 border-border-soft hover:border-teal-dim hover:bg-panel"
                } group`}>
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

      {/* Inline Category Products List */}
      {selectedCat && (
        <div className="mt-5 border-t border-border-soft pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-teal flex items-center gap-2">
              <span>{CATEGORY_ICONS[selectedCat] || "🛒"}</span> {selectedCat} Products
            </h3>
            <button
              onClick={() => setSelectedCat(null)}
              className="text-[11px] text-text-faint hover:text-text-main transition-colors">
              ✕ Close
            </button>
          </div>

          {successMsg && (
            <p className="text-[12px] text-teal bg-teal/10 border border-teal/20 px-3 py-1.5 rounded-lg">
              ✓ {successMsg}
            </p>
          )}

          {loadingProducts && (
            <p className="text-xs text-text-dim py-2 animate-pulse">Loading category items...</p>
          )}

          {!loadingProducts && catProducts.length === 0 && (
            <p className="text-xs text-text-dim py-2">No specific items found for this category.</p>
          )}

          {!loadingProducts && catProducts.length > 0 && (
            <div className="space-y-2">
              {catProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2.5 px-3 bg-panel-2 border border-border-soft rounded-xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{getItemIcon(product.name, selectedCat)}</span>
                    <div>
                      <span className="font-semibold text-text-main">{product.name}</span>
                      {product.brand && <span className="text-text-dim"> — {product.brand}</span>}
                      <div className="text-[10px] text-text-faint mt-0.5">
                        {product.size && `${product.size} • `}₹{product.price}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddProduct(product)}
                    className="text-[11px] font-medium px-3 py-1 bg-teal/10 hover:bg-teal/20 text-teal border border-teal-dim/30 rounded-lg transition-colors">
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}