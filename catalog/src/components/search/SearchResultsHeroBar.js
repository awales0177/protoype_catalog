import { SearchIcon } from '../../icons';
import {
  CatalogFloatingPageRail,
  EcosystemAppsMenu,
  CatalogHeroActionsMenu,
  CatalogGlobalBarTray,
} from '../../catalog-shell';
import './SearchResultsHeroBar.css';
import PropTypes from 'prop-types';

function SearchResultsHeroBar({ inputValue, setInputValue, onSubmit, onClear, searchQuery }) {
  const trimmed = (searchQuery || '').trim();
  const pageTitle = trimmed
    ? `${trimmed} or “${trimmed}” or ${trimmed} or ${trimmed}`
    : 'Keyword Search';

  return (
    <div className="searchResultsStack">
      <div className="searchResultsGlobalBar">
        <div className="searchResultsGlobalBarStart">
          <EcosystemAppsMenu />
          <CatalogHeroActionsMenu variant="globalBar" />
        </div>
        <form className="searchResultsGlobalSearch" onSubmit={onSubmit}>
          <button type="submit" className="searchResultsGlobalSearchIcon" aria-label="Search catalog">
            <SearchIcon />
          </button>
          <input
            type="search"
            className="searchResultsGlobalSearchInput"
            placeholder="Search"
            aria-label="Search catalog"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />
          {inputValue ? (
            <button type="button" className="searchResultsGlobalSearchClear" onClick={onClear} aria-label="Clear search">
              ×
            </button>
          ) : null}
        </form>
        <CatalogGlobalBarTray className="searchResultsGlobalTray" />
      </div>

      <div className="searchResultsTitleBandOuter">
        <CatalogFloatingPageRail
          jumpSlot={
            <span className="searchResultsJump">
              <span className="searchResultsJumpLabel">Jump to:</span>{' '}
              <a href="#search-results-end">Bottom of page</a>
            </span>
          }
        />
        <div className="searchResultsTitleBand">
          <h1 className="searchResultsPageTitle">{pageTitle}</h1>
        </div>
      </div>
    </div>
  );
}

SearchResultsHeroBar.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
};

SearchResultsHeroBar.defaultProps = {
  searchQuery: '',
};

export default SearchResultsHeroBar;
