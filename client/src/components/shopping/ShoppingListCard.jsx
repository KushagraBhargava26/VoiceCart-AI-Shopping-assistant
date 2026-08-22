import { useState, useEffect, useCallback } from "react";
import ShoppingItemRow from "./ShoppingItemRow.jsx";
import { fetchShoppingList, addItem, updateItem, deleteItem } from "../../services/shoppingList.service.js";

export default function ShoppingListCard({ refreshKey, onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, unit: "" });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchShoppingList();
      setItems(data.items);
      setError(null);
    } catch (err) {
      setError(err.message);
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
    if (!newItem.name.trim() || !newItem.unit.trim()) return;

    try {
      const created = await addItem(newItem);
      setItems((prev) => [...prev, created]);
      setNewItem({ name: "", quantity: 1, unit: "" });
      setShowAddForm(false);
      onChange?.();
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-4.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          🧺 Your Shopping List
          <span className="text-[11px] font-normal bg-panel-2 border border-border-soft text-text-dim px-2 py-0.5 rounded-full">
            {items.length} items
          </span>
        </div>
      </div>

      {loading && <p className="text-text-faint text-[12px]">Loading your list...</p>}
      {error && <p className="text-red-400 text-[12px] mb-2">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="text-text-faint text-[12px] mb-3">Your shopping list is empty. Add an item or try a voice command.</p>
      )}

      {items.map((item) => (
        <ShoppingItemRow key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDelete} />
      ))}

      {showAddForm ? (
        <form onSubmit={handleAddItem} className="mt-3 flex gap-2 text-[12px]">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="flex-1 bg-panel-2 border border-border-soft rounded-md px-2 py-1.5 outline-none focus:border-teal"
          />
          <input
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            className="w-16 bg-panel-2 border border-border-soft rounded-md px-2 py-1.5 outline-none focus:border-teal"
          />
          <input
            type="text"
            placeholder="unit"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="w-20 bg-panel-2 border border-border-soft rounded-md px-2 py-1.5 outline-none focus:border-teal"
          />
          <button type="submit" className="bg-teal-dim text-teal px-3 rounded-md">
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mt-3 border border-dashed border-border-soft text-purple text-[13px] py-2 rounded-lg hover:bg-panel-2 transition-colors">
          + Add Item
        </button>
      )}
    </div>
  );
}
