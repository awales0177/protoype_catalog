import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getSchemaLineageForAsset } from '../../data/schemaLineage';
import AssetRelationships from './AssetRelationships';
import ProductDataLineageFlow from './ProductDataLineageFlow';
import SchemaLineagePanel from './SchemaLineagePanel';
import DataTrackerFilesPanel from './DataTrackerFilesPanel';
import './ProductDataLineage.css';

function ProductDataLineage({
  assetId,
  asset,
  assetsById,
  getAssetUrl,
  variant = 'product',
}) {
  const isDatasetVariant = variant === 'dataset';
  const initialSection = isDatasetVariant ? 'relationships' : 'product';
  const [lineageSection, setLineageSection] = useState(initialSection);
  const schemaLineage = useMemo(
    () => (isDatasetVariant ? null : getSchemaLineageForAsset(assetId)),
    [assetId, isDatasetVariant],
  );

  /* Preserve Relationships / Data P&L / etc. across in-page navigations from the diagram links.
     Only coerce when switching to dataset variant can't show Schema lineage. */
  useEffect(() => {
    if (!isDatasetVariant) return;
    setLineageSection((prev) => (prev === 'schema' ? 'relationships' : prev));
  }, [assetId, isDatasetVariant]);

  const graphSectionDesc = isDatasetVariant
    ? 'Interactive graph of this dataset’s catalog relationships, including synthetic validate and write steps.'
    : 'Interactive graph of this data product’s upstream and downstream catalog assets, with synthetic validate and write steps.';

  const productLineageContent = (
    <div className="assetSection">
      <h3 className="assetSectionTitle">{'Data P&L'}</h3>
      <p className="assetSectionDesc">{graphSectionDesc}</p>

      <ProductDataLineageFlow
        assetId={assetId}
        assetsById={assetsById}
        getAssetUrl={getAssetUrl}
        showLineageValidation={!isDatasetVariant}
      />
    </div>
  );

  return (
    <div className="assetContentLayout">
      <nav className="assetSubNav" aria-label="Lineage">
        <button
          type="button"
          className={`assetSubNavItem ${lineageSection === 'relationships' ? 'active' : ''}`}
          onClick={() => setLineageSection('relationships')}
        >
          Relationships
        </button>
        <button
          type="button"
          className={`assetSubNavItem ${lineageSection === 'product' ? 'active' : ''}`}
          onClick={() => setLineageSection('product')}
        >
          {'Data P&L'}
        </button>
        <button
          type="button"
          className={`assetSubNavItem ${lineageSection === 'tracker' ? 'active' : ''}`}
          onClick={() => setLineageSection('tracker')}
        >
          Data tracker
        </button>
        {!isDatasetVariant ? (
          <button
            type="button"
            className={`assetSubNavItem ${lineageSection === 'schema' ? 'active' : ''}`}
            onClick={() => setLineageSection('schema')}
          >
            Schema lineage
          </button>
        ) : null}
      </nav>
      <div className="assetContentArea">
        {lineageSection === 'relationships' && (
          <AssetRelationships
            embedded
            sectionDesc={
              isDatasetVariant ? (
                <>
                  Direct parent and child catalog relationships in the catalog. Open <strong>Data P&amp;L</strong> for
                  validate → write steps and graph; open <strong>Data tracker</strong> for files by system with stage
                  trackers.
                </>
              ) : (
                <>
                  Direct parent and child catalog relationships in the catalog. Open <strong>Data P&amp;L</strong> for
                  validate → write steps and graph; use the card <strong>Validation</strong> tab for lineage checks,{' '}
                  <strong>Tooling</strong> for transform stack versions; open <strong>Data tracker</strong> for files by
                  system with stage trackers.
                </>
              )
            }
            assetId={assetId}
            asset={asset}
            assetsById={assetsById}
            getAssetUrl={getAssetUrl}
          />
        )}

        {lineageSection === 'product' && productLineageContent}

        {lineageSection === 'tracker' && <DataTrackerFilesPanel assetId={assetId} asset={asset} />}

        {!isDatasetVariant && lineageSection === 'schema' && (
          <div className="assetSection">
            {schemaLineage ? (
              <SchemaLineagePanel schema={schemaLineage} />
            ) : (
              <>
                <h3 className="assetSectionTitle">Schema lineage</h3>
                <p className="assetSectionDesc">
                  No schema column mappings are cataloged for this record yet. When available, source headers, derived
                  fields, and net-new columns will appear here.
                </p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

ProductDataLineage.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  assetsById: PropTypes.object.isRequired,
  getAssetUrl: PropTypes.func,
  variant: PropTypes.oneOf(['product', 'dataset']),
};

export default ProductDataLineage;
