import { useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import ShoppingListCard from './components/shopping/ShoppingListCard.jsx';
import SuggestionsCard from './components/suggestions/SuggestionsCard.jsx';
import SearchCard from './components/search/SearchCard.jsx';
import HistoryCard from './components/history/HistoryCard.jsx';

function App() {
  const [activeView, setActiveView] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="flex min-h-screen bg-bg text-text-main">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 p-7">
        {(activeView === 'home' || activeView === 'shopping-list') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2">
              <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
            </div>
            <div>
              <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
            </div>
          </div>
        )}

        {activeView === 'suggestions' && (
          <div className="max-w-xl">
            <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
          </div>
        )}

        {activeView === 'search' && (
          <div className="max-w-xl">
            <SearchCard onItemAdded={triggerRefresh} />
          </div>
        )}

        {activeView === 'history' && (
          <div className="max-w-xl">
            <HistoryCard refreshKey={refreshKey} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;