import PropTypes from 'prop-types';

function AssetPageTabStrip({ activeTab, setActiveTab, isDataProductType, isDataset, recordLayout = false }) {
  return (
    <div className={recordLayout ? 'assetRecordCardTabs' : 'assetTabs'}>
      {!recordLayout && (
        <button type="button" className={`assetTab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
          Details
        </button>
      )}
      <button
        type="button"
        className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'data-lineage' ? 'active' : ''}`}
        onClick={() => setActiveTab('data-lineage')}
      >
        Lineage
      </button>
      {isDataProductType && (
        <button
          type="button"
          className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
      )}
      {isDataProductType && (
        <button
          type="button"
          className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'tooling' ? 'active' : ''}`}
          onClick={() => setActiveTab('tooling')}
        >
          Tooling
        </button>
      )}
      <button
        type="button"
        className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'data-profiles' ? 'active' : ''}`}
        onClick={() => setActiveTab('data-profiles')}
      >
        {isDataProductType ? 'Product Profiles' : 'Data Profiles'}
      </button>
      {(isDataProductType || isDataset) && (
        <button
          type="button"
          className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'explore-bucket' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore-bucket')}
        >
          Data lake
        </button>
      )}
      {isDataset && (
        <button
          type="button"
          className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'dataset-reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataset-reports')}
        >
          Reports
        </button>
      )}
      {isDataProductType && (
        <button
          type="button"
          className={`${recordLayout ? 'assetRecordTab' : 'assetTab'} ${activeTab === 'product-details' ? 'active' : ''}`}
          onClick={() => setActiveTab('product-details')}
        >
          Details
        </button>
      )}
    </div>
  );
}

AssetPageTabStrip.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isDataProductType: PropTypes.bool.isRequired,
  isDataset: PropTypes.bool.isRequired,
  recordLayout: PropTypes.bool,
};

AssetPageTabStrip.defaultProps = {
  recordLayout: false,
};

export default AssetPageTabStrip;
