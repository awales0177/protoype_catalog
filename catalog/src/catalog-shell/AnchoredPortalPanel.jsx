import { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

function clampPanelPosition(anchorEl, panelEl, margin = 8) {
  if (!anchorEl || !panelEl) return { top: margin, left: margin };
  const ar = anchorEl.getBoundingClientRect();
  const pw = panelEl.offsetWidth || 320;
  const ph = panelEl.offsetHeight || 200;
  let top = ar.bottom + margin;
  let left = ar.left;
  if (left + pw > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - pw - margin);
  }
  if (left < margin) left = margin;
  if (top + ph > window.innerHeight - margin) {
    top = Math.max(margin, ar.top - ph - margin);
  }
  if (top < margin) top = margin;
  return { top, left };
}

/**
 * Fixed panel portaled to `document.body`, positioned under an anchor element.
 *
 * Note: do not depend on `children` for layout — its reference changes every render and
 * would re-run positioning in a loop, causing flicker and stray compositor layers next to
 * other fixed UI (e.g. chat / hero menus).
 */
export function AnchoredPortalPanel({ open, onClose, anchorRef, children, className }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const reposition = useCallback(() => {
    const anchor = anchorRef?.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    setPos(clampPanelPosition(anchor, panel));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const id = requestAnimationFrame(() => reposition());
    return () => cancelAnimationFrame(id);
  }, [open, anchorRef, reposition]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => reposition();
    window.addEventListener('scroll', onWin, true);
    window.addEventListener('resize', onWin);
    return () => {
      window.removeEventListener('scroll', onWin, true);
      window.removeEventListener('resize', onWin);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open || typeof ResizeObserver === 'undefined') return;
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(() => reposition());
    ro.observe(panel);
    return () => ro.disconnect();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const a = anchorRef?.current;
      const p = panelRef.current;
      if (a?.contains(e.target) || p?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={className}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        isolation: 'isolate',
      }}
      role="presentation"
    >
      {children}
    </div>,
    document.body
  );
}
