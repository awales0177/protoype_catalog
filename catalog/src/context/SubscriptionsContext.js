import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'catalog-subscribed-ids';

function loadSubscribedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSubscribedIds(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

const SubscriptionsContext = createContext(null);

export function SubscriptionsProvider({ children }) {
  const [subscribedIds, setSubscribedIds] = useState(loadSubscribedIds);

  useEffect(() => {
    saveSubscribedIds(subscribedIds);
  }, [subscribedIds]);

  const toggleSubscription = useCallback((assetId) => {
    if (!assetId) return;
    setSubscribedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }, []);

  const isSubscribed = useCallback(
    (assetId) => subscribedIds.has(assetId),
    [subscribedIds]
  );

  const subscribedIdsList = useMemo(() => Array.from(subscribedIds), [subscribedIds]);

  const value = useMemo(
    () => ({
      subscribedIds: subscribedIdsList,
      toggleSubscription,
      isSubscribed,
    }),
    [subscribedIdsList, toggleSubscription, isSubscribed]
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionsProvider');
  return ctx;
}
