import { useState } from "react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "shopping-list", label: "Shopping List", icon: "☰" },
  { key: "suggestions", label: "Smart Suggestions", icon: "✦" },
  { key: "search", label: "Search", icon: "⌕" },
  { key: "history", label: "History", icon: "↺" },
  { key: "categories", label: "Categories", icon: "▦" },
];

export default function Sidebar({ activeView, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigate(key) {
    onNavigate(key);
    setIsOpen(false);
  }

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between bg-panel border-b border-border-soft px-4 py-3 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal to-purple flex items-center justify-center text-sm">
            🛒
          </div>
          <span className="text-[14px] font-semibold">VoiceCart</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="text-text-main text-xl px-2" aria-label="Open menu">
          ☰
        </button>
      </div>

      {/* Overlay backdrop (mobile only, when open) */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/60 z-40" />}

      {/* Sidebar itself: static on desktop, slide-in drawer on mobile */}
      <aside
        className={`
          bg-panel border-r border-border-soft p-4 flex flex-col justify-between
          w-64 md:w-56 min-h-screen
          fixed md:static top-0 left-0 z-50
          transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}>
        <div>
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-purple flex items-center justify-center text-base">
                🛒
              </div>
              <span className="text-[15px] font-semibold tracking-tight">VoiceCart</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-text-dim text-lg" aria-label="Close menu">
              ✕
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  activeView === item.key ? "bg-teal/10 text-teal font-medium" : "text-text-dim hover:bg-panel-2"
                }`}>
                <span className="w-4 text-center text-[13px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 px-2 py-2 border-t border-border-soft pt-4">
          <div className="w-8 h-8 rounded-full bg-panel-2 flex items-center justify-center text-sm">🙂</div>
          <span className="text-[13px] text-text-main">Kushagra</span>
        </div>
      </aside>
    </>
  );
}
