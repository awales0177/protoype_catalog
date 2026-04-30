import PropTypes from 'prop-types';
import { ASSET_OVERVIEW_DEFAULTS } from '../../data/sample_data';

function AssetDescriptionGovernancePanel({ asset }) {
  return (
    <div className="assetSummaryPanel">
      <div className="assetSummaryGrid">
        <div className="assetSummaryDescription">
          <h2 className="assetSummaryHeading">Description</h2>
          <p className="assetSummaryDescriptionText">{asset.description}</p>
        </div>
        <div className="assetSummaryGovernance">
          <h2 className="assetSummaryHeading">Governance</h2>
          <div className="overviewMetaGrid assetSummaryGovernanceGrid">
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Owner</span>
              <span className="overviewMetaValue">
                <a href={ASSET_OVERVIEW_DEFAULTS.ownerHref}>{ASSET_OVERVIEW_DEFAULTS.owner}</a>
              </span>
            </div>
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Last updated</span>
              <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.lastUpdated}</span>
            </div>
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Type</span>
              <span className="overviewMetaValue">
                {asset.type}
                {asset.feed && <span className="overviewFeedBadge">Feed</span>}
              </span>
            </div>
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Status</span>
              <span className="overviewMetaValue">
                <span className="overviewStatusPill approved">{ASSET_OVERVIEW_DEFAULTS.status}</span>
              </span>
            </div>
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Source system</span>
              <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.sourceSystem}</span>
            </div>
            <div className="overviewMetaRow">
              <span className="overviewMetaKey">Data classification</span>
              <span className="overviewMetaValue">
                <span className="assetClassTag">Customer Personal Info ×</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AssetDescriptionGovernancePanel.propTypes = {
  asset: PropTypes.shape({
    type: PropTypes.string,
    description: PropTypes.string,
    feed: PropTypes.bool,
  }).isRequired,
};

export default AssetDescriptionGovernancePanel;
