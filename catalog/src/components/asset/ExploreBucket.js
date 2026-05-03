import { useMemo, useState, useCallback, useEffect } from 'react';
import { ChevronDownIcon, FolderIcon, LockIcon } from '../../icons';
import PropTypes from 'prop-types';
import DataVolumeChart from '../DataVolumeChart';
import { getBucketRootDistribution } from '../../data/assetMockData';

const SYSTEM_TO_LAKE = {
  'system-a': 'data-lake-prod',
  'system-b': 'data-lake-staging',
};

function buildAwsS3ConsoleUrl(assetId, lakeBucketName) {
  const region = 'us-east-1';
  const prefix = `datasets/${assetId}/`;
  return `https://s3.console.aws.amazon.com/s3/buckets/${encodeURIComponent(lakeBucketName)}?region=${encodeURIComponent(region)}&prefix=${encodeURIComponent(prefix)}`;
}

/** Prototype: Athena query editor for the same region as the bucket link. */
function buildQueryTablesUrl() {
  const region = 'us-east-1';
  return `https://${region}.console.aws.amazon.com/athena/home?region=${encodeURIComponent(region)}#/query-editor`;
}

function ExploreBucket({ asset, assetId }) {
  const [bucketSystem, setBucketSystem] = useState('system-a');
  const lakeName = SYSTEM_TO_LAKE[bucketSystem] || 'data-lake-prod';

  const rootDistribution = useMemo(
    () => getBucketRootDistribution(assetId, lakeName),
    [assetId, lakeName],
  );

  const awsConsoleUrl = buildAwsS3ConsoleUrl(assetId, lakeName);
  const queryTablesUrl = buildQueryTablesUrl();
  const totalFiles = rootDistribution.reduce((s, r) => s + r.fileCount, 0);
  const prefixCount = rootDistribution.length;

  const [expandedPrefixes, setExpandedPrefixes] = useState(() => new Set());
  const togglePrefix = useCallback((name) => {
    setExpandedPrefixes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  useEffect(() => {
    setExpandedPrefixes(new Set());
  }, [assetId, lakeName]);

  return (
    <div className={`assetContentLayout bucketTabContent ${asset.noDataAccess ? 'bucketTabContent--noAccess' : ''}`}>
      {asset.noDataAccess && (
        <div className="bucketNoAccessOverlay" aria-hidden>
          <span className="bucketNoAccessLock">
            <LockIcon />
          </span>
          <p className="bucketNoAccessText">You don&apos;t have access to this data</p>
        </div>
      )}
      <nav className="assetSubNav" aria-label="Storage systems">
        <button
          type="button"
          className={`assetSubNavItem ${bucketSystem === 'system-a' ? 'active' : ''}`}
          onClick={() => setBucketSystem('system-a')}
        >
          System A
        </button>
        <button
          type="button"
          className={`assetSubNavItem ${bucketSystem === 'system-b' ? 'active' : ''}`}
          onClick={() => setBucketSystem('system-b')}
        >
          System B
        </button>
      </nav>
      <div className="assetContentArea bucketConsolePane">
        <div className="bucketDataLakeVolumeShell">
          <div className="bucketDataLakeVolumeToolbar">
            <a
              href={queryTablesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bucketQueryTablesBtn"
            >
              Query tables
            </a>
            <a
              href={awsConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bucketAwsConsoleBtn"
            >
              Open AWS Console
            </a>
          </div>
          <div className="bucketDataLakeVolumeBlock">
            <div className="dataTrackerVolumeChart bucketDataLakeVolumeChart">
              <DataVolumeChart className="dataVolumeChartWrap--dataLakeFlat" />
            </div>
          </div>
        </div>
        <div className="bucketExploreCard bucketMetricsCard bucketMetricsCard--standalone">
          <div className="bucketDistributionHeader">
            <div>
              <h3 className="assetSectionTitle bucketDistributionTitle">Storage distribution</h3>
              <p className="bucketDistributionSubtitle">
                File counts by top-level prefix under{' '}
                <code className="bucketConsoleCode bucketDistributionSubtitleCode">{lakeName}</code>. Expand a row to
                see the next-level folder split.
              </p>
            </div>
          </div>

          {rootDistribution.length > 0 ? (
            <>
              <div className="bucketDistributionSummary" aria-label="Bucket summary">
                <div className="bucketDistributionStat">
                  <span className="bucketDistributionStatValue">{totalFiles.toLocaleString()}</span>
                  <span className="bucketDistributionStatLabel">Files</span>
                </div>
                <div className="bucketDistributionStat">
                  <span className="bucketDistributionStatValue">{prefixCount}</span>
                  <span className="bucketDistributionStatLabel">Root prefixes</span>
                </div>
              </div>

              <ul className="bucketDistributionList">
                {rootDistribution.map(({ name, fileCount, children }) => {
                  const pct = totalFiles > 0 ? Math.round((fileCount / totalFiles) * 100) : 0;
                  const hasChildren = Array.isArray(children) && children.length > 0;
                  const isOpen = expandedPrefixes.has(name);
                  return (
                    <li key={name} className={`bucketDistributionRow${isOpen ? ' bucketDistributionRow--open' : ''}`}>
                      <div className="bucketDistributionRowMain">
                        {hasChildren ? (
                          <button
                            type="button"
                            className={`bucketDistributionExpandBtn${isOpen ? ' bucketDistributionExpandBtn--open' : ''}`}
                            aria-expanded={isOpen}
                            aria-controls={`bucket-dist-children-${name}`}
                            id={`bucket-dist-trigger-${name}`}
                            aria-label={
                              isOpen
                                ? `Collapse subfolders under ${name}`
                                : `Expand subfolders under ${name}`
                            }
                            onClick={() => togglePrefix(name)}
                          >
                            <span className="bucketDistributionExpandBtnIcon" aria-hidden>
                              <ChevronDownIcon />
                            </span>
                          </button>
                        ) : (
                          <span className="bucketDistributionExpandSpacer" aria-hidden />
                        )}
                        <span className="bucketDistributionRowIcon" aria-hidden>
                          <FolderIcon />
                        </span>
                        <div className="bucketDistributionRowText">
                          <span className="bucketDistributionFolder">{name}/</span>
                          <span className="bucketDistributionHint">Root prefix</span>
                        </div>
                        <span className="bucketDistributionPill">
                          <span className="bucketDistributionPillCount">{fileCount.toLocaleString()}</span>
                          <span className="bucketDistributionPillSep" aria-hidden>
                            ·
                          </span>
                          <span className="bucketDistributionPillPct">{pct}%</span>
                        </span>
                      </div>
                      <div className="bucketDistributionTrack" role="presentation">
                        <div className="bucketDistributionFill" style={{ width: `${Math.max(pct, 0)}%` }} />
                      </div>
                      {hasChildren && isOpen ? (
                        <ul
                          className="bucketDistributionChildren"
                          id={`bucket-dist-children-${name}`}
                          role="group"
                          aria-label={`Subfolders of ${name}`}
                        >
                          {children.map((child) => {
                            const childPct =
                              fileCount > 0 ? Math.round((child.fileCount / fileCount) * 100) : 0;
                            return (
                              <li key={child.name} className="bucketDistributionChildRow">
                                <div className="bucketDistributionChildRowMain">
                                  <span className="bucketDistributionChildIcon" aria-hidden>
                                    <FolderIcon />
                                  </span>
                                  <div className="bucketDistributionRowText">
                                    <span className="bucketDistributionFolder">
                                      {name}/{child.name}/
                                    </span>
                                    <span className="bucketDistributionHint">Of parent prefix</span>
                                  </div>
                                  <span className="bucketDistributionPill">
                                    <span className="bucketDistributionPillCount">
                                      {child.fileCount.toLocaleString()}
                                    </span>
                                    <span className="bucketDistributionPillSep" aria-hidden>
                                      ·
                                    </span>
                                    <span className="bucketDistributionPillPct">{childPct}%</span>
                                  </span>
                                </div>
                                <div className="bucketDistributionTrack bucketDistributionTrack--nested" role="presentation">
                                  <div
                                    className="bucketDistributionFill bucketDistributionFill--nested"
                                    style={{ width: `${Math.max(childPct, 0)}%` }}
                                  />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="bucketMetricsEmpty">No root folders in this bucket.</p>
          )}
        </div>
      </div>
    </div>
  );
}

ExploreBucket.propTypes = {
  asset: PropTypes.object.isRequired,
  assetId: PropTypes.string.isRequired,
};

export default ExploreBucket;
