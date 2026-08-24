import { useState, useEffect, useCallback } from "react";
import ShoppingItemRow from "./ShoppingItemRow.jsx";
import { fetchShoppingList, addItem, updateItem, deleteItem, resolveItemPrice } from "../../services/shoppingList.service.js";

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-soft animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-panel-2" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-panel-2 rounded" />
          <div className="h-2 w-16 bg-panel-2 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-7 w-20 bg-panel-2 rounded-md" />
        <div className="h-4 w-14 bg-panel-2 rounded" />
        <div className="h-5 w-5 bg-panel-2 rounded" />
      </div>
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

export default function ShoppingListCard({ refreshKey, onChange }) {
  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(null);
  const [partialTotal, setPartialTotal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, unit: "" });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchShoppingList();
      const list = data?.items || (Array.isArray(data) ? data : []);
      setItems(list);
      setCartTotal(data?.cartTotal ?? null);
      setPartialTotal(data?.partialTotal ?? false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  async function handleUpdateQuantity(id, quantity) {
    try {
      const updated = await updateItem(id, { quantity });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      onChange?.();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      onChange?.();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const created = await addItem({
        name: newItem.name.trim(),
        quantity: Number(newItem.quantity) || 1,
        unit: newItem.unit.trim() || "unit"
      });
      // BUG-03 FIX: addItem returns null for noise/invalid names
      if (created) {
        setItems((prev) => [...prev, created]);
      }
      setNewItem({ name: "", quantity: 1, unit: "" });
      setShowAddForm(false);
      onChange?.();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleShareToWhatsApp() {
    if (items.length === 0) return;

    let text = `🛒 *My VoiceCart Shopping List* (${items.length} item${items.length > 1 ? 's' : ''})\n`;
    text += `----------------------------------\n`;
    items.forEach((item) => {
      const priceVal = resolveItemPrice(item.name, item.price ?? item.estimatedPrice) * Number(item.quantity || 1);
      text += `• ${item.name} - ${item.quantity} ${item.unit || 'unit'} (₹${priceVal})\n`;
    });
    text += `----------------------------------\n`;
    text += `💰 *Estimated Total:* ₹${(cartTotal || 0).toFixed(0)}\n\n`;
    text += `Shared via VoiceCart AI Shopping Assistant 🚀\nhttps://voice-cart-ai-shopping-assistant.vercel.app`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          🧺 Shopping List
          {items.length > 0 && (
            <span className="text-[11px] font-normal bg-panel-2 border border-border-soft text-text-dim px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={handleShareToWhatsApp}
              className="text-[12px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
              title="Share shopping list to WhatsApp">
              <span>💬</span> Share to WhatsApp
            </button>
          )}
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="text-[12px] border border-teal-dim text-teal px-2.5 py-1 rounded-md hover:bg-teal/10 transition-colors">
            {showAddForm ? "Cancel" : "+ Add Item"}
          </button>
        </div>
      </div>

      {/* Estimated cart total banner */}
      {cartTotal !== null && items.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-teal/5 border border-teal-dim/40">
          <div className="flex items-center gap-1.5 text-[11.5px] text-text-dim">
            <span>💰</span>
            <span>{partialTotal ? "Estimated total (partial):" : "Estimated total:"}</span>
          </div>
          <span className="text-[13px] font-semibold text-teal">
            ₹{cartTotal.toFixed(0)}
          </span>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {loading && (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}

      {showAddForm && (
        <form onSubmit={handleAddItem} className="mb-3 bg-panel-2 p-3 rounded-lg space-y-2 border border-border-soft">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-panel border border-border-soft rounded px-2.5 py-1 text-[13px] outline-none focus:border-teal"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
              className="w-16 bg-panel border border-border-soft rounded px-2 py-1 text-[13px] outline-none focus:border-teal"
            />
            <input
              type="text"
              placeholder="Unit (e.g. litre, kg, pcs)"
              value={newItem.unit}
              onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))}
              className="flex-1 bg-panel border border-border-soft rounded px-2.5 py-1 text-[13px] outline-none focus:border-teal"
            />
            <button type="submit" className="bg-teal text-bg text-[12px] font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity">
              Save
            </button>
          </div>
        </form>
      )}

      {!loading && items.length === 0 && !error && !showAddForm && (
        <p className="text-text-dim text-[12px] mb-3">
          Your shopping list is empty. Add an item below or try a voice command.
        </p>
      )}

      {!loading && Array.isArray(items) && items.map((item) => (
        <ShoppingItemRow key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDelete} />
      ))}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mt-3 border border-dashed border-border-soft text-purple text-[13px] py-2 rounded-lg hover:bg-panel-2 transition-colors">
          + Add Item
        </button>
      )}
    </div>
  );
}
