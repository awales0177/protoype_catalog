import PropTypes from 'prop-types';
import { LockIcon } from '../../icons';
import { ASSET_OVERVIEW_DEFAULTS } from '../../data/sample_data';

function AssetQuickViewSidebar({ asset, isDataProductType, onViewHistory }) {
  return (
    <aside className="assetSidebar">
      <div className="assetSidebarTitle">Quick View</div>
      <div className="assetSidebarSection">
        <div className="assetSidebarLabel">Type</div>
        <div className="assetSidebarValue">
          <a href="#type">{asset.type}</a>
        </div>
      </div>
      <div className="assetSidebarSection">
        <div className="assetSidebarLabel">Status</div>
        <div className="assetSidebarValue">{ASSET_OVERVIEW_DEFAULTS.status}</div>
      </div>
      <div className="assetSidebarSection">
        <div className="assetSidebarLabel">Last Synced</div>
        <div className="assetSidebarValue">Dec. 11, 2023</div>
      </div>
      <div className="assetSidebarSection">
        <div className="assetSidebarLabel">Last Modified</div>
        <div className="assetSidebarValue">Dec. 12, 2023</div>
      </div>
      {asset.noDataAccess && (
        <div className="assetSidebarSection assetSidebarNoAccess">
          <span className="assetSidebarLockIcon" title="You don't have access to this data" aria-label="No data access">
            <LockIcon />
          </span>
          <span className="assetSidebarNoAccessLabel">No data access</span>
        </div>
      )}
      <div className="assetSidebarSection">
        <button type="button" className="assetSidebarLink assetSidebarLinkBtn" onClick={onViewHistory}>
          View History
        </button>
      </div>
      <div className="assetSidebarSection">
        <div className="assetSidebarLabel">Data Classification</div>
        <span className="assetClassTag">Customer Personal Info ×</span>
      </div>
      {isDataProductType && (
        <>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Product format</div>
            <div className="assetSidebarValue">Parquet</div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Data model</div>
            <div className="assetSidebarValue">
              <a href="#data-model">Schema and entity definitions</a>
            </div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Producer</div>
            <div className="assetSidebarProfiles">
              <a href="#producer" className="assetSidebarProfileRow">
                <span className="assetAvatar" aria-hidden>
                  AP
                </span>
                <span className="assetSidebarProfileName">Analytics Platform Team</span>
              </a>
            </div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Consumers</div>
            <div className="assetSidebarProfiles">
              <a href="#consumer" className="assetSidebarProfileRow">
                <span className="assetAvatar" aria-hidden>
                  C3
                </span>
                <span className="assetSidebarProfileName">Customer 360 View</span>
              </a>
              <a href="#consumer" className="assetSidebarProfileRow">
                <span className="assetAvatar" aria-hidden>
                  MS
                </span>
                <span className="assetSidebarProfileName">Monthly Sales Summary</span>
              </a>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

AssetQuickViewSidebar.propTypes = {
  asset: PropTypes.shape({
    type: PropTypes.string,
    noDataAccess: PropTypes.bool,
  }).isRequired,
  isDataProductType: PropTypes.bool.isRequired,
  onViewHistory: PropTypes.func.isRequired,
};

export default AssetQuickViewSidebar;
