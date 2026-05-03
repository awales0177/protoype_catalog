import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, TableIcon } from '../../icons';
import './SchemaLineagePanel.css';

const tableSchemaPropType = PropTypes.shape({
  id: PropTypes.string,
  sourceLabel: PropTypes.string.isRequired,
  sourceColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  transforms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sources: PropTypes.arrayOf(PropTypes.string).isRequired,
      target: PropTypes.string.isRequired,
      expression: PropTypes.string,
    }),
  ).isRequired,
  addedColumns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      note: PropTypes.string,
    }),
  ).isRequired,
});

function SchemaLineageTableCard({ table, stableKey }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const triggerId = `${panelId}-trigger`;

  const { sourceLabel, sourceColumns, transforms, addedColumns } = table;
  const mapCount = transforms.length;
  const newCount = addedColumns.length;

  return (
    <div className="schemaLineageTableCard">
      <button
        type="button"
        className="schemaLineageCardHeader"
        aria-expanded={expanded}
        aria-controls={panelId}
        id={triggerId}
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="schemaLineageCardHeaderIcon" aria-hidden>
          <TableIcon />
        </span>
        <div className="schemaLineageCardHeaderText">
          <span className="schemaLineageCardKicker">Source table</span>
          <span className="schemaLineageCardTitle">{sourceLabel}</span>
          <span className="schemaLineageCardMeta">
            {sourceColumns.length} field{sourceColumns.length === 1 ? '' : 's'} · {mapCount} transform
            {mapCount === 1 ? '' : 's'} · {newCount} ETL col
            {newCount === 1 ? '' : 's'}
          </span>
        </div>
        <span className={`schemaLineageCardChevron ${expanded ? 'schemaLineageCardChevron--open' : ''}`} aria-hidden>
          <ChevronDownIcon />
        </span>
      </button>

      {expanded ? (
        <div className="schemaLineageCardBody" id={panelId} role="region" aria-labelledby={triggerId}>
          <div className="schemaLineageCardSplit">
            <div className="schemaLineageFlowColumn">
              <div className="schemaLineageFlowSection">
                <span className="schemaLineageSectionLabel">Source header → targets</span>
                <ul className="schemaLineageHeaderMapList" aria-label="Source columns mapped to targets">
                  {sourceColumns.map((col) => {
                    const maps = transforms.filter((t) => t.sources.includes(col));
                    return (
                      <li key={`${stableKey}-${col}`} className="schemaLineageHeaderMapRow">
                        <div className="schemaLineageHeaderMapMain">
                          <span className="schemaLineageChip schemaLineageChip--source">{col}</span>
                          <span className="schemaLineageHorizConnector" aria-hidden>
                            <span className="schemaLineageHorizLine" />
                            <span className="schemaLineageHorizArrow">→</span>
                          </span>
                          <div className="schemaLineageTargetGroup">
                            {maps.length === 0 ? (
                              <span className="schemaLineageChip schemaLineageChip--unmapped">Not mapped</span>
                            ) : (
                              maps.map((t) => (
                                <span key={t.id} className="schemaLineageChip schemaLineageChip--target">
                                  {t.target}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        {maps.some((t) => t.expression) ? (
                          <div className="schemaLineageRowExpressions">
                            {maps
                              .filter((t) => t.expression)
                              .map((t) => (
                                <code key={t.id} className="schemaLineageExpression schemaLineageExpression--row">
                                  {t.expression}
                                </code>
                              ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <aside className="schemaLineageNewRail" aria-label="ETL columns">
              <span className="schemaLineageSectionLabel">ETL columns</span>
              <p className="schemaLineageNewRailHint">Added by this ETL — no arrow from source header.</p>
              <ul className="schemaLineageNewRailList">
                {addedColumns.map((col) => (
                  <li key={col.name} className="schemaLineageNewRailItem">
                    <span className="schemaLineageChip schemaLineageChip--added">{col.name}</span>
                    {col.note ? <span className="schemaLineageAddedNote">{col.note}</span> : null}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}

SchemaLineageTableCard.propTypes = {
  table: tableSchemaPropType.isRequired,
  stableKey: PropTypes.string.isRequired,
};

function SchemaLineagePanel({ schema }) {
  const tables = schema?.tables;

  if (!tables?.length) return null;

  const multi = tables.length > 1;

  return (
    <section className="schemaLineage" aria-labelledby="schema-lineage-heading">
      <h3 className="assetSectionTitle schemaLineageTitle" id="schema-lineage-heading">
        Schema lineage
      </h3>
      <p className="schemaLineageIntro">
        {multi ? (
          <>
            Multiple upstream tables feed this product. Expand each card to see source columns mapped to targets, and
            net-new ETL fields on the right.
          </>
        ) : (
          <>
            Expand a table card to see each source column with a horizontal arrow to its transformed target(s), and ETL
            columns on the right (no upstream arrow).
          </>
        )}
      </p>

      <div className="schemaLineageTableStack">
        {tables.map((table, i) => (
          <SchemaLineageTableCard
            key={table.id ?? `schema-table-${i}`}
            table={table}
            stableKey={table.id ?? `t${i}`}
          />
        ))}
      </div>
    </section>
  );
}

SchemaLineagePanel.propTypes = {
  schema: PropTypes.shape({
    tables: PropTypes.arrayOf(tableSchemaPropType).isRequired,
  }),
};

export default SchemaLineagePanel;
