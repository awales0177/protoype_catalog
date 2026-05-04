import { useState } from 'react';
import PropTypes from 'prop-types';
import { SearchIcon, FilterFunnelIcon, GlobeIcon, DatasetIcon, ListIcon } from '../../icons';

const FILTER_TABS = [
  { id: 'data-products', label: 'Products', Icon: GlobeIcon },
  { id: 'datasets', label: 'Datasets', Icon: DatasetIcon },
  { id: 'curated-lists', label: 'Curated lists', Icon: ListIcon },
];

function SearchResultsSidebar({
  q,
  inputValue,
  setInputValue,
  onSearchSubmit,
  onClearQuery,
  activeTab,
  onSelectFilterTab,
  filterOpen,
  toggleFilter,
  getDatasetFilter,
  getDataProductFilter,
  datasetFilterOptions,
  dataProductFilterOptions,
}) {
  const [andOr, setAndOr] = useState('and');
  const [prioritizeProfile, setPrioritizeProfile] = useState(false);
  const [sortMode, setSortMode] = useState('relevance');
  const [accordionOpen, setAccordionOpen] = useState({ 0: true, 1: false, 2: false, 3: false });

  const terms = q.trim() ? [q.trim()] : [];

  const toggleAcc = (i) => {
    setAccordionOpen((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <aside className="searchResultsSidebar searchResultsSidebar--ref">
      <form className="searchRefTextSearch" onSubmit={onSearchSubmit}>
        <div className="searchRefTextSearchRow">
          <input
            type="search"
            className="searchRefTextInput"
            placeholder="searched term"
            aria-label="Search terms"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="searchRefSearchCircle" aria-label="Search">
            <SearchIcon />
          </button>
          <div className="searchRefAndOr" role="group" aria-label="Match mode">
            <button
              type="button"
              className={`searchRefAndOrBtn ${andOr === 'and' ? 'active' : ''}`}
              onClick={() => setAndOr('and')}
            >
              AND
            </button>
            <button
              type="button"
              className={`searchRefAndOrBtn ${andOr === 'or' ? 'active' : ''}`}
              onClick={() => setAndOr('or')}
            >
              OR
            </button>
          </div>
        </div>
      </form>
      {terms.length > 0 && (
        <div className="searchRefChips">
          {terms.map((t) => (
            <span key={t} className="searchRefChip">
              {t}
              <button type="button" className="searchRefChipRemove" onClick={onClearQuery} aria-label={`Remove ${t}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <label className="searchRefCheck">
        <input type="checkbox" checked={prioritizeProfile} onChange={(e) => setPrioritizeProfile(e.target.checked)} />
        Prioritize based on my profile
      </label>

      <div className="searchRefSortPills" role="group" aria-label="Sort">
        <button
          type="button"
          className={`searchRefSortPill ${sortMode === 'relevance' ? 'active' : ''}`}
          onClick={() => setSortMode('relevance')}
        >
          Order by Relevance
        </button>
        <button
          type="button"
          className={`searchRefSortPill ${sortMode === 'newest' ? 'active' : ''}`}
          onClick={() => setSortMode('newest')}
        >
          Newest to Oldest
        </button>
      </div>

      <div className="searchRefFiltersHead">
        <h3 className="searchRefFiltersTitle">Filters</h3>
        <span className="searchRefFiltersFunnel" aria-hidden>
          <FilterFunnelIcon />
        </span>
      </div>

      <div className="searchRefFilterTabs" role="tablist" aria-label="Record type">
        {FILTER_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={`searchRefFilterTab ${activeTab === id ? 'active' : ''}`}
            onClick={() => onSelectFilterTab(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="searchRefAccordion">
          <button type="button" className="searchRefAccordionHead" onClick={() => toggleAcc(i)}>
            <span>Filter Category</span>
            <span className={`searchRefAccordionChev ${accordionOpen[i] ? 'open' : ''}`}>{'\u25be'}</span>
          </button>
          {accordionOpen[i] && (
            <div className="searchRefAccordionBody">
              {i === 0 ? (
                <>
                  <div className="searchFilterGroup">
                    <button type="button" className="searchFilterHeader" onClick={() => toggleFilter('dataset')}>
                      Dataset
                      <span className={`searchFilterChevron ${filterOpen.dataset ? 'open' : ''}`}>{'\u25be'}</span>
                    </button>
                    {filterOpen.dataset && (
                      <div className="searchFilterContent searchFilterTypeOptions">
                        {datasetFilterOptions.map(({ typeValue, label }) => {
                          const { isActive, onClick } = getDatasetFilter(typeValue);
                          return (
                            <button
                              key={typeValue}
                              type="button"
                              className={`searchFilterTypeBtn ${isActive ? 'active' : ''}`}
                              onClick={onClick}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="searchFilterGroup">
                    <button type="button" className="searchFilterHeader" onClick={() => toggleFilter('dataProduct')}>
                      Data Product
                      <span className={`searchFilterChevron ${filterOpen.dataProduct ? 'open' : ''}`}>{'\u25be'}</span>
                    </button>
                    {filterOpen.dataProduct && (
                      <div className="searchFilterContent searchFilterTypeOptions">
                        {dataProductFilterOptions.map(({ typeValue, label }) => {
                          const { isActive, onClick } = getDataProductFilter(typeValue);
                          return (
                            <button
                              key={typeValue}
                              type="button"
                              className={`searchFilterTypeBtn ${isActive ? 'active' : ''}`}
                              onClick={onClick}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="searchRefMiniPills">
                    {['Filter', 'Label', 'Filter', 'Label', 'Filter'].map((x, j) => (
                      <button key={j} type="button" className="searchRefMiniPill">
                        {x}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="searchRefAccordionPlaceholder">—</p>
              )}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}

SearchResultsSidebar.propTypes = {
  q: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onClearQuery: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  onSelectFilterTab: PropTypes.func.isRequired,
  filterOpen: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  getDatasetFilter: PropTypes.func.isRequired,
  getDataProductFilter: PropTypes.func.isRequired,
  datasetFilterOptions: PropTypes.arrayOf(PropTypes.shape({ typeValue: PropTypes.string, label: PropTypes.string }))
    .isRequired,
  dataProductFilterOptions: PropTypes.arrayOf(PropTypes.shape({ typeValue: PropTypes.string, label: PropTypes.string }))
    .isRequired,
};

export default SearchResultsSidebar;
