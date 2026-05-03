import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { home } from '../routes';
import { RssFeedIcon, SendPlaneIcon, PrintIcon, FloppySaveIcon } from '../icons';
import { publicAssetUrl } from '../utils/publicAssetUrl';
import './CatalogFloatingPageRail.css';

const BRAND = publicAssetUrl('a_logo.png');

/**
 * Compact “floating” rail (logo, jump/navigation slot, icons) rendered above the
 * first white card — shared by search hero and record detail layouts.
 */
function CatalogFloatingPageRail({ jumpSlot }) {
  return (
    <div className="catalogFloatingPageRail">
      <div className="catalogFloatingPageRailInner">
        <div className="catalogFloatingPageRailStart">
          <Link to={home()} className="catalogFloatingPageRailLogoLink" aria-label="Catalog home">
            <img src={BRAND} alt="" className="catalogFloatingPageRailLogo" />
          </Link>
          {jumpSlot ? <div className="catalogFloatingPageRailJump">{jumpSlot}</div> : null}
        </div>
        <div className="catalogFloatingPageRailTools" role="toolbar" aria-label="Page shortcuts">
          <button type="button" className="catalogFloatingPageRailToolBtn" aria-label="RSS feed" title="RSS feed">
            <RssFeedIcon />
          </button>
          <button type="button" className="catalogFloatingPageRailToolBtn" aria-label="Share" title="Share">
            <SendPlaneIcon />
          </button>
          <button type="button" className="catalogFloatingPageRailToolBtn" aria-label="Print" title="Print">
            <PrintIcon />
          </button>
          <button type="button" className="catalogFloatingPageRailToolBtn" aria-label="Save" title="Save">
            <FloppySaveIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

CatalogFloatingPageRail.propTypes = {
  jumpSlot: PropTypes.node,
};

CatalogFloatingPageRail.defaultProps = {
  jumpSlot: null,
};

export default CatalogFloatingPageRail;
