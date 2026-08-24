import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';
import App from './App.jsx';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.warn("Global Window Error caught safely:", e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.warn("Global Promise Rejection caught safely:", e.reason);
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
