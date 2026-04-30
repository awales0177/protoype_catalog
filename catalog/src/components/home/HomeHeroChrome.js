import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CatalogHeroToolbar, CatalogHeroSearch, CatalogHeroSearchRegion } from '../../catalog-shell';
import { home } from '../../routes';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

const HOME_BRAND_LOGO = publicAssetUrl('a_logo.png');

/** Home hero toolbar + centered search — matches catalog hero band styling (see HomePage.css). */
function HomeHeroChrome({ inputValue, setInputValue, onSubmit }) {
  return (
    <CatalogHeroToolbar
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
  );
}

HomeHeroChrome.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default HomeHeroChrome;
