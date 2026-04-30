import PropTypes from 'prop-types';
import { Modal } from '../ui';
import { SEARCH_RECORD_TYPE_GROUPS } from '../../data/sample_data';
import { getTypeLabel, getTypeLabelClass } from '../../utils/assetRelationships';
import './SearchRecordTypesModal.css';

const TITLE_ID = 'search-record-types-modal-title';

function SearchRecordTypesModal({ onClose }) {
  return (
    <Modal
      onClose={onClose}
      titleId={TITLE_ID}
      title="Record types in search"
      subtitle="Types you may see on cards and in filters. Names match the catalog type field."
      size="lg"
      bodyClassName="searchRecordTypesModalBody"
    >
      <div className="searchRecordTypesModalGroups">
        {SEARCH_RECORD_TYPE_GROUPS.map((group) => (
          <section key={group.title} className="searchRecordTypesModalGroup">
            <h3 className="searchRecordTypesModalGroupTitle">{group.title}</h3>
            <ul className="searchRecordTypesModalList">
              {group.items.map((item) => {
                const shortLabel = getTypeLabel(item.name);
                const typeClass = getTypeLabelClass(item.name);
                return (
                  <li key={item.name} className="searchRecordTypesModalItem">
                    <div className="searchRecordTypesModalItemHeader">
                      {shortLabel ? (
                        <span className={`searchResultLabel ${typeClass}`}>{shortLabel}</span>
                      ) : null}
                      <span className="searchRecordTypesModalName">{item.name}</span>
                    </div>
                    <span className="searchRecordTypesModalDesc">{item.description}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="searchRecordTypesModalGroup searchRecordTypesModalGroup--status">
          <h3 className="searchRecordTypesModalGroupTitle">Status badges</h3>
          <p className="searchRecordTypesModalStatusIntro">
            Result rows and cards may show one of these next to the type chip:
          </p>
          <ul className="searchRecordTypesModalStatusList">
            <li className="searchRecordTypesModalStatusItem">
              <span className="searchResultStatusBadge feed">Feed</span>
              <span className="searchRecordTypesModalDesc">Data is ingested or updated as a continuous feed.</span>
            </li>
            <li className="searchRecordTypesModalStatusItem">
              <span className="searchResultStatusBadge single">Single</span>
              <span className="searchRecordTypesModalDesc">Snapshot or batch-style asset, not a feed.</span>
            </li>
            <li className="searchRecordTypesModalStatusItem">
              <span className="searchResultStatusBadge stale">Stale</span>
              <span className="searchRecordTypesModalDesc">Flagged as outdated or needing refresh.</span>
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}

SearchRecordTypesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SearchRecordTypesModal;
