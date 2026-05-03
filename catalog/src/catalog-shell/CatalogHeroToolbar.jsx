import PropTypes from 'prop-types';
import { useCatalogShell } from './context';

export default function CatalogHeroToolbar({ logo, children, suppressBanner, className }) {
  const shell = useCatalogShell();
  const banner = !suppressBanner && shell?.heroBannerText;

  const headerClass = ['catalogHeroToolbar', className].filter(Boolean).join(' ');

  return (
    <header className={headerClass}>
      {banner ? <p className="catalogHeroBanner">{banner}</p> : null}
      <div className="catalogHeroBrandSlot">{logo}</div>
      {children}
    </header>
  );
}

CatalogHeroToolbar.propTypes = {
  logo: PropTypes.node,
  children: PropTypes.node,
  /** When true (e.g. home page), banner is rendered by the host above this header instead. */
  suppressBanner: PropTypes.bool,
  className: PropTypes.string,
};

CatalogHeroToolbar.defaultProps = {
  logo: null,
  children: null,
  suppressBanner: false,
  className: undefined,
};
