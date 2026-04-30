import PropTypes from 'prop-types';
import { useCatalogShell } from './context';

export default function CatalogHeroToolbar({ logo, children }) {
  const shell = useCatalogShell();
  const banner = shell?.heroBannerText;

  return (
    <header className="catalogHeroToolbar">
      {banner ? <p className="catalogHeroBanner">{banner}</p> : null}
      <div className="catalogHeroBrandSlot">{logo}</div>
      {children}
    </header>
  );
}

CatalogHeroToolbar.propTypes = {
  logo: PropTypes.node,
  children: PropTypes.node,
};

CatalogHeroToolbar.defaultProps = {
  logo: null,
  children: null,
};
