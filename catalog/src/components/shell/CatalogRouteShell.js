import PropTypes from 'prop-types';
import './CatalogRouteShell.css';

/** Flex filler below hero chrome so overlapping layouts (e.g. curated list `assetBody`) size correctly. */
function CatalogRouteShell({ children }) {
  return <div className="catalogRouteShell">{children}</div>;
}

CatalogRouteShell.propTypes = {
  children: PropTypes.node,
};

CatalogRouteShell.defaultProps = {
  children: null,
};

export default CatalogRouteShell;
