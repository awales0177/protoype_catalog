import { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { CatalogShellProvider } from '@uux/components';
import { CATALOG_FEEDBACK_SUBTITLE } from './constants/shellCopy';
import { submitFeedback } from './services/submitFeedback';
import { ChatbotIcon } from './icons';
import ErrorBoundary from './components/ErrorBoundary';
import SubscriptionsModal from './components/SubscriptionsModal';
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
  const [chatOpen, setChatOpen] = useState(false);
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
      defaultProfileDisplayName: 'John Dow',
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
      onProfileTrackTransfers: () => navigate(profileExperience({ tab: 'transfers' })),
      onProfileOther: () => navigate(profileExperience({ tab: 'other' })),
    }),
    [openNotifications, subscribedIds.length, darkMode, toggleDarkMode, setDarkMode, navigate]
  );
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    const userMsgId = Date.now();
    const botMsgId = userMsgId + 1;
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text }]);
    const reply = text.toLowerCase() === 'hi' ? 'Hi back!' : "I'm a simple bot — say hi and I'll say hi back.";
    setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', text: reply }]);
  }

  return (
    <CatalogShellProvider value={catalogShellValue}>
      <div className="app">
        <Outlet context={outletContext} />
      {subscriptionsModalOpen && <SubscriptionsModal onClose={() => setSubscriptionsModalOpen(false)} />}
      {chatOpen && (
        <div className="chatPanel">
          <div className="chatPanelHeader">
            <span className="chatPanelTitle">Chat</span>
            <button type="button" className="chatPanelClose" aria-label="Close chat" onClick={() => setChatOpen(false)}>×</button>
          </div>
          <div className="chatMessages">
            {messages.length === 0 && <p className="chatPlaceholder">Say hi!</p>}
            {messages.map((m) => (
              <div key={m.id} className={`chatBubble chatBubble${m.role === 'user' ? 'User' : 'Bot'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chatInputRow">
            <input
              type="text"
              className="chatInput"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              aria-label="Chat message"
            />
            <button type="button" className="chatSend" onClick={sendChatMessage} aria-label="Send">Send</button>
          </div>
        </div>
      )}
      <button type="button" className="chatbotFab" aria-label={chatOpen ? 'Close chatbot' : 'Open chatbot'} title="Chatbot" onClick={() => setChatOpen((o) => !o)}>
        <ChatbotIcon />
      </button>
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
