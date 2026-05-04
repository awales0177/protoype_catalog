import { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { CatalogShellProvider } from './catalog-shell';
import { CATALOG_FEEDBACK_SUBTITLE } from './constants/shellCopy';
import { submitFeedback } from './services/submitFeedback';
import ErrorBoundary from './components/ErrorBoundary';
import SubscriptionsModal from './components/SubscriptionsModal';
import CatalogChatbot from './components/CatalogChatbot';
import { SubscriptionsProvider, useSubscriptions } from './context/SubscriptionsContext';
import HomePage from './pages/HomePage';
import AssetPage from './pages/AssetPage';
import CuratedListPage from './pages/CuratedListPage';
import SearchResultsPage from './pages/SearchResultsPage';
import { ROUTE_SEGMENTS, profileExperience, CATALOG_BASE } from './routes';
import ManageExperiencePage from './pages/ManageExperiencePage';
import './App.css';

const THEME_STORAGE_KEY = 'catalog_ds_header_theme';

function readStoredDarkMode() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
}

function Layout() {
  const navigate = useNavigate();
  const { subscribedIds } = useSubscriptions();
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [darkMode, setDarkModeState] = useState(readStoredDarkMode);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-catalog-theme', darkMode ? 'dark' : 'light');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkModeState((d) => !d), []);
  const setDarkMode = useCallback((next) => setDarkModeState(!!next), []);

  const openNotifications = useCallback(() => setSubscriptionsModalOpen(true), []);

  const outletContext = useMemo(() => ({ subscribedIds }), [subscribedIds]);

  const catalogShellValue = useMemo(
    () => ({
      heroBannerText: 'Banner',
      defaultProfileDisplayName: 'John Doe',
      openNotifications,
      notificationCount: subscribedIds.length,
      feedbackSubtitle: CATALOG_FEEDBACK_SUBTITLE,
      submitFeedback: ({ userId, feedbackText }) => submitFeedback({ userId, feedbackText }),
      darkMode,
      toggleDarkMode,
      setDarkMode,
      onProfileManageExperience: () => navigate(profileExperience()),
      onProfileManageSubscriptions: () => navigate(profileExperience({ tab: 'subscriptions' })),
      onProfileUpdatePreferences: () => navigate(profileExperience({ tab: 'settings' })),
      onProfileOther: () => navigate(profileExperience({ tab: 'other' })),
    }),
    [openNotifications, subscribedIds.length, darkMode, toggleDarkMode, setDarkMode, navigate]
  );

  return (
    <CatalogShellProvider value={catalogShellValue}>
      <div className="app">
        <Outlet context={outletContext} />
      {subscriptionsModalOpen && <SubscriptionsModal onClose={() => setSubscriptionsModalOpen(false)} />}
      <CatalogChatbot />
      </div>
    </CatalogShellProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<Navigate to={CATALOG_BASE} replace />} />
        <Route
          path="catalog"
          element={
            <SubscriptionsProvider>
              <Layout />
            </SubscriptionsProvider>
          }
        >
          <Route index element={<HomePage />} />
          <Route path={ROUTE_SEGMENTS.search} element={<SearchResultsPage />} />
          <Route path={ROUTE_SEGMENTS.asset} element={<AssetPage />} />
          <Route path={ROUTE_SEGMENTS.list} element={<CuratedListPage />} />
          <Route path={ROUTE_SEGMENTS.profileExperience} element={<ManageExperiencePage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
