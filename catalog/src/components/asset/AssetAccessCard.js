import { useState } from 'react';
import PropTypes from 'prop-types';

function CheckCircleIcon() {
  return (
    <svg className="assetAccessBannerSvg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BanCircleIcon() {
  return (
    <svg className="assetAccessBannerSvg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 4.5l15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MOCK_APPS = [
  { id: 'a1', name: 'Application Name', models: 'Model(s) Available' },
  { id: 'a2', name: 'Application Name', models: 'Model(s) Available' },
];

function AssetAccessCard({ asset, isDataProductType, variant = 'default' }) {
  const productWord = isDataProductType ? 'product' : 'dataset';
  const hasAccess = !asset.noDataAccess;
  const record = variant === 'record';
  const [accessTab, setAccessTab] = useState('available');

  if (record) {
    return (
      <section className="assetAccessCard assetAccessCard--record" aria-labelledby="asset-access-heading">
        <h2 id="asset-access-heading" className="assetAccessCardTitle">
          Access & applications
        </h2>
        <div className="assetAccessCardTabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={accessTab === 'available'}
            className={`assetAccessCardTab ${accessTab === 'available' ? 'active' : ''}`}
            onClick={() => setAccessTab('available')}
          >
            Available Now
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accessTab === 'request'}
            className={`assetAccessCardTab ${accessTab === 'request' ? 'active' : ''}`}
            onClick={() => setAccessTab('request')}
          >
            Request in App
          </button>
        </div>
        <div className="assetAccessCardPanel" role="tabpanel">
          {accessTab === 'available' &&
            MOCK_APPS.map((row) => (
              <div key={row.id} className="assetAccessAppRow">
                <div className="assetAccessAppMain">
                  <span className="assetAccessAppName">{row.name}</span>
                  <span className="assetAccessAppModels">{row.models}</span>
                </div>
                <div className="assetAccessAppTrail">
                  <span className="assetAccessAppUSJA" aria-hidden>
                    {['U', 'S', 'J', 'A'].map((letter, i) => (
                      <span key={letter} className={`assetAccessAppUSJADot assetAccessAppUSJADot--${i}`}>
                        {letter}
                      </span>
                    ))}
                  </span>
                  <a href="#app" className="assetAccessAppLink" aria-label="Open in application">
                    <ExternalLinkGlyph />
                  </a>
                </div>
              </div>
            ))}
          {accessTab === 'request' && (
            <p className="assetRecordPlaceholder" style={{ margin: 16, minHeight: 80 }}>
              Request access through your workspace app. Approvals typically complete within 2 business days.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="assetAccessCard" aria-labelledby="asset-access-heading">
      <h2 id="asset-access-heading" className="assetAccessCardTitle">
        Your Access
      </h2>

      <div className="assetAccessCardPanel">
        <div className="assetAccessBanners">
          {hasAccess && (
            <div className="assetAccessBanner assetAccessBanner--success">
              <span className="assetAccessBannerIcon" aria-hidden>
                <CheckCircleIcon />
              </span>
              <span>You have authorization for this {productWord}.</span>
            </div>
          )}
          {!hasAccess && (
            <div className="assetAccessBanner assetAccessBanner--denied">
              <span className="assetAccessBannerIcon" aria-hidden>
                <BanCircleIcon />
              </span>
              <span>You do not have authorization for this {productWord}.</span>
            </div>
          )}
        </div>
      </div>

      <div className="assetAccessCardFooter">
        <div className="assetAccessCardFooterCopy">
          <h3 className="assetAccessCardNextTitle">Next Steps</h3>
          <p className="assetAccessCardNextText">
            Please work with your local data professional to complete the appropriate training and/or requests to access this info.
          </p>
        </div>
        <button type="button" className="assetAccessCardRequestBtn">
          Request
        </button>
      </div>
    </section>
  );
}

AssetAccessCard.propTypes = {
  asset: PropTypes.shape({
    noDataAccess: PropTypes.bool,
  }).isRequired,
  isDataProductType: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['default', 'record']),
};

AssetAccessCard.defaultProps = {
  variant: 'default',
};

export default AssetAccessCard;
