import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  CatalogGlobalBarTray,
  CatalogHeroActionsMenu,
  CatalogHeroSearch,
  CatalogHeroSearchRegion,
  CatalogHeroToolbar,
  EcosystemAppsMenu,
  useCatalogShell,
} from '../../catalog-shell';
import { home } from '../../routes';
import { publicAssetUrl } from '../../utils/publicAssetUrl';
import '../search/SearchResultsHeroBar.css';

const HOME_BRAND_LOGO = publicAssetUrl('a_logo.png');

/** One chrome row: start controls | banner (center) | tray; below that logo + search. */
function HomeHeroChrome({ inputValue, setInputValue, onSubmit }) {
  const shell = useCatalogShell();
  const banner = shell?.heroBannerText;

  return (
    <div className="searchResultsStack homeHeroStack">
      <div className="searchResultsGlobalBar homeHeroGlobalBar">
        <div className="searchResultsGlobalBarStart">
          <EcosystemAppsMenu />
          <CatalogHeroActionsMenu variant="globalBar" />
        </div>
        <div className="homeHeroBannerInBar">
          {banner ? (
            <p className="catalogHeroBanner catalogHeroBanner--homeGlobalBar">{banner}</p>
          ) : null}
        </div>
        <CatalogGlobalBarTray className="searchResultsGlobalTray" />
      </div>

      <CatalogHeroToolbar
        suppressBanner
        className="catalogHeroToolbar--homeBelowIconRow"
        logo={
          <Link to={home()} className="homeHeroBrandMark" aria-label="Catalog home">
            <img src={HOME_BRAND_LOGO} alt="" className="homeHeroBrandImg" />
          </Link>
        }
      >
        <CatalogHeroSearchRegion>
          <CatalogHeroSearch
            variant="editable"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSubmit={onSubmit}
          />
        </CatalogHeroSearchRegion>
      </CatalogHeroToolbar>
    </div>
  );
}

HomeHeroChrome.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default HomeHeroChrome;
