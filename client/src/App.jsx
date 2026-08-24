import { useState } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import VoiceCard from "./components/voice/VoiceCard.jsx";
import ShoppingListCard from "./components/shopping/ShoppingListCard.jsx";
import SuggestionsCard from "./components/suggestions/SuggestionsCard.jsx";
import SearchCard from "./components/search/SearchCard.jsx";
import HistoryCard from "./components/history/HistoryCard.jsx";
import CategoriesCard from "./components/categories/CategoriesCard.jsx";

function App() {
  const [voiceSearchQuery, setVoiceSearchQuery] = useState(null);
  const [activeView, setActiveView] = useState("home");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchPresetQuery, setSearchPresetQuery] = useState(null);

  function triggerRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  function handleVoiceSearch(query) {
    setVoiceSearchQuery(query);
    setActiveView("search");
  }

  function handleSelectCategory(categoryName) {
    setSearchPresetQuery(categoryName);
    setActiveView("search");
  }

  return (
    <div className="flex min-h-screen bg-bg text-text-main">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 pt-20 px-4 pb-4 md:p-7">
        {activeView === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2 space-y-5">
              <VoiceCard onCommandProcessed={triggerRefresh} onSearchCommand={handleVoiceSearch} onNavigate={setActiveView} />
              <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
            </div>
            <div>
              <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
            </div>
          </div>
        )}

        {activeView === "shopping-list" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2">
              <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
            </div>
            <div>
              <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
            </div>
          </div>
        )}

        {activeView === "suggestions" && (
          <div className="max-w-xl">
            <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
          </div>
        )}

        {activeView === "search" && (
          <div className="max-w-xl">
            <SearchCard onItemAdded={triggerRefresh} presetQuery={searchPresetQuery} voiceQuery={voiceSearchQuery} />
          </div>
        )}

        {activeView === "history" && (
          <div className="max-w-xl">
            <HistoryCard refreshKey={refreshKey} />
          </div>
        )}

        {activeView === "categories" && (
          <div className="max-w-2xl">
            <CategoriesCard onSelectCategory={handleSelectCategory} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
