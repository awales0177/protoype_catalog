import { Link } from 'react-router-dom';
import { home } from '../../routes';
import { SearchIcon, RssFeedIcon, SendPlaneIcon, PrintIcon, FloppySaveIcon } from '../../icons';
import { EcosystemAppsMenu, CatalogHeroActionsMenu, CatalogGlobalBarTray } from '../../catalog-shell';
import './SearchResultsHeroBar.css';
import PropTypes from 'prop-types';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

const BRAND = publicAssetUrl('a_logo.png');

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

      <div className="searchResultsSubBar">
        <div className="searchResultsSubBarLeft">
          <Link to={home()} className="searchResultsSubLogoLink" aria-label="Catalog home">
            <img src={BRAND} alt="" className="searchResultsSubLogo" />
          </Link>
          <span className="searchResultsJump">
            <span className="searchResultsJumpLabel">Jump to:</span>{' '}
            <a href="#search-results-end">Bottom of page</a>
          </span>
        </div>
        <div className="searchResultsSubBarTools">
          <button type="button" className="searchResultsToolBtn" aria-label="RSS feed" title="RSS feed">
            <RssFeedIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Share" title="Share">
            <SendPlaneIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Print" title="Print">
            <PrintIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Save" title="Save">
            <FloppySaveIcon />
          </button>
        </div>
      </div>

      <div className="searchResultsTitleBandOuter">
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
