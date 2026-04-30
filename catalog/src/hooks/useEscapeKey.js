import { useEffect } from 'react';

/** @param {boolean} active @param {() => void} onEscape */
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    const handle = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [active, onEscape]);
}
