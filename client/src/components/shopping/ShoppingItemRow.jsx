import { getItemIcon } from "../../utils/itemIcons.js";

export default function ShoppingItemRow({ item, onUpdateQuantity, onDelete }) {
  const icon = getItemIcon(item.name, item.category);
  const unitPrice = Number(item.price ?? item.estimatedPrice ?? item.unitPrice ?? 45);
  const totalPrice = unitPrice * Number(item.quantity || 1);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-none text-[13px]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {item.name} {item.brand && <span className="text-text-dim font-normal">— {item.brand}</span>}
          </div>
          {item.category && <div className="text-[11px] text-text-faint truncate">{item.category}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-panel-2 border border-border-soft rounded-md px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
            className="text-text-dim hover:text-teal px-1 transition-colors">
            −
          </button>
          <span className="min-w-[16px] text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
            className="text-text-dim hover:text-teal px-1 transition-colors">
            +
          </button>
        </div>

        <span className="text-text-dim text-[11px] w-10 truncate">{item.unit || "unit"}</span>

        <span className="text-xs font-semibold text-teal min-w-[55px] text-right">
          ₹{totalPrice}
        </span>

        <button
          onClick={() => onDelete(item.id)}
          className="text-red-400/80 hover:text-red-400 transition-colors p-1"
          aria-label={`Delete ${item.name}`}>
          🗑
        </button>
      </div>
    </div>
  );
}
