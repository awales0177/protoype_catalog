import { useMemo, useState, useEffect, Fragment, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronDownIcon,
  SearchIcon,
  FolderIcon,
  FileIcon,
  RefreshIcon,
  DownloadTrayIcon,
  MoreVertIcon,
  CopyIcon,
  FolderPlusIcon,
  TrashFileIcon,
  UploadFileIcon,
} from '../../icons';
import { buildDataTrackerFileRows, getDataTrackerStorageContext } from '../../data/dataTrackerFiles';
import './ProductDataLineage.css';

function PizzaTrackerLockGlyph() {
  return (
    <svg
      className="pizzaTrackerGlyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** Active step — crossed strokes (game-style “swords” shorthand) */
function PizzaTrackerCurrentGlyph() {
  return (
    <svg
      className="pizzaTrackerGlyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

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
                  {status === 'current' && <PizzaTrackerCurrentGlyph />}
                  {status === 'pending' && <PizzaTrackerLockGlyph />}
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
  const storage = useMemo(() => getDataTrackerStorageContext(asset?.name), [asset?.name]);

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [sortNameAsc, setSortNameAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsWrapRef = useRef(null);
  const headerCheckboxRef = useRef(null);

  useEffect(() => {
    setSearch('');
    setExpandedId(null);
    setSelectedIds(new Set());
    setActionsOpen(false);
  }, [assetId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = !q
      ? rows
      : rows.filter(
          (r) =>
            (r.displayName && r.displayName.toLowerCase().includes(q)) ||
            r.label.toLowerCase().includes(q) ||
            (r.system && r.system.toLowerCase().includes(q)) ||
            r.id.toLowerCase().includes(q) ||
            (r.lineage || []).some(
              (s) =>
                s.stage.toLowerCase().includes(q) ||
                s.detail.toLowerCase().includes(q) ||
                (s.uri && s.uri.toLowerCase().includes(q)),
            ),
        );

    const sorted = [...list].sort((a, b) => {
      const cmp = (a.displayName || a.label).localeCompare(b.displayName || b.label, undefined, {
        sensitivity: 'base',
      });
      return sortNameAsc ? cmp : -cmp;
    });
    return sorted;
  }, [rows, search, sortNameAsc]);

  useEffect(() => {
    if (expandedId && !filtered.some((r) => r.id === expandedId)) {
      setExpandedId(null);
    }
  }, [filtered, expandedId]);

  useEffect(() => {
    if (!actionsOpen) return;
    const onDoc = (e) => {
      if (actionsWrapRef.current && !actionsWrapRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [actionsOpen]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedIds.size > 0 && !allFilteredSelected && filtered.some((r) => selectedIds.has(r.id));
    }
  }, [selectedIds, allFilteredSelected, filtered]);

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  }, [allFilteredSelected, filtered]);

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="assetSection dataTrackerFilesPanel storageBrowser">
      <h3 className="assetSectionTitle">Data tracker</h3>
      <p className="assetSectionDesc">
        Demo storage paths and files for this asset. Search the list, select rows, or expand a file to see its pipeline
        stages and lineage checks.
      </p>

      <nav className="storageBrowserBreadcrumbs" aria-label="Folder path">
        {storage.breadcrumbs.map((crumb, i) => (
          <Fragment key={crumb.id}>
            {i > 0 && <span className="storageBrowserBreadcrumbSep" aria-hidden>/</span>}
            <span className={i === storage.breadcrumbs.length - 1 ? 'storageBrowserBreadcrumbCurrent' : ''}>
              {crumb.label}
            </span>
          </Fragment>
        ))}
      </nav>

      <div className="storageBrowserControlRow">
        <div className="storageBrowserSearchWrap">
          <input
            id={`data-tracker-search-${assetId}`}
            type="search"
            className="storageBrowserSearchInput"
            placeholder="Search files"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            aria-label="Search files"
          />
          <button type="button" className="storageBrowserSearchBtn" aria-label="Search" title="Search">
            <SearchIcon />
          </button>
        </div>

        <div className="storageBrowserToolbarEnd" ref={actionsWrapRef}>
          <div className="storageBrowserPagination" aria-label="Pagination">
            <button type="button" className="storageBrowserIconBtn" aria-label="Previous page" disabled>
              &lt;
            </button>
            <span className="storageBrowserPaginationPage">1</span>
            <button type="button" className="storageBrowserIconBtn" aria-label="Next page" disabled>
              &gt;
            </button>
          </div>
          <button
            type="button"
            className="storageBrowserIconBtn"
            aria-label="Refresh"
            title="Refresh"
            onClick={() => setSearch((s) => s)}
          >
            <RefreshIcon />
          </button>
          <div className="storageBrowserMenuWrap">
            <button
              type="button"
              className="storageBrowserIconBtn"
              aria-label="Open actions menu"
              aria-expanded={actionsOpen}
              aria-haspopup="true"
              onClick={() => setActionsOpen((o) => !o)}
            >
              <MoreVertIcon />
            </button>
            {actionsOpen && (
              <div className="storageBrowserActionsMenu" role="menu">
                <button type="button" className="storageBrowserActionsMenuItem" role="menuitem">
                  <CopyIcon />
                  <span>Copy Files</span>
                </button>
                <button type="button" className="storageBrowserActionsMenuItem" role="menuitem">
                  <FolderPlusIcon />
                  <span>Create Folder</span>
                </button>
                <button type="button" className="storageBrowserActionsMenuItem" role="menuitem">
                  <TrashFileIcon />
                  <span>Delete Files</span>
                </button>
                <button type="button" className="storageBrowserActionsMenuItem" role="menuitem">
                  <UploadFileIcon />
                  <span>Upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="assetFieldValue lineageFileTableEmpty">No files match your search.</p>
      ) : (
        <div className="storageBrowserTableShell">
          <table className="storageBrowserTable">
            <thead>
              <tr>
                <th className="storageBrowserTh storageBrowserTh--check" scope="col">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    className="storageBrowserRowCheck"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
                <th className="storageBrowserTh storageBrowserTh--expand" scope="col">
                  <span className="lineageFileTableSrOnly">Expand details</span>
                </th>
                <th className="storageBrowserTh storageBrowserTh--name" scope="col">
                  <button
                    type="button"
                    className="storageBrowserSortBtn"
                    onClick={() => setSortNameAsc((v) => !v)}
                  >
                    Name
                    <span className="storageBrowserSortIcon" aria-hidden>
                      {sortNameAsc ? '↑' : '↓'}
                    </span>
                  </button>
                </th>
                <th scope="col" className="storageBrowserTh">
                  Type
                </th>
                <th scope="col" className="storageBrowserTh">
                  Last modified
                </th>
                <th scope="col" className="storageBrowserTh">
                  Size
                </th>
                <th scope="col" className="storageBrowserTh storageBrowserTh--actions">
                  <span className="lineageFileTableSrOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const isOpen = expandedId === f.id;
                const panelId = `data-tracker-stages-${assetId}-${f.id}`;
                const hasLineage = f.lineage && f.lineage.length > 0;
                const isFolder = f.kind === 'folder' || f.kind === 'hidden';
                return (
                  <Fragment key={f.id}>
                    <tr className={`storageBrowserRow ${isOpen ? 'storageBrowserRow--open' : ''}`}>
                      <td className="storageBrowserTd storageBrowserTd--check">
                        <input
                          type="checkbox"
                          className="storageBrowserRowCheck"
                          checked={selectedIds.has(f.id)}
                          onChange={() => toggleRowSelected(f.id)}
                          aria-label={`Select ${f.displayName}`}
                        />
                      </td>
                      <td className="storageBrowserTd storageBrowserTd--expand">
                        <button
                          type="button"
                          className={`lineageFileTableExpandBtn storageBrowserExpandBtn ${isOpen ? 'lineageFileTableExpandBtn--open' : ''}`}
                          aria-expanded={isOpen}
                          aria-controls={hasLineage ? panelId : undefined}
                          id={`${panelId}-trigger`}
                          disabled={!hasLineage}
                          onClick={() => hasLineage && setExpandedId((cur) => (cur === f.id ? null : f.id))}
                        >
                          <span className="lineageFileTableExpandBtnIcon" aria-hidden>
                            <ChevronDownIcon />
                          </span>
                          <span className="lineageFileTableSrOnly">
                            {hasLineage ? `${isOpen ? 'Collapse' : 'Expand'} stages for ${f.displayName}` : 'No stages'}
                          </span>
                        </button>
                      </td>
                      <td className="storageBrowserTd storageBrowserTd--name">
                        <button type="button" className="storageBrowserNameLink" title={f.label}>
                          <span className="storageBrowserNameIcon" aria-hidden>
                            {isFolder ? <FolderIcon /> : <FileIcon />}
                          </span>
                          <span>{f.displayName}</span>
                        </button>
                      </td>
                      <td className="storageBrowserTd">{f.typeLabel}</td>
                      <td className="storageBrowserTd storageBrowserTd--muted">{f.lastModifiedLabel}</td>
                      <td className="storageBrowserTd storageBrowserTd--muted">{f.sizeLabel}</td>
                      <td className="storageBrowserTd storageBrowserTd--actions">
                        {!isFolder ? (
                          <button
                            type="button"
                            className="storageBrowserDownloadBtn"
                            aria-label={`Download ${f.displayName}`}
                            title="Download"
                            onClick={() => {}}
                          >
                            <DownloadTrayIcon />
                          </button>
                        ) : (
                          <span className="storageBrowserTdPad">—</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && hasLineage && (
                      <tr className="storageBrowserDetailRow">
                        <td className="storageBrowserDetailCell" colSpan={7}>
                          <div
                            className="lineageFileTableProgressPanel"
                            id={panelId}
                            role="region"
                            aria-labelledby={`${panelId}-heading`}
                          >
                            <span className="lineageFileTableProgressLabel" id={`${panelId}-heading`}>
                              Stages — hover a step for checks and URI · current:{' '}
                              <strong>{getFileLineageCurrentStageLabel(f.lineage)}</strong>
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
