import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon } from '../../icons';
import './SchemaLineagePanel.css';

function SchemaLineagePanel({ schema }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  if (!schema) return null;

  const { sourceLabel, sourceColumns, transforms, addedColumns } = schema;
  const mapCount = transforms.length;
  const newCount = addedColumns.length;

  return (
    <section className="schemaLineage" aria-labelledby="schema-lineage-heading">
      <h3 className="assetSectionTitle schemaLineageTitle" id="schema-lineage-heading">
        Schema lineage
      </h3>
      <p className="schemaLineageIntro">
        Expand a table card to see each source column with a horizontal arrow to its transformed target(s), and ETL
        columns on the right (no upstream arrow).
      </p>

      <div className="schemaLineageTableCard">
        <button
          type="button"
          className="schemaLineageCardHeader"
          aria-expanded={expanded}
          aria-controls={panelId}
          id={`${panelId}-trigger`}
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="schemaLineageCardHeaderText">
            <span className="schemaLineageCardKicker">Source table</span>
            <span className="schemaLineageCardTitle">{sourceLabel}</span>
            <span className="schemaLineageCardMeta">
              {sourceColumns.length} field{sourceColumns.length === 1 ? '' : 's'} · {mapCount} transform{mapCount === 1 ? '' : 's'} · {newCount} ETL col
              {newCount === 1 ? '' : 's'}
            </span>
          </div>
          <span className={`schemaLineageCardChevron ${expanded ? 'schemaLineageCardChevron--open' : ''}`} aria-hidden>
            <ChevronDownIcon />
          </span>
        </button>

        {expanded ? (
          <div className="schemaLineageCardBody" id={panelId} role="region" aria-labelledby={`${panelId}-trigger`}>
            <div className="schemaLineageCardSplit">
              <div className="schemaLineageFlowColumn">
                <div className="schemaLineageFlowSection">
                  <span className="schemaLineageSectionLabel">Source header → targets</span>
                  <ul className="schemaLineageHeaderMapList" aria-label="Source columns mapped to targets">
                    {sourceColumns.map((col) => {
                      const maps = transforms.filter((t) => t.sources.includes(col));
                      return (
                        <li key={col} className="schemaLineageHeaderMapRow">
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
    </section>
  );
}

SchemaLineagePanel.propTypes = {
  schema: PropTypes.shape({
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
  }),
};

export default SchemaLineagePanel;
