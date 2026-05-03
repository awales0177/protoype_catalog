import PropTypes from 'prop-types';
import { ASSET_OVERVIEW_DEFAULTS } from '../../data/sample_data';

function ProhibitedGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" strokeLinecap="round" />
    </svg>
  );
}

const USJA_LETTERS = ['U', 'S', 'J'];

function AssetRecordTitleCard({ assetName, categoryLabel, assetId, onRequestAccess, usjaActiveIndices }) {
  const fmt = (s) => {
    if (!s) return '—';
    const t = String(s).trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t)) return t;
    const tryDate = new Date(t);
    if (!Number.isNaN(tryDate.getTime())) {
      const m = String(tryDate.getMonth() + 1).padStart(2, '0');
      const d = String(tryDate.getDate()).padStart(2, '0');
      const y = tryDate.getFullYear();
      return `${m}/${d}/${y}`;
    }
    return t;
  };

  const updated = fmt(ASSET_OVERVIEW_DEFAULTS.lastUpdated);

  return (
    <div className="assetRecordTitleCard">
           <div className="assetRecordTitleCardMain">
        <h1 className="assetRecordTitle">{assetName}</h1>
        <p className="assetRecordCategoryBlurb">
          <span className="assetRecordCategoryBlurbLabel">Category</span>{' '}
          <span className="assetRecordCategoryBlurbText">
            {categoryLabel} — High-level placement, stewards, and consumption patterns for this catalog record.
          </span>
        </p>
        <div className="assetRecordMetaRow">
          <div className="assetRecordMetaItem">
            <span className="assetRecordMetaKey">Category</span>
            <span className="assetRecordMetaVal">{categoryLabel}</span>
          </div>
          <div className="assetRecordMetaItem">
            <span className="assetRecordMetaKey">Created Date</span>
            <span className="assetRecordMetaVal">01/15/2024</span>
          </div>
          <div className="assetRecordMetaItem">
            <span className="assetRecordMetaKey">Last Updated</span>
            <span className="assetRecordMetaVal">{updated}</span>
          </div>
          <div className="assetRecordMetaItem">
            <span className="assetRecordMetaKey">First Available</span>
            <span className="assetRecordMetaVal">02/01/2024</span>
          </div>
          <div className="assetRecordMetaItem">
            <span className="assetRecordMetaKey">Identifier</span>
            <span className="assetRecordMetaVal assetRecordMetaVal--mono">{assetId}</span>
          </div>
        </div>
      </div>
      <div className="assetRecordTitleCardActions">
        <div className="assetRecordUSJA" aria-hidden="true">
          {USJA_LETTERS.map((letter, idx) => (
            <span
              key={letter}
              className={`assetRecordUSJABox ${usjaActiveIndices.includes(idx) ? 'assetRecordUSJABox--active' : ''}`}
            >
              {letter}
            </span>
          ))}
        </div>
        <button type="button" className="assetRecordRequestAccess" onClick={onRequestAccess}>
          <ProhibitedGlyph />
          Request Access
        </button>
      </div>
    </div>
  );
}

AssetRecordTitleCard.propTypes = {
  assetName: PropTypes.string.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  assetId: PropTypes.string.isRequired,
  onRequestAccess: PropTypes.func,
  usjaActiveIndices: PropTypes.arrayOf(PropTypes.number),
};

AssetRecordTitleCard.defaultProps = {
  onRequestAccess: undefined,
  usjaActiveIndices: [],
};

export default AssetRecordTitleCard;
