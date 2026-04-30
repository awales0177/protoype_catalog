import { useMemo, useState } from 'react';
import { LockIcon } from '../../icons';
import PropTypes from 'prop-types';
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

function ExploreBucket({ asset, assetId }) {
  const [bucketSystem, setBucketSystem] = useState('system-a');
  const lakeName = SYSTEM_TO_LAKE[bucketSystem] || 'data-lake-prod';

  const rootDistribution = useMemo(
    () => getBucketRootDistribution(assetId, lakeName),
    [assetId, lakeName],
  );

  const awsConsoleUrl = buildAwsS3ConsoleUrl(assetId, lakeName);
  const totalFiles = rootDistribution.reduce((s, r) => s + r.fileCount, 0);
  const barColors = ['#2e9ad0', '#6b8e23', '#b8860b', '#8b4789', '#c45a2b', '#2a7b8e'];

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
        <div className="bucketExploreCard bucketAwsConsoleCard">
          <h3 className="assetSectionTitle">AWS console</h3>
          <p className="bucketMetricsDesc">Jump to this dataset in S3 with the correct bucket and prefix.</p>
          <div className="bucketAwsConsoleCardActions">
            <a
              href={awsConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bucketAwsConsoleBtn"
            >
              Open AWS Console
            </a>
          </div>
          <p className="bucketConsoleHint">
            Opens S3 for <code className="bucketConsoleCode">{lakeName}</code> with prefix{' '}
            <code className="bucketConsoleCode">datasets/{assetId}/</code>
          </p>
        </div>
        <div className="bucketExploreCard bucketMetricsCard bucketMetricsCard--standalone">
          <h3 className="assetSectionTitle">Bucket metrics</h3>
          <p className="bucketMetricsDesc">Data distribution by root folder</p>
          <div className="bucketDistribution">
            {rootDistribution.map(({ name, fileCount }, index) => {
              const pct = totalFiles > 0 ? Math.round((fileCount / totalFiles) * 100) : 0;
              const barColor = barColors[index % barColors.length];
              return (
                <div key={name} className="bucketDistributionRow">
                  <div className="bucketDistributionLabel">
                    <span className="bucketDistributionFolder">{name}/</span>
                    <span className="bucketDistributionCount">
                      {fileCount} files ({pct}%)
                    </span>
                  </div>
                  <div className="bucketDistributionBarWrap" role="presentation">
                    <div
                      className="bucketDistributionBar"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {rootDistribution.length === 0 && (
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
