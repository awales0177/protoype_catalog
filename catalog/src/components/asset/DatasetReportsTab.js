import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './DatasetReportsTab.css';

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Map filename to thumbnail style + short label (PDF, JSON, …). */
function fileKindFromName(name) {
  const m = String(name || '').toLowerCase().match(/\.([^.]+)$/);
  const ext = m ? m[1] : '';
  const table = {
    pdf: { key: 'pdf', label: 'PDF' },
    json: { key: 'json', label: 'JSON' },
    csv: { key: 'csv', label: 'CSV' },
    tsv: { key: 'csv', label: 'TSV' },
    xlsx: { key: 'sheet', label: 'XLSX' },
    xls: { key: 'sheet', label: 'XLS' },
    txt: { key: 'text', label: 'TXT' },
    md: { key: 'text', label: 'MD' },
    png: { key: 'image', label: 'PNG' },
    jpg: { key: 'image', label: 'JPG' },
    jpeg: { key: 'image', label: 'JPEG' },
    webp: { key: 'image', label: 'WEBP' },
    gif: { key: 'image', label: 'GIF' },
    html: { key: 'html', label: 'HTML' },
    htm: { key: 'html', label: 'HTM' },
  };
  if (table[ext]) return table[ext];
  if (ext)
    return { key: 'generic', label: ext.length <= 4 ? ext.toUpperCase() : `${ext.slice(0, 3).toUpperCase()}…` };
  return { key: 'generic', label: 'FILE' };
}

function DatasetReportFileThumb({ kind }) {
  return (
    <span className={`datasetReportsFileThumb datasetReportsFileThumb--${kind.key}`} aria-hidden>
      <span className="datasetReportsFileThumbLabel">{kind.label}</span>
    </span>
  );
}

DatasetReportFileThumb.propTypes = {
  kind: PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired }).isRequired,
};

/** Dataset-only tab: lineage-quality datasets can attach QA / profiling reports (prototype uploads stay in-session). */
function DatasetReportsTab({ assetId, asset }) {
  const [reports, setReports] = useState([]);
  const inputRef = useRef(null);

  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  useEffect(() => {
    setReports((prev) => {
      prev.forEach((r) => {
        if (r.downloadUrl) URL.revokeObjectURL(r.downloadUrl);
      });
      return [];
    });
  }, [assetId]);

  useEffect(() => {
    return () => {
      reportsRef.current.forEach((r) => {
        if (r.downloadUrl) URL.revokeObjectURL(r.downloadUrl);
      });
    };
  }, []);

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0) return;

    const now = new Date().toISOString();
    const next = files.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      return {
        id,
        name: file.name,
        size: file.size,
        uploadedAt: now,
        downloadUrl: URL.createObjectURL(file),
      };
    });

    setReports((prev) => [...next, ...prev]);
  }, []);

  const removeReport = useCallback((id) => {
    setReports((prev) => {
      const row = prev.find((r) => r.id === id);
      if (row?.downloadUrl) URL.revokeObjectURL(row.downloadUrl);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const displayName = asset?.name || assetId;

  return (
    <div className="datasetReportsTab assetSection lineageValidationTabPanel">
      <h3 className="assetSectionTitle">Reports</h3>
      <p className="assetSectionDesc">
        Upload profiling, quality, reconciliation, or ad-hoc analysis documents for <strong>{displayName}</strong>. In this
        prototype, files stay in your browser session only—they are not sent to a server.
      </p>

      <div className="datasetReportsUpload" onDragOver={onDragOver} onDrop={onDrop}>
        <input
          ref={inputRef}
          type="file"
          className="datasetReportsUploadInput"
          multiple
          accept=".pdf,.csv,.tsv,.xlsx,.xls,.json,.txt,.md,.png,.jpg,.jpeg,.html"
          aria-label="Upload report files"
          onChange={onInputChange}
        />
        <p className="datasetReportsUploadTitle">Drop files here or choose files</p>
        <p className="datasetReportsUploadHint">PDF, spreadsheets, JSON, images, markdown, HTML</p>
        <button type="button" className="datasetReportsUploadBtn" onClick={() => inputRef.current?.click()}>
          Choose files
        </button>
      </div>

      {reports.length === 0 ? (
        <p className="assetFieldValue datasetReportsEmpty">No reports uploaded yet.</p>
      ) : (
        <ul className="datasetReportsList" aria-label="Uploaded reports">
          {reports.map((r) => {
            const kind = fileKindFromName(r.name);
            return (
              <li key={r.id} className="datasetReportsRow">
                <a className="datasetReportsFileCard" href={r.downloadUrl} download={r.name} title={`Download ${r.name}`}>
                  <DatasetReportFileThumb kind={kind} />
                  <div className="datasetReportsFileDetails">
                    <span className="datasetReportsFileName">{r.name}</span>
                    <span className="datasetReportsMeta">
                      {fmtBytes(r.size)} · {new Date(r.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                </a>
                <button type="button" className="datasetReportsRemove" onClick={() => removeReport(r.id)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

DatasetReportsTab.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object,
};

DatasetReportsTab.defaultProps = {
  asset: null,
};

export default DatasetReportsTab;
