import PropTypes from 'prop-types';
import './ProductToolingTab.css';

function ProductToolingTab({ tools }) {
  if (!tools?.length) {
    return (
      <div className="assetSection productToolingTabPanel">
        <h3 className="assetSectionTitle">Tooling</h3>
        <p className="assetSectionDesc">
          No transformation tools are cataloged for this product yet. When registered, each tool record will list name,
          catalog identifier, and pinned version used in production pipelines.
        </p>
      </div>
    );
  }

  return (
    <div className="assetSection productToolingTabPanel">
      <h3 className="assetSectionTitle">Tooling</h3>
      <p className="assetSectionDesc">
        Tool records for components used to transform data into this product. Versions reflect what ran in the last
        successful publish path (illustrative for this prototype).
      </p>
      <ul className="productToolingCardGrid" role="list" aria-label="Transformation tooling">
        {tools.map((t) => (
          <li key={t.toolRecordId} className="productToolingCard">
            <div className="productToolingCardHeader">
              <span className="productToolingCardName">{t.name}</span>
              <span className="productToolingCardVersion" title="Pinned version">
                v{t.version}
              </span>
            </div>
            <span className="productToolingCardRoleLabel">Transform role</span>
            <p className="productToolingCardRole">{t.transformRole || '—'}</p>
            <div className="productToolingCardFoot">
              <span className="productToolingCardFootLabel">Tool record</span>
              <span className="productToolingCardRecordId">{t.toolRecordId}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

ProductToolingTab.propTypes = {
  tools: PropTypes.arrayOf(
    PropTypes.shape({
      toolRecordId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      transformRole: PropTypes.string,
    })
  ),
};

ProductToolingTab.defaultProps = {
  tools: [],
};

export default ProductToolingTab;
