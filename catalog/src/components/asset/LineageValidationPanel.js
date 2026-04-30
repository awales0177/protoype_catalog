import PropTypes from 'prop-types';
import { getGraphValidationRollup, getLineageValidationBreakdown } from '../../utils/productLineageGraph';
import './ProductDataLineage.css';

/** Full-width validation summary + checks-by-node for the asset record card (Lineage tab strip). */
function LineageValidationPanel({ assetId, asset, assetsById, variant = 'product' }) {
  const isDatasetVariant = variant === 'dataset';
  const roll = getGraphValidationRollup(assetId, assetsById);
  const breakdown = getLineageValidationBreakdown(assetId, assetsById);
  const hasChecks = roll.checkCount > 0;

  return (
    <div className="assetSection lineageValidationTabPanel">
      <h3 className="assetSectionTitle">Validation</h3>
      <p className="assetSectionDesc">
        {isDatasetVariant
          ? 'Lineage validation checks for this dataset: rolled up across Data P&L steps and catalog assets referenced in the graph.'
          : 'Lineage validation checks for this data product: rolled up across Data P&L steps and catalog assets referenced in the graph.'}
      </p>

      {hasChecks && (
        <div className="productValidationSummary" role="region" aria-label="Validation summary for lineage graph">
          <div className="productValidationSummaryMain">
            <span className="productValidationSummaryTitle">Summary</span>
            <div className="productValidationPills">
              <span className="productValidationPill productValidationPill--pass">
                <span className="productValidationPillValue">{roll.pass}</span> passed
              </span>
              <span className="productValidationPill productValidationPill--warn">
                <span className="productValidationPillValue">{roll.warn}</span> warnings
              </span>
              <span className="productValidationPill productValidationPill--fail">
                <span className="productValidationPillValue">{roll.fail}</span> failed
              </span>
              <span className="productValidationPill productValidationPill--pending">
                <span className="productValidationPillValue">{roll.pending}</span> pending
              </span>
            </div>
          </div>
          <p className="productValidationRollup">
            <strong>{asset.name}</strong> — {roll.nodeCount} nodes in this lineage · {roll.checkCount} checks total
            {roll.fail > 0 && <span className="productValidationRollupAlert"> · {roll.fail} failed</span>}
            {roll.warn > 0 && (
              <span className="productValidationRollupAlert productValidationRollupAlert--warn">
                {' '}
                · {roll.warn} warning{roll.warn === 1 ? '' : 's'}
              </span>
            )}
            {roll.pending > 0 && (
              <span className="productValidationRollupPending"> · {roll.pending} pending</span>
            )}
            .
          </p>
          <p className="productValidationMeta">
            Covers Data P&amp;L steps (validate / write) and catalog assets in the lineage graph. See the{' '}
            <strong>Lineage</strong> tab for relationships, Data P&amp;L, data tracker, and schema views.
          </p>
        </div>
      )}

      {!hasChecks && (
        <p className="assetFieldValue">No validation checks are defined for nodes in this lineage graph.</p>
      )}

      {hasChecks && (
        <div className="productValidationByNode productValidationByNode--tab" id="lineage-validation-details-tab">
          <h4 className="productValidationByNodeTitle">Checks by node</h4>
          <ul className="productValidationNodeList">
            {breakdown.map((row) => (
              <li key={row.id} className="productValidationNodeCard">
                <div className="productValidationNodeCardHead">
                  <span className="productValidationNodeName">{row.lineageName}</span>
                  {row.catalogName && row.catalogName !== row.lineageName && (
                    <span className="productValidationNodeCatalog">{row.catalogName}</span>
                  )}
                  {row.isPipelineStep && <span className="productValidationNodeBadge">Data P&amp;L step</span>}
                  <span className="productValidationNodeCounts" title="Pass · warn · fail · pending">
                    <span className="productValidationCount productValidationCount--pass">{row.summary.pass}</span>
                    <span className="productValidationCountSep">·</span>
                    <span className="productValidationCount productValidationCount--warn">{row.summary.warn}</span>
                    <span className="productValidationCountSep">·</span>
                    <span className="productValidationCount productValidationCount--fail">{row.summary.fail}</span>
                    <span className="productValidationCountSep">·</span>
                    <span className="productValidationCount productValidationCount--pending">{row.summary.pending}</span>
                  </span>
                </div>
                {row.validations.length > 0 && (
                  <ul className="productValidationCheckList">
                    {row.validations.map((v) => (
                      <li key={v.key} className={`productValidationCheckRow productValidationCheckRow--${v.status}`}>
                        <span className="productValidationCheckDot" aria-hidden />
                        <div className="productValidationCheckBody">
                          <span className="productValidationCheckLabel">{v.label}</span>
                          {v.detail ? <span className="productValidationCheckDetail">{v.detail}</span> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

LineageValidationPanel.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  assetsById: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['product', 'dataset']),
};

export default LineageValidationPanel;
