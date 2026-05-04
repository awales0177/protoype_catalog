/**
 * Synthetic validation-job run history for the lineage Validation tab (demo catalog UX).
 */

import { makeRulRuleId } from './productLineagePresentation';

/** Shown inline in quick pick <select>. */
export const VALIDATION_RUN_QUICKPICK_COUNT = 10;

/** Pool size for browse / search (“older runs”). */
export const VALIDATION_RUN_SEARCH_POOL_SIZE = 100;

/** Canonical “now” for demo timelines (catalog default date context). */
const VALIDATION_RUN_ANCHOR_MS = Date.UTC(2026, 4, 3, 17, 0, 0);

function validationJobRunId(assetId, offset) {
  const tail = makeRulRuleId(`${String(assetId).toLowerCase()}|vj|${offset}`).replace(/^RUL-/, '');
  return `VJOB-${tail}`;
}

export function validationRunFinishedAtMs(offset) {
  const o = Number(offset) || 0;
  return VALIDATION_RUN_ANCHOR_MS - o * 3 * 60 * 60 * 1000;
}

export function formatValidationRunTimestamp(ms) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(ms));
  } catch {
    return String(ms);
  }
}

/**
 * Ordered newest-first by offset ascending (offset 0 = latest).
 */
export function getValidationJobRunCatalog(assetId, totalRuns = VALIDATION_RUN_SEARCH_POOL_SIZE) {
  const id = String(assetId || '').toLowerCase();
  const n = Math.max(VALIDATION_RUN_QUICKPICK_COUNT, Math.min(Number(totalRuns) || VALIDATION_RUN_SEARCH_POOL_SIZE, 500));
  const runs = [];
  for (let offset = 0; offset < n; offset++) {
    const jobRunId = validationJobRunId(id, offset);
    const finishedMs = validationRunFinishedAtMs(offset);
    const stamp = formatValidationRunTimestamp(finishedMs);
    const label =
      offset === 0 ? `Latest · ${stamp} · ${jobRunId}` : `${stamp} · ${jobRunId}`;
    const searchBlob = `${jobRunId} ${stamp} ${offset}`.toLowerCase();
    runs.push({
      offset,
      jobRunId,
      finishedMs,
      stamp,
      label,
      searchBlob,
    });
  }
  return runs;
}

/** Filter catalog for typed “search older runs” (whole pool, including overlaps with quick pick). */
export function filterValidationRunCatalog(runs, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return [];
  return (runs || []).filter((r) => r.searchBlob.includes(q));
}

export function summarizeValidationRuleCards(cards) {
  const rollup = { pass: 0, warn: 0, fail: 0, pending: 0 };
  for (const c of cards || []) {
    const k = c?.status;
    if (rollup[k] === undefined) continue;
    rollup[k] += 1;
  }
  return rollup;
}
