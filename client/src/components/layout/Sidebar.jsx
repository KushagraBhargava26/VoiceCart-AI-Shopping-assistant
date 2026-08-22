export default function Sidebar({ activeView, onNavigate }) {
  const NAV_ITEMS = [
    { key: 'home', label: 'Home', icon: '⌂' },
    { key: 'shopping-list', label: 'Shopping List', icon: '☰' },
    { key: 'suggestions', label: 'Smart Suggestions', icon: '✦' },
    { key: 'search', label: 'Search', icon: '⌕' },
    { key: 'history', label: 'History', icon: '↺' },
    { key: 'categories', label: 'Categories', icon: '▦' },
  ];

  return (
    <aside className="w-56 shrink-0 bg-panel border-r border-border-soft p-4 flex flex-col justify-between min-h-screen">
      <div>
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-purple flex items-center justify-center text-base">
            🛒
          </div>
          <span className="text-[15px] font-semibold tracking-tight">VoiceCart</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeView === item.key
                  ? 'bg-teal/10 text-teal font-medium'
                  : 'text-text-dim hover:bg-panel-2'
              }`}
            >
              <span className="w-4 text-center text-[13px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 px-2 py-2 border-t border-border-soft pt-4">
        <div className="w-8 h-8 rounded-full bg-panel-2 flex items-center justify-center text-sm">
          🙂
        </div>
        <span className="text-[13px] text-text-main">Kushagra</span>
      </div>
    </aside>
  );
}