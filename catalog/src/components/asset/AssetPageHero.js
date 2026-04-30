import { Link } from 'react-router-dom';
import { CatalogHeroTopRow } from '../../catalog-shell';
import { BellIcon, BellOffIcon } from '../../icons';
import PropTypes from 'prop-types';

function AssetPageHero({
  breadcrumbs,
  assetName,
  AssetIcon,
  assetSubscribed,
  onToggleSubscribe,
  statusBadge = null,
}) {
  const showHealth = Boolean(statusBadge);

  return (
    <div className="assetHero">
      <CatalogHeroTopRow />
      <nav className="assetBreadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id}>
            {i > 0 && ' / '}
            {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span className="assetBreadcrumbCurrent">{crumb.label}</span>}
          </span>
        ))}
      </nav>
      <div className="assetTitleRow">
        <div className="assetTitleBlock">
          <span className="assetTitleIcon" aria-hidden>
            <AssetIcon />
          </span>
          <h1 className="assetTitle">{assetName}</h1>
        </div>
        <div className="assetTitleRight">
          <div className="assetBadges">
            <div className="assetBadgeRow">
              <button
                type="button"
                className={`assetNotifyBtn ${assetSubscribed ? 'subscribed' : ''}`}
                aria-label={assetSubscribed ? 'Unsubscribe from notifications' : 'Subscribe for notifications'}
                title={assetSubscribed ? 'Unsubscribe from notifications' : 'Subscribe for notifications'}
                onClick={onToggleSubscribe}
              >
                {assetSubscribed ? <BellIcon /> : <BellOffIcon />}
              </button>
              {showHealth && (
                <span className={`assetStatusBadge ${statusBadge.className}`}>{statusBadge.label}</span>
              )}
            </div>
            {showHealth && (
              <div className="assetProgressBar">
                <div className={`assetProgressFill ${statusBadge.className}`} style={{ width: '100%' }} />
              </div>
            )}
          </div>
          <div className="assetTitleActions" />
        </div>
      </div>
    </div>
  );
}

AssetPageHero.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, to: PropTypes.string })
  ).isRequired,
  assetName: PropTypes.string.isRequired,
  AssetIcon: PropTypes.elementType.isRequired,
  assetSubscribed: PropTypes.bool.isRequired,
  onToggleSubscribe: PropTypes.func.isRequired,
  statusBadge: PropTypes.shape({ label: PropTypes.string.isRequired, className: PropTypes.string.isRequired }),
};

export default AssetPageHero;
