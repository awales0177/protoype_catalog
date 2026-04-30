import { Link } from 'react-router-dom';
import { assetDetail } from '../../routes';
import { getRelationshipData, getTypeLabel, getTypeLabelClass } from '../../utils/assetRelationships';
import AssetRelationshipFlow from './AssetRelationshipFlow';
import PropTypes from 'prop-types';

function RelationshipChip({ asset, to, isCurrent }) {
  const label = getTypeLabel(asset.type);
  const labelClass = getTypeLabelClass(asset.type);
  const content = (
    <>
      {label && <span className={`relationshipsTypeChip ${labelClass}`}>{label}</span>}
      <span className="relationshipsChipName">{asset.name}</span>
    </>
  );
  const className = `relationshipsChipItem ${isCurrent ? 'relationshipsChipItem--current' : ''}`;
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return <span className={className}>{content}</span>;
}

RelationshipChip.propTypes = {
  asset: PropTypes.shape({ name: PropTypes.string, type: PropTypes.string }).isRequired,
  to: PropTypes.string,
  isCurrent: PropTypes.bool,
};

function AssetRelationships({ assetId, asset, assetsById, getAssetUrl, embedded, sectionTitle, sectionDesc }) {
  const rel = getRelationshipData(assetId, assetsById);
  const hasAny = rel.parents.length > 0 || rel.children.length > 0;
  const toUrl = getAssetUrl || assetDetail;
  const title = sectionTitle ?? 'Relationships';
  const desc =
    sectionDesc ?? 'Parent and child assets for this catalog item. Click a node to open that asset.';

  const section = (
    <div className="assetSection">
      <h3 className="assetSectionTitle">{title}</h3>
      <p className="assetSectionDesc">{desc}</p>
      {!hasAny && <p className="assetFieldValue">No parent or child relationships defined.</p>}
      {hasAny && (
        <>
          <div className="relationshipsChipStrip">
            <div className="relationshipsChipGroup">
              <span className="relationshipsChipGroupTitle">Direct parents</span>
              <div className="relationshipsChipList" role="list">
                {rel.parents.length > 0 ? (
                  rel.parents.map(({ id: pid, asset: p }) => (
                    <div key={pid} role="listitem">
                      <RelationshipChip asset={p} to={toUrl(pid)} />
                    </div>
                  ))
                ) : (
                  <p className="relationshipsChipEmpty">There are no direct parents for this asset.</p>
                )}
              </div>
            </div>
            <div className="relationshipsChipGroup relationshipsChipGroupCurrent">
              <span className="relationshipsChipGroupTitle">This asset</span>
              <div className="relationshipsChipList" role="list">
                <div role="listitem">
                  <RelationshipChip asset={asset} isCurrent />
                </div>
              </div>
            </div>
            <div className="relationshipsChipGroup">
              <span className="relationshipsChipGroupTitle">Direct children</span>
              <div className="relationshipsChipList" role="list">
                {rel.children.length > 0 ? (
                  rel.children.map(({ id: cid, asset: c }) => (
                    <div key={cid} role="listitem">
                      <RelationshipChip asset={c} to={toUrl(cid)} />
                    </div>
                  ))
                ) : (
                  <p className="relationshipsChipEmpty">There are no direct children for this asset.</p>
                )}
              </div>
            </div>
          </div>
          <div className="relationshipsDiagramWrap">
            <h4 className="relationshipsSubTitle">Relationship diagram</h4>
            <AssetRelationshipFlow assetId={assetId} asset={asset} assetsById={assetsById} getAssetUrl={getAssetUrl} />
          </div>
        </>
      )}
    </div>
  );

  if (embedded) {
    return section;
  }

  return (
    <div className="assetContentLayout">
      <div className="assetContentArea">{section}</div>
    </div>
  );
}

AssetRelationships.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  assetsById: PropTypes.object.isRequired,
  getAssetUrl: PropTypes.func,
  embedded: PropTypes.bool,
  sectionTitle: PropTypes.string,
  sectionDesc: PropTypes.node,
};

AssetRelationships.defaultProps = {
  embedded: false,
  sectionTitle: undefined,
  sectionDesc: undefined,
};

export default AssetRelationships;
