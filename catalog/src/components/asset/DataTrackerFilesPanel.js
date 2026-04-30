import { useMemo, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon } from '../../icons';
import { buildDataTrackerFileRows } from '../../data/dataTrackerFiles';
import './ProductDataLineage.css';

const ALL_SYSTEMS = '__all__';

function getLineageStageStatus(lineage, index) {
  const currentIdx = lineage.findIndex((s) => s.isCurrent);
  const idx = currentIdx >= 0 ? currentIdx : 0;
  if (index < idx) return 'done';
  if (index === idx) return 'current';
  return 'pending';
}

function getFileLineageCurrentStageLabel(lineage) {
  if (!lineage?.length) return '—';
  const flagged = lineage.find((s) => s.isCurrent);
  if (flagged) return flagged.stage;
  for (let i = 0; i < lineage.length; i++) {
    if (getLineageStageStatus(lineage, i) === 'current') return lineage[i].stage;
  }
  return lineage[lineage.length - 1]?.stage ?? '—';
}

function FileLineageStepTooltip({ step, tipId }) {
  return (
    <div className="lineageFileTrackerTip" id={tipId} role="tooltip">
      <div className="lineageFileTrackerTipTitle">{step.stage}</div>
      <p className="lineageFileTrackerTipDesc">{step.detail}</p>
      <code className="lineageFileTrackerTipUri">{step.uri}</code>
      {Array.isArray(step.checks) && step.checks.length > 0 && (
        <ul className="lineageFileTrackerTipChecks">
          {step.checks.map((c, j) => (
            <li key={j} className={`lineageFileTrackerTipCheck lineageFileTrackerTipCheck--${c.outcome}`}>
              <span className="lineageFileTrackerTipCheckLabel">{c.label}</span>
              {c.note ? <span className="lineageFileTrackerTipCheckNote">{c.note}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

FileLineageStepTooltip.propTypes = {
  step: PropTypes.shape({
    stage: PropTypes.string,
    detail: PropTypes.string,
    uri: PropTypes.string,
    checks: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        outcome: PropTypes.oneOf(['pass', 'warn', 'fail', 'pending']).isRequired,
        note: PropTypes.string,
      }),
    ),
  }).isRequired,
  tipId: PropTypes.string.isRequired,
};

function FileLineagePizzaTracker({ lineage, tipIdPrefix }) {
  return (
    <div className="pizzaTracker pizzaTracker--lineageFile" role="list" aria-label="Stages for this file">
      {lineage.map((step, i) => {
        const status = getLineageStageStatus(lineage, i);
        const prevDone = i > 0 && getLineageStageStatus(lineage, i - 1) === 'done';
        const tipId = `${tipIdPrefix}-lineage-tip-${i}`;
        return (
          <Fragment key={`${step.stage}-${i}`}>
            {i > 0 && (
              <span
                className={`pizzaTrackerConnector ${prevDone ? 'pizzaTrackerConnector--done' : ''}`}
                aria-hidden
              />
            )}
            <div className="lineageFileTrackerStepWrap" role="listitem">
              <button
                type="button"
                className={`lineageFileTrackerStep pizzaTrackerStep pizzaTrackerStep--${status}`}
                aria-describedby={tipId}
                aria-label={`${step.stage}: ${step.detail}`}
              >
                <span className="pizzaTrackerDot" aria-hidden>
                  {status === 'done' && <span className="pizzaTrackerCheck">✓</span>}
                </span>
                <span className="pizzaTrackerLabel">{step.stage}</span>
              </button>
              <FileLineageStepTooltip step={step} tipId={tipId} />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

FileLineagePizzaTracker.propTypes = {
  tipIdPrefix: PropTypes.string.isRequired,
  lineage: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string,
      detail: PropTypes.string,
      uri: PropTypes.string,
      isCurrent: PropTypes.bool,
      checks: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          outcome: PropTypes.oneOf(['pass', 'warn', 'fail', 'pending']).isRequired,
          note: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
};

export default function DataTrackerFilesPanel({ assetId, asset }) {
  const rows = useMemo(() => buildDataTrackerFileRows(asset?.name), [asset?.name]);
  const systems = useMemo(() => [...new Set(rows.map((r) => r.system))].sort((a, b) => a.localeCompare(b)), [rows]);

  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState(ALL_SYSTEMS);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setSearch('');
    setSystemFilter(ALL_SYSTEMS);
    setExpandedId(null);
  }, [assetId]);

  const filtered = useMemo(() => {
    let list = rows;
    if (systemFilter !== ALL_SYSTEMS) {
      list = list.filter((r) => r.system === systemFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.system.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.lineage.some(
          (s) =>
            s.stage.toLowerCase().includes(q) ||
            s.detail.toLowerCase().includes(q) ||
            (s.uri && s.uri.toLowerCase().includes(q)),
        ),
    );
  }, [rows, search, systemFilter]);

  useEffect(() => {
    if (expandedId && !filtered.some((r) => r.id === expandedId)) {
      setExpandedId(null);
    }
  }, [filtered, expandedId]);

  return (
    <div className="assetSection dataTrackerFilesPanel">
      <h3 className="assetSectionTitle">Data tracker</h3>
      <p className="assetSectionDesc">
        Files by system. Search or narrow by system, then expand a row to see pipeline stages.
      </p>

      <div className="dataTrackerToolbar">
        <input
          id={`data-tracker-search-${assetId}`}
          type="search"
          className="dataTrackerSearch"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          aria-label="Search files"
        />
        <select
          id={`data-tracker-system-${assetId}`}
          className="dataTrackerSystemSelect"
          aria-label="Filter by system"
          value={systemFilter}
          onChange={(e) => setSystemFilter(e.target.value)}
        >
          <option value={ALL_SYSTEMS}>All systems</option>
          {systems.map((sys) => (
            <option key={sys} value={sys}>
              {sys}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="assetFieldValue lineageFileTableEmpty">No files match your search or system filter.</p>
      ) : (
        <div className="lineageFileTableShell">
          <table className="lineageFileTable lineageFileTable--dataTracker">
            <thead>
              <tr>
                <th className="lineageFileTableColExpand" scope="col">
                  <span className="lineageFileTableSrOnly">Expand</span>
                </th>
                <th scope="col">Path</th>
                <th className="lineageFileTableColSystem" scope="col">
                  System
                </th>
                <th scope="col">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const isOpen = expandedId === f.id;
                const panelId = `data-tracker-stages-${assetId}-${f.id}`;
                return (
                  <Fragment key={f.id}>
                    <tr className={`lineageFileTableDataRow ${isOpen ? 'lineageFileTableDataRow--open' : ''}`}>
                      <td className="lineageFileTableColExpand">
                        <button
                          type="button"
                          className={`lineageFileTableExpandBtn ${isOpen ? 'lineageFileTableExpandBtn--open' : ''}`}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          id={`${panelId}-trigger`}
                          onClick={() => setExpandedId((cur) => (cur === f.id ? null : f.id))}
                        >
                          <span className="lineageFileTableExpandBtnIcon" aria-hidden>
                            <ChevronDownIcon />
                          </span>
                          <span className="lineageFileTableSrOnly">
                            {isOpen ? 'Collapse' : 'Expand'} stage tracker for {f.label}
                          </span>
                        </button>
                      </td>
                      <td className="lineageFileTableColPath">
                        <span className="dataTrackerPath">{f.label}</span>
                      </td>
                      <td className="lineageFileTableColSystem">
                        <span className="dataTrackerCell">{f.system}</span>
                      </td>
                      <td className="lineageFileTableColStage">
                        <span className="dataTrackerCell dataTrackerCell--muted">
                          {getFileLineageCurrentStageLabel(f.lineage)}
                        </span>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="lineageFileTableDetailRow">
                        <td className="lineageFileTableDetailCell" colSpan={4}>
                          <div
                            className="lineageFileTableProgressPanel"
                            id={panelId}
                            role="region"
                            aria-labelledby={`${panelId}-heading`}
                          >
                            <span className="lineageFileTableProgressLabel" id={`${panelId}-heading`}>
                              Stages — hover a step for checks and URI
                            </span>
                            <FileLineagePizzaTracker lineage={f.lineage} tipIdPrefix={`dt-${assetId}-${f.id}`} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

DataTrackerFilesPanel.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.shape({ name: PropTypes.string }).isRequired,
};
