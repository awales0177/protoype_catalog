import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  getGraphValidationRollup,
  getLineageValidationRuleCards,
} from '../../utils/productLineageGraph';
import {
  VALIDATION_RUN_QUICKPICK_COUNT,
  VALIDATION_RUN_SEARCH_POOL_SIZE,
  filterValidationRunCatalog,
  getValidationJobRunCatalog,
  summarizeValidationRuleCards,
} from '../../utils/lineageValidationRuns';
import './ProductDataLineage.css';

function lineageStatusLabel(status) {
  switch (status) {
    case 'pass':
      return 'Pass';
    case 'fail':
      return 'Fail';
    case 'warn':
      return 'Warning';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

const TIER_DOT_LABEL = {
  bronze: 'Bronze layer rule',
  silver: 'Silver layer rule',
  gold: 'Gold layer rule',
};

function LakeTierDot({ tier: tierRaw = 'silver' }) {
  const tier = ['bronze', 'silver', 'gold'].includes(tierRaw) ? tierRaw : 'silver';
  return (
    <span
      className={`productValidationLakeTierDot productValidationLakeTierDot--${tier}`}
      role="img"
      aria-label={TIER_DOT_LABEL[tier]}
      title={TIER_DOT_LABEL[tier]}
    />
  );
}

LakeTierDot.propTypes = {
  tier: PropTypes.oneOf(['bronze', 'silver', 'gold']),
};

function ValidationRuleExpandChevron() {
  return (
    <span className="productValidationRuleExpandChevron" aria-hidden>
      <svg width={14} height={14} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 3l5 4-5 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Full-width validation summary + validation-job run picker + rule cards per session. */
function LineageValidationPanel({ assetId, asset, assetsById, variant = 'product' }) {
  const isDatasetVariant = variant === 'dataset';

  const [validationSessionOffset, setValidationSessionOffset] = useState(0);
  const [runSearchQuery, setRunSearchQuery] = useState('');
  const searchWrapRef = useRef(null);

  useEffect(() => {
    setValidationSessionOffset(0);
    setRunSearchQuery('');
  }, [assetId]);

  useEffect(() => {
    function onDocMouseDown(ev) {
      if (!runSearchQuery.trim()) return;
      const el = searchWrapRef.current;
      if (el && !el.contains(ev.target)) {
        setRunSearchQuery('');
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [runSearchQuery]);

  const lineageRoll = useMemo(() => getGraphValidationRollup(assetId, assetsById), [assetId, assetsById]);
  const hasChecks = lineageRoll.checkCount > 0;

  const runCatalog = useMemo(
    () => getValidationJobRunCatalog(assetId, VALIDATION_RUN_SEARCH_POOL_SIZE),
    [assetId]
  );

  const quickRuns = runCatalog.slice(0, VALIDATION_RUN_QUICKPICK_COUNT);

  const displayCards = useMemo(
    () => getLineageValidationRuleCards(assetId, assetsById, validationSessionOffset),
    [assetId, assetsById, validationSessionOffset]
  );

  const sessionRoll = useMemo(() => summarizeValidationRuleCards(displayCards), [displayCards]);

  const selectedRunMeta = runCatalog.find((r) => r.offset === validationSessionOffset) ?? runCatalog[0];

  const searchMatches = useMemo(() => filterValidationRunCatalog(runCatalog, runSearchQuery).slice(0, 48), [
    runCatalog,
    runSearchQuery,
  ]);

  return (
    <div className="assetSection lineageValidationTabPanel">
      <h3 className="assetSectionTitle">Validation</h3>
      <p className="assetSectionDesc">
        {isDatasetVariant
          ? 'Lineage validation checks for this dataset: rolled up across Data P&L steps and catalog assets referenced in the graph.'
          : 'Lineage validation checks for this data product: rolled up across Data P&L steps and catalog assets referenced in the graph.'}
      </p>

      {hasChecks && (
        <>
          <div className="productValidationSummary lineageValidationRunSelector" role="region" aria-label="Validation job runs">
            <div className="lineageValidationRunToolbar">
              <div className="lineageValidationRunField">
                <label className="lineageValidationRunFieldLabel" htmlFor="validation-run-quickpick">
                  Validation job (last {VALIDATION_RUN_QUICKPICK_COUNT})
                </label>
                <select
                  id="validation-run-quickpick"
                  className="lineageValidationRunSelect"
                  value={String(validationSessionOffset)}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setValidationSessionOffset(Number.isNaN(next) ? 0 : next);
                    setRunSearchQuery('');
                  }}
                >
                  {quickRuns.map((r) => (
                    <option key={r.offset} value={String(r.offset)}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lineageValidationRunField lineageValidationRunField--grow" ref={searchWrapRef}>
                <label className="lineageValidationRunFieldLabel" htmlFor="validation-run-search">
                  Search older runs ({VALIDATION_RUN_SEARCH_POOL_SIZE}-run history)
                </label>
                <input
                  id="validation-run-search"
                  type="search"
                  className="lineageValidationRunSearchInput"
                  value={runSearchQuery}
                  onChange={(e) => setRunSearchQuery(e.target.value)}
                  placeholder="Run id, date snippet, offset…"
                  autoComplete="off"
                />
                {runSearchQuery.trim() && (
                  <>
                    <p className="lineageValidationRunSearchHint" role="status">
                      Matches from the searchable pool (pick a row to switch job).
                    </p>
                    {searchMatches.length === 0 ? (
                      <p className="lineageValidationRunSearchEmpty">No runs match.</p>
                    ) : (
                      <ul className="lineageValidationRunResultList" aria-label="Run search hits">
                        {searchMatches.map((r) => (
                          <li key={r.offset}>
                            <button
                              type="button"
                              className={`lineageValidationRunResultBtn ${
                                r.offset === validationSessionOffset ? 'is-active' : ''
                              }`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setValidationSessionOffset(r.offset);
                                setRunSearchQuery('');
                              }}
                            >
                              <span className="lineageValidationRunResultLabel">{r.label}</span>
                              <code className="lineageValidationRunResultId">{r.jobRunId}</code>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

              <div className="lineageValidationRunCurrent" aria-live="polite">
                <span className="lineageValidationRunFieldLabel">Showing</span>
                <span className="lineageValidationRunCurrentChip">
                  <code>{selectedRunMeta?.jobRunId}</code>
                  <span className="lineageValidationRunCurrentSep">·</span>
                  <span>{selectedRunMeta?.stamp}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="productValidationSummary" role="region" aria-label="Validation summary for lineage graph">
            <div className="productValidationSummaryMain">
              <span className="productValidationSummaryTitle">Summary</span>
              <div className="productValidationPills">
                <span className="productValidationPill productValidationPill--pass">
                  <span className="productValidationPillValue">{sessionRoll.pass}</span> passed
                </span>
                <span className="productValidationPill productValidationPill--warn">
                  <span className="productValidationPillValue">{sessionRoll.warn}</span> warnings
                </span>
                <span className="productValidationPill productValidationPill--fail">
                  <span className="productValidationPillValue">{sessionRoll.fail}</span> failed
                </span>
                <span className="productValidationPill productValidationPill--pending">
                  <span className="productValidationPillValue">{sessionRoll.pending}</span> pending
                </span>
              </div>
            </div>
            <p className="productValidationRollup">
              <strong>{asset.name}</strong> — {lineageRoll.nodeCount} nodes in this lineage · {displayCards.length}{' '}
              checks — validation job{' '}
              <span className="productValidationRollupRunRef">
                <code>{selectedRunMeta?.jobRunId}</code>
              </span>
              {sessionRoll.fail > 0 && <span className="productValidationRollupAlert"> · {sessionRoll.fail} failed</span>}
              {sessionRoll.warn > 0 && (
                <span className="productValidationRollupAlert productValidationRollupAlert--warn">
                  {' '}
                  · {sessionRoll.warn} warning{sessionRoll.warn === 1 ? '' : 's'}
                </span>
              )}
              {sessionRoll.pending > 0 && (
                <span className="productValidationRollupPending"> · {sessionRoll.pending} pending</span>
              )}
              .
            </p>
            <p className="productValidationMeta">
              Covers Data P&amp;L steps (validate / write) and catalog assets in the lineage graph. See the{' '}
              <strong>Lineage</strong> tab for relationships, Data P&amp;L, data tracker, and schema views.
            </p>
          </div>

          <div className="lineageValidationRulesBlock" id="lineage-validation-details-tab">
            <ul className="productValidationRuleList">
              {displayCards.map((row) => (
                <li key={row.ruleKey}>
                  <details className="productValidationRuleCard">
                    <summary className="productValidationRuleCardSummary">
                      <ValidationRuleExpandChevron />
                      <div className="productValidationRuleCardHeader">
                        <div className="productValidationRuleHdrStack">
                          <LakeTierDot tier={row.lakeTier || 'silver'} />
                          <span className="productValidationRuleFieldLabel">Rule id</span>
                          <code className="productValidationRuleIdChip" title="Rule id">
                            {row.ruleId}
                          </code>
                        </div>
                        <span className={`productValidationRuleStatus productValidationRuleStatus--${row.status}`}>
                          {lineageStatusLabel(row.status)}
                        </span>
                      </div>
                    </summary>
                    <div className="productValidationRuleCardBody">
                      <div className="productValidationRuleFoot">
                        <div className="productValidationRuleFootMain">
                          {row.description ? (
                            <p className="productValidationRuleFootDesc">{row.description}</p>
                          ) : null}
                        </div>
                        <code
                          className="productValidationRuleIdChip productValidationRuleFootRun"
                          title="Run id"
                        >
                          {row.partitionRunCode}
                        </code>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!hasChecks && (
        <p className="assetFieldValue">No validation checks are defined for rules in this lineage graph.</p>
      )}
    </div>
  );
}

LineageValidationPanel.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  assetsById: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['product', 'dataset']),
};

export default LineageValidationPanel;
