import PropTypes from 'prop-types';

function ProductModelInfoCard({ info }) {
  if (!info) return null;

  const { logicalLabel, logicalName, version, format, encoding, rowCardinality, domain, owner, updateFrequency, notes } = info;

  const titleLine =
    logicalLabel && logicalName
      ? `${logicalLabel} (${logicalName})`
      : logicalLabel || logicalName || 'Model';

  return (
    <section id="product-model-info" className="productDetailCard productModelInfoCard">
      <h3 className="productDetailCardTitle">Model info</h3>
      <p className="productDetailCardLead">{titleLine}</p>
      {version ? (
        <p className="productDetailCardMuted">
          <span className="productDetailBadge">v{version}</span>
          {domain ? ` · ${domain}` : ''}
        </p>
      ) : null}
      <div className="productDetailMetaGrid">
        {format ? (
          <div className="productDetailMetaCell">
            <span className="productDetailMetaKey">Format</span>
            <span className="productDetailMetaVal">{format}</span>
          </div>
        ) : null}
        {encoding ? (
          <div className="productDetailMetaCell">
            <span className="productDetailMetaKey">Encoding</span>
            <span className="productDetailMetaVal">{encoding}</span>
          </div>
        ) : null}
        {rowCardinality ? (
          <div className="productDetailMetaCell">
            <span className="productDetailMetaKey">Granularity</span>
            <span className="productDetailMetaVal">{rowCardinality}</span>
          </div>
        ) : null}
        {updateFrequency ? (
          <div className="productDetailMetaCell">
            <span className="productDetailMetaKey">Updates</span>
            <span className="productDetailMetaVal">{updateFrequency}</span>
          </div>
        ) : null}
        {owner ? (
          <div className="productDetailMetaCell">
            <span className="productDetailMetaKey">Owner</span>
            <span className="productDetailMetaVal">{owner}</span>
          </div>
        ) : null}
      </div>
      {notes ? <p className="productDetailCardNotes">{notes}</p> : null}
    </section>
  );
}

ProductModelInfoCard.propTypes = {
  info: PropTypes.shape({
    logicalLabel: PropTypes.string,
    logicalName: PropTypes.string,
    version: PropTypes.string,
    format: PropTypes.string,
    encoding: PropTypes.string,
    rowCardinality: PropTypes.string,
    domain: PropTypes.string,
    owner: PropTypes.string,
    updateFrequency: PropTypes.string,
    notes: PropTypes.string,
  }),
};

ProductModelInfoCard.defaultProps = {
  info: null,
};

export default ProductModelInfoCard;
