import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, RssFeedIcon, SendPlaneIcon, PrintIcon, FloppySaveIcon } from '../../icons';
import { home, search, profileExperience } from '../../routes';
import { EcosystemAppsMenu, CatalogHeroActionsMenu, CatalogGlobalBarTray } from '../../catalog-shell';
import '../search/SearchResultsHeroBar.css';
import PropTypes from 'prop-types';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

const BRAND = publicAssetUrl('a_logo.png');

const JUMP_LINKS = [
  { to: profileExperience({ tab: 'settings' }), label: 'Update Preferences' },
  { to: profileExperience({ tab: 'subscriptions' }), label: 'Manage Subscriptions' },
  { to: profileExperience({ tab: 'transfers' }), label: 'Track My Transfers' },
  { to: profileExperience({ tab: 'other' }), label: 'Other Profile Option' },
];

function ProfileExperienceChrome({ pageTitle = 'My Profile' }) {
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

      <div className="searchResultsSubBar">
        <div className="searchResultsSubBarLeft">
          <Link to={home()} className="searchResultsSubLogoLink" aria-label="Catalog home">
            <img src={BRAND} alt="" className="searchResultsSubLogo" />
          </Link>
          <span className="searchResultsJump">
            <span className="searchResultsJumpLabel">Jump to:</span>{' '}
            {JUMP_LINKS.map((l, i) => (
              <span key={l.to}>
                {i > 0 && ' · '}
                <Link to={l.to}>{l.label}</Link>
              </span>
            ))}
          </span>
        </div>
        <div className="searchResultsSubBarTools">
          <button type="button" className="searchResultsToolBtn" aria-label="RSS feed">
            <RssFeedIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Share">
            <SendPlaneIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Print">
            <PrintIcon />
          </button>
          <button type="button" className="searchResultsToolBtn" aria-label="Save">
            <FloppySaveIcon />
          </button>
        </div>
      </div>

      <span className="assetRecordChromeSrOnly">{pageTitle}</span>
    </div>
  );
}

ProfileExperienceChrome.propTypes = {
  pageTitle: PropTypes.string,
};

export default ProfileExperienceChrome;
