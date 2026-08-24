import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import VoiceCard from "./components/voice/VoiceCard.jsx";
import ShoppingListCard from "./components/shopping/ShoppingListCard.jsx";
import SuggestionsCard from "./components/suggestions/SuggestionsCard.jsx";
import SearchCard from "./components/search/SearchCard.jsx";
import HistoryCard from "./components/history/HistoryCard.jsx";
import CategoriesCard from "./components/categories/CategoriesCard.jsx";
import LoginPage from "./components/auth/LoginPage.jsx";
import { getStoredUser, logoutUser } from "./services/auth.service.js";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [voiceSearchQuery, setVoiceSearchQuery] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchPresetQuery, setSearchPresetQuery] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  function handleLogout() {
    logoutUser();
    setUser(null);
    navigate("/login");
  }

  function handleAuthSuccess(userData) {
    setUser(userData);
    navigate("/");
  }

  function triggerRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  function handleVoiceSearch(query) {
    setVoiceSearchQuery(query);
    navigate("/search");
  }

  function handleSelectCategory(categoryName) {
    setSearchPresetQuery(categoryName);
    navigate("/search");
  }

  // Derive active view key from URL path
  const path = location.pathname;
  let activeView = "home";
  if (path === "/shopping-list") activeView = "shopping-list";
  else if (path === "/suggestions") activeView = "suggestions";
  else if (path === "/search") activeView = "search";
  else if (path === "/history") activeView = "history";
  else if (path === "/categories") activeView = "categories";

  function handleSidebarNavigate(key) {
    const routeMap = {
      home: "/",
      "shopping-list": "/shopping-list",
      suggestions: "/suggestions",
      search: "/search",
      history: "/history",
      categories: "/categories",
    };
    navigate(routeMap[key] || "/");
  }

  // Standalone Login Page route
  if (path === "/login") {
    return (
      <LoginPage
        onLoginSuccess={handleAuthSuccess}
        onGuestLogin={() => navigate("/")}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-text-main">
      <Sidebar
        activeView={activeView}
        onNavigate={handleSidebarNavigate}
        user={user}
        onOpenAuth={() => navigate("/login")}
        onLogout={handleLogout}
      />
      <main className="flex-1 pt-20 px-4 pb-4 md:p-7">
        <Routes>
          <Route
            path="/"
            element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                <div className="lg:col-span-2 space-y-5">
                  <VoiceCard
                    onCommandProcessed={triggerRefresh}
                    onSearchCommand={handleVoiceSearch}
                    onNavigate={handleSidebarNavigate}
                  />
                  <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
                </div>
                <div>
                  <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
                </div>
              </div>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                <div className="lg:col-span-2">
                  <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
                </div>
                <div>
                  <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
                </div>
              </div>
            }
          />
          <Route
            path="/suggestions"
            element={
              <div className="max-w-xl">
                <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
              </div>
            }
          />
          <Route
            path="/search"
            element={
              <div className="max-w-xl">
                <SearchCard
                  onItemAdded={triggerRefresh}
                  presetQuery={searchPresetQuery}
                  voiceQuery={voiceSearchQuery}
                />
              </div>
            }
          />
          <Route
            path="/history"
            element={
              <div className="max-w-xl">
                <HistoryCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
              </div>
            }
          />
          <Route
            path="/categories"
            element={
              <div className="max-w-2xl">
                <CategoriesCard onSelectCategory={handleSelectCategory} />
              </div>
            }
          />
          {/* Catch-all fallback */}
          <Route
            path="*"
            element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                <div className="lg:col-span-2 space-y-5">
                  <VoiceCard
                    onCommandProcessed={triggerRefresh}
                    onSearchCommand={handleVoiceSearch}
                    onNavigate={handleSidebarNavigate}
                  />
                  <ShoppingListCard refreshKey={refreshKey} onChange={triggerRefresh} />
                </div>
                <div>
                  <SuggestionsCard refreshKey={refreshKey} onItemAdded={triggerRefresh} />
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
