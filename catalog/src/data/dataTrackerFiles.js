/**
 * Demo file rows for the asset Lineage → Data tracker tab (search + system filter + expandable pizza tracker).
 */

function slugPrefix(name) {
  return (
    String(name || 'entity')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'entity'
  );
}

/** Breadcrumb + title chrome (Amplify Storage Browser–style). */
export function getDataTrackerStorageContext(assetName) {
  const p = slugPrefix(assetName);
  const compact = (p + 'storagemedia').replace(/_/g, '');
  const bucket = `amplify-${compact.slice(0, 10)}-${compact.slice(10, 18) || 'alstorage'}-testbucket-${compact.slice(0, 8)}`;
  const folder = `${p}_media`;
  return {
    breadcrumbs: [
      { id: 'home', label: 'Home' },
      { id: 'bucket', label: bucket },
      { id: 'cwd', label: `${folder}/` },
    ],
  };
}

function enrichDataTrackerRow(row, index) {
  const label = row.label;
  const displayName = label.replace(/\/$/, '').split('/').filter(Boolean).pop() || label;
  let kind = row.kind;
  let typeLabel = row.typeLabel;
  let lastModifiedLabel = row.lastModifiedLabel;
  let sizeLabel = row.sizeLabel;

  if (kind == null) {
    if (label.endsWith('/') && displayName.startsWith('_')) {
      kind = 'hidden';
      typeLabel = 'hidden';
    } else if (label.endsWith('/')) {
      kind = 'folder';
      typeLabel = 'Folder';
    } else if (displayName.startsWith('.')) {
      kind = 'hidden';
      typeLabel = 'hidden';
    } else {
      kind = 'file';
      const m = displayName.match(/\.([a-z0-9]+)(?:\.([a-z0-9]+))?$/i);
      if (m) {
        typeLabel = m[2] ? `${m[1]}.${m[2]}`.toLowerCase() : m[1].toLowerCase();
      } else {
        typeLabel = '-';
      }
    }
  }

  if (typeLabel == null) {
    typeLabel = '-';
  }

  if (lastModifiedLabel == null) {
    const hh = String(8 + (index % 14)).padStart(2, '0');
    const dd = String(12 + (index % 16)).padStart(2, '0');
    lastModifiedLabel = `${dd}/11/2024, ${hh}:55:42`;
  }

  if (sizeLabel == null) {
    if (kind === 'folder' || kind === 'hidden') {
      sizeLabel = '0 B';
    } else {
      const sizes = ['128 B', '2.4 KB', '152.9 KB', '1.1 MB', '4.2 MB', '890 KB', '56 KB'];
      sizeLabel = sizes[index % sizes.length];
    }
  }

  return {
    ...row,
    displayName,
    kind,
    typeLabel,
    lastModifiedLabel,
    sizeLabel,
  };
}

/** Row count for lineage nodes / summaries (matches Data tracker tab list). */
export function getDataTrackerFileRowCount(assetName) {
  return buildDataTrackerFileRows(assetName).length;
}

export function buildDataTrackerFileRows(assetName) {
  const p = slugPrefix(assetName);
  const lake = 's3://data-lake-prod';

  const coreRows = [
    {
      id: 'dt-bronze-part',
      label: `bronze/${p}_orders/dt=2024-03-18/part-00000.parquet`,
      system: 'S3 Lakehouse',
      lineage: [
        {
          stage: 'Landing',
          detail: 'CSV batches from partner SFTP (hourly drop)',
          uri: `${lake}/landing/${p}_orders/in/dt=2024-03-18/*.csv`,
          checks: [
            { label: 'Virus scan', outcome: 'pass' },
            { label: 'Arrival SLA', outcome: 'warn', note: 'Batch landed 12m after window' },
          ],
        },
        {
          stage: 'Bronze',
          detail: 'Converted to Snappy Parquet · contract v3',
          uri: `${lake}/bronze/${p}_orders/dt=2024-03-18/part-00000.parquet`,
          isCurrent: true,
          checks: [
            { label: 'Schema v3 contract', outcome: 'pass' },
            { label: 'Null rate thresholds', outcome: 'pass' },
          ],
        },
        {
          stage: 'Silver',
          detail: 'Keyed merge and dedupe on order_id + tenant_id',
          uri: `${lake}/silver/${p}_orders/merged/`,
          checks: [{ label: 'Job status', outcome: 'pending', note: 'Queued after bronze commit' }],
        },
        {
          stage: 'Curated',
          detail: 'Published grain for this data product',
          uri: `${lake}/curated/${p}_curated/`,
          checks: [{ label: 'Publish gate', outcome: 'pending', note: 'Waiting on silver snapshot' }],
        },
      ],
    },
    {
      id: 'dt-silver-merge',
      label: `silver/${p}_orders/merged/snapshot-2024-03-18.parquet`,
      system: 'Databricks',
      lineage: [
        {
          stage: 'Bronze',
          detail: 'Daily partitions through 2024-03-18',
          uri: `${lake}/bronze/${p}_orders/dt=2024-03-18/`,
          checks: [
            { label: 'Partition completeness', outcome: 'pass' },
            { label: 'File size anomalies', outcome: 'pass' },
          ],
        },
        {
          stage: 'Silver',
          detail: 'Compaction job · snapshot artifact',
          uri: `${lake}/silver/${p}_orders/merged/snapshot-2024-03-18.parquet`,
          isCurrent: true,
          checks: [
            { label: 'Compaction checksum', outcome: 'pass' },
            { label: 'Row count vs bronze', outcome: 'warn', note: '−0.4% vs prior day' },
          ],
        },
        {
          stage: 'Curated',
          detail: 'Downstream transform reads snapshot URI',
          uri: `${lake}/curated/${p}_curated/`,
          checks: [{ label: 'Consumer freshness', outcome: 'pending', note: 'Next DAG tick 02:00 UTC' }],
        },
      ],
    },
    {
      id: 'dt-manifest',
      label: `_manifests/${p}_curated/run_id=7f2a9c/manifest.json`,
      system: 'Airflow',
      lineage: [
        {
          stage: 'Pipeline run',
          detail: 'Orchestrator run 7f2a9c · Airflow DAG',
          uri: `${lake}/_runs/${p}_curated/7f2a9c/`,
          checks: [
            { label: 'Task success', outcome: 'pass' },
            { label: 'Duration budget', outcome: 'warn', note: 'Run 8% over p95' },
          ],
        },
        {
          stage: 'Manifest',
          detail: 'Partition list + checksums for publish gate',
          uri: `${lake}/_manifests/${p}_curated/run_id=7f2a9c/manifest.json`,
          isCurrent: true,
          checks: [
            { label: 'Checksum match', outcome: 'pass' },
            { label: 'All partitions present', outcome: 'fail', note: 'Missing dt=2024-03-17/_SUCCESS' },
          ],
        },
        {
          stage: 'Curated',
          detail: 'Files listed in manifest promoted to read path',
          uri: `${lake}/curated/${p}_curated/dt=2024-03-18/`,
          checks: [{ label: 'Promotion blocked', outcome: 'pending', note: 'Resolve manifest failure first' }],
        },
      ],
    },
    {
      id: 'dt-export-csv',
      label: `exports/${p}_curated/customer_slice_2024-Q1.csv.gz`,
      system: 'Snowflake',
      lineage: [
        {
          stage: 'Curated',
          detail: 'Internal Parquet layout (source of truth)',
          uri: `${lake}/curated/${p}_curated/`,
          checks: [
            { label: 'ACL snapshot', outcome: 'pass' },
            { label: 'Column allow-list', outcome: 'pass' },
          ],
        },
        {
          stage: 'Export job',
          detail: 'Ad hoc extract · PII columns redacted',
          uri: `${lake}/exports/${p}_curated/customer_slice_2024-Q1.csv.gz`,
          isCurrent: true,
          checks: [
            { label: 'PII policy scan', outcome: 'pass' },
            { label: 'Export row cap', outcome: 'fail', note: 'Cap 5M exceeded' },
          ],
        },
        {
          stage: 'Consumer share',
          detail: 'Signed URL handed to downstream team',
          uri: 'https://share.example.internal/delivery/…',
          checks: [{ label: 'Signed URL issuance', outcome: 'pending', note: 'Blocked until export succeeds' }],
        },
      ],
    },
    {
      id: 'dt-stream-ingest',
      label: `kafka/${p}_events/hourly/2024-03-18T14.parquet`,
      system: 'Kafka Connect',
      lineage: [
        {
          stage: 'Stream buffer',
          detail: 'Hourly micro-batch landed from Kafka topic',
          uri: `kafka://ingest/${p}_events`,
          checks: [{ label: 'Lag SLA', outcome: 'pass' }],
        },
        {
          stage: 'Bronze stream',
          detail: 'Converted Avro → Parquet with schema registry',
          uri: `${lake}/bronze_stream/${p}_events/2024-03-18T14.parquet`,
          isCurrent: true,
          checks: [
            { label: 'Schema evolution', outcome: 'pass' },
            { label: 'Poison pill quarantine', outcome: 'pass' },
          ],
        },
        {
          stage: 'Silver merge',
          detail: 'Upsert into hourly silver table',
          uri: `${lake}/silver/${p}_events/hourly/`,
          checks: [{ label: 'Merge job', outcome: 'pending' }],
        },
      ],
    },
  ];

  const prefixRows = [
    { id: 'dt-folder-incoming', label: 'incoming/', system: 'S3', lineage: [] },
    {
      id: 'dt-hidden-sc',
      label: '_sc_h/',
      kind: 'hidden',
      typeLabel: 'hidden',
      system: 'S3',
      lineage: [],
    },
    {
      id: 'dt-jpg-thumb',
      label: `previews/${p}_hero_banner.jpg`,
      system: 'S3',
      lineage: [
        {
          stage: 'Published',
          detail: 'Derivative image for catalog previews',
          uri: `${lake}/previews/${p}_hero_banner.jpg`,
          isCurrent: true,
          checks: [{ label: 'MIME check', outcome: 'pass' }],
        },
      ],
    },
  ];

  return [...prefixRows, ...coreRows].map((r, i) => enrichDataTrackerRow(r, i));
}
