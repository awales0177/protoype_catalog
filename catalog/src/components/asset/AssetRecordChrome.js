import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../../icons';
import { search } from '../../routes';
import { EcosystemAppsMenu, CatalogHeroActionsMenu, CatalogGlobalBarTray } from '../../catalog-shell';
import '../search/SearchResultsHeroBar.css';
import PropTypes from 'prop-types';

export const ASSET_RECORD_JUMP_LINKS = [
  { href: '#asset-record-details', label: 'Details' },
  { href: '#asset-record-lineage', label: 'Lineage' },
  { href: '#asset-record-production', label: 'Production' },
  { href: '#asset-record-comments', label: 'Comments' },
];

function AssetRecordChrome({ assetName }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    navigate(trimmed ? search({ q: trimmed }) : search());
  };

  return (
    <div className="assetRecordChrome searchResultsStack">
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
            <button type="button" className="searchResultsGlobalSearchClear" onClick={() => setInputValue('')} aria-label="Clear search">
              ×
            </button>
          ) : null}
        </form>
        <CatalogGlobalBarTray className="searchResultsGlobalTray" />
      </div>

      <span className="assetRecordChromeSrOnly">{assetName}</span>
    </div>
  );
}

AssetRecordChrome.propTypes = {
  assetName: PropTypes.string.isRequired,
};

export default AssetRecordChrome;
