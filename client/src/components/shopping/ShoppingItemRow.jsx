const CATEGORY_ICONS = {
  Dairy: "🥛",
  Fruits: "🍎",
  Vegetables: "🥦",
  Beverages: "💧",
  Snacks: "🍟",
  Grains: "🍚",
  "Personal Care": "🧴",
};

export default function ShoppingItemRow({ item, onUpdateQuantity, onDelete }) {
  const icon = CATEGORY_ICONS[item.category] || "🛒";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="font-medium">
            {item.name} {item.brand && <span className="text-text-dim font-normal">— {item.brand}</span>}
          </div>
          {item.category && <div className="text-[11px] text-text-faint">{item.category}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-panel-2 border border-border-soft rounded-md px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
            className="text-text-dim hover:text-teal px-1">
            −
          </button>
          <span className="min-w-[16px] text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)} className="text-text-dim hover:text-teal px-1">
            +
          </button>
        </div>
        <span className="text-text-dim text-[11px] w-14">{item.unit}</span>
        <button onClick={() => onDelete(item.id)} className="text-red-400/80 hover:text-red-400" aria-label={`Delete ${item.name}`}>
          🗑
        </button>
      </div>
    </div>
  );
}
