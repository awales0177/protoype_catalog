import { useState } from 'react';
import { RecordTypesInfoIcon } from '../../icons';
import PropTypes from 'prop-types';
import SearchRecordTypesModal from './SearchRecordTypesModal';

function SearchResultsMainToolbar({ displayCount, pageSize, setPageSize, onPageSizeChange }) {
  const [recordTypesOpen, setRecordTypesOpen] = useState(false);

  return (
    <div className="searchRefMainToolbar">
      <span className="searchRefResultsCount">{displayCount.toLocaleString()} Results</span>
      <div className="searchRefToolbarRight">
        <label className="searchRefPerPage">
          <span className="searchRefPerPageLabel">Records per page</span>
          <select
            className="searchRefPerPageSelect"
            value={pageSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              setPageSize(n);
              onPageSizeChange?.();
            }}
            aria-label="Records per page"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="searchRefRecordTypesInfoBtn"
          onClick={() => setRecordTypesOpen(true)}
          aria-label="About record types and status badges"
          title="Record types & badges"
        >
          <RecordTypesInfoIcon />
        </button>
      </div>
      {recordTypesOpen ? <SearchRecordTypesModal onClose={() => setRecordTypesOpen(false)} /> : null}
    </div>
  );
}

SearchResultsMainToolbar.propTypes = {
  displayCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
};

SearchResultsMainToolbar.defaultProps = {
  onPageSizeChange: undefined,
};

export default SearchResultsMainToolbar;
