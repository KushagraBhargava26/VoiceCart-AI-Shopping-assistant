import { useState } from "react";
const [successMessage, setSuccessMessage] = useState(null);
import { searchProducts } from "../../services/search.service.js";
import { addItem } from "../../services/shoppingList.service.js";

const POPULAR_SEARCHES = ["Milk", "Eggs", "Rice", "Apples", "Bread", "Bananas", "Toothpaste"];

export default function SearchCard({ onItemAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(searchTerm) {
    if (!searchTerm.trim()) return;
    setQuery(searchTerm);
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await searchProducts({ query: searchTerm });
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query);
  }

  async function handleAddToList(product) {
    try {
      await addItem({
        name: product.name,
        quantity: 1,
        unit: product.size || "unit",
        brand: product.brand,
        category: product.category,
      });
      onItemAdded?.();
      setSuccessMessage(`${product.name} added to your shopping list.`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-4.5">
      <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">🔍 Search Products</div>

      <form onSubmit={handleSubmit} className="mb-3">
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-panel-2 border border-border-soft rounded-md px-3 py-2 text-[13px] outline-none focus:border-teal"
        />
      </form>

      {!hasSearched && (
        <div>
          <div className="text-[11px] text-text-faint mb-2">Popular Searches</div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => runSearch(term)}
                className="text-[11px] border border-purple/30 text-purple px-3 py-1 rounded-full hover:bg-purple/10">
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-text-faint text-[12px] mt-3">Searching...</p>}
      {error && <p className="text-red-400 text-[12px] mt-3">{error}</p>}
      {successMessage && <p className="text-teal text-[12px] mt-3">✓ {successMessage}</p>}
      {hasSearched && !loading && results.length === 0 && !error && (
        <p className="text-text-faint text-[12px] mt-3">No products found for "{query}".</p>
      )}

      {results.length > 0 && (
        <div className="mt-3">
          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]">
              <div>
                <div className="font-medium">
                  {product.name} {product.brand && <span className="text-text-dim">— {product.brand}</span>}
                </div>
                <div className="text-[11px] text-text-faint">
                  {product.category} {product.size && `• ${product.size}`}
                  {product.price && ` • ${product.currency} ${product.price}`}
                </div>
              </div>
              <button
                onClick={() => handleAddToList(product)}
                className="text-[11px] px-3 py-1 rounded-md border border-teal-dim text-teal hover:bg-teal/10">
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
