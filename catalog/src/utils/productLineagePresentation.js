/** Presentation-only fields for product data lineage (Dagster-style graph). */

import { getDataTrackerFileRowCount } from '../data/dataTrackerFiles';

function fileCountForCatalogAsset(asset) {
  return getDataTrackerFileRowCount(asset?.name || asset?.title);
}

function toSnakeCaseLabel(name) {
  return (
    String(name || 'asset')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'asset'
  );
}

const TECH_BY_TYPE = {
  'Data product': ['Jupyter', 'Kubeflow', 'Spark', 'S3'],
  'Parent dataset': ['S3', 'Spark'],
  'Child dataset': ['S3', 'Jupyter'],
  'Adoption record': ['S3'],
};

const TECH_TO_LOGO = {
  'Scikit Learn': 'sklearn',
  sklearn: 'sklearn',
  ClamAV: 'scan',
  'Apache Tika': 'scan',
  'Landing zone': 's3',
  S3: 's3',
  Databricks: 'databricks',
  PySpark: 'spark',
  Spark: 'spark',
  Kubernetes: 'kubernetes',
  Snowflake: 'snowflake',
  Delta: 'delta',
  'Delta Lake': 'delta',
  Parquet: 'warehouse',
  ipynb: 'jupyter',
  Jupyter: 'jupyter',
  jupyter: 'jupyter',
  Kubeflow: 'kubeflow',
  kubeflow: 'kubeflow',
  'Vision OCR': 'scan',
  PDF: 'write',
  'JSON Schema': 'validation',
  'Great Expectations': 'validation',
};

const TYPE_DEFAULT_LOGO = {
  'Data product': 'jupyter',
  'Parent dataset': 's3',
  'Child dataset': 's3',
  'Adoption record': 's3',
};

/** Map catalog / pipeline tech labels to lineage logo ids (chips under graph nodes). */
export function getTechTagLogoId(tag) {
  if (tag == null || String(tag).trim() === '') return 'default';
  if (TECH_TO_LOGO[tag]) return TECH_TO_LOGO[tag];
  const n = String(tag).toLowerCase();
  if (n.includes('jupyter') || n === 'ipynb') return 'jupyter';
  if (n.includes('kubeflow')) return 'kubeflow';
  if (n.includes('pyspark') || n.includes('apache spark') || n.includes('spark')) return 'spark';
  if (n.includes('s3') || n.includes('amazon s3')) return 's3';
  if (n.includes('snowflake')) return 'snowflake';
  if (n.includes('databricks')) return 'databricks';
  if (n.includes('kubernetes') || n === 'k8s') return 'kubernetes';
  if (n.includes('delta')) return 'delta';
  if (n.includes('parquet')) return 'warehouse';
  if (n.includes('scikit') || n.includes('sklearn')) return 'sklearn';
  if (n.includes('ocr')) return 'scan';
  if (n.includes('json schema') || n.includes('great expectations')) return 'validation';
  return 'default';
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Deterministic bytes shaped like RFC-4122 v4 from a seed string (catalog demo IDs). */
function deterministicUuidBytes(seed) {
  const bytes = new Uint8Array(16);
  let a = hashString(seed) >>> 0;
  let b = hashString(`${seed}|b`) >>> 0;
  if ((a | b) === 0) {
    a = 0x9e3779b9;
    b = 0x85ebca6b;
  }
  for (let i = 0; i < 16; i += 1) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    b ^= a;
    b = (Math.imul(b, 2246822519) + 3266489917) >>> 0;
    bytes[i] = (a ^ b) & 0xff;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

/** Stable rule identifier: `RUL-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. */
export function makeRulRuleId(seed) {
  const hex = [...deterministicUuidBytes(seed)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `RUL-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function stampValidationRuleIds(lineageSlug, validations) {
  const slug = String(lineageSlug || 'lineage').trim();
  return (validations || []).map((v) => ({
    ...v,
    ruleId: makeRulRuleId(`${slug}::${v.key}`),
  }));
}

/** Deterministic “last materialized” label per asset id (demo). */
function materializedLabelForId(id) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = hashString(String(id));
  const day = 1 + (h % 28);
  const hour = 1 + (h % 12);
  const minute = (h % 60).toString().padStart(2, '0');
  const ampm = h % 2 ? 'AM' : 'PM';
  const month = months[h % 12];
  return `${month} ${day}, ${hour}:${minute} ${ampm}`;
}

function inferLogoId(techTags, assetType) {
  for (const t of techTags || []) {
    if (TECH_TO_LOGO[t]) return TECH_TO_LOGO[t];
  }
  return TYPE_DEFAULT_LOGO[assetType] || 'warehouse';
}

/** Default validation checks (deterministic demo). */
function buildDefaultValidations(asset) {
  if (!asset) {
    return [
      {
        key: 'meta',
        label: 'Metadata',
        status: 'pending',
        detail: 'Unknown asset',
      },
    ];
  }
  const checks = [
    {
      key: 'schema',
      label: 'Schema contract',
      status: 'pass',
      detail: 'Registered in catalog',
    },
    {
      key: 'lineage',
      label: 'Lineage coverage',
      status: asset.noDataAccess ? 'warn' : 'pass',
      detail: asset.noDataAccess ? 'Row-level lineage withheld (access)' : 'Full column mapping',
    },
    {
      key: 'sla',
      label: 'Freshness SLA',
      status: asset.stale ? 'fail' : 'pass',
      detail: asset.stale ? 'Lag exceeds 24h threshold' : 'Within SLA window',
    },
    {
      key: 'pii',
      label: 'PII & classification',
      status: 'pass',
      detail: 'Tags aligned to policy',
    },
  ];
  if (asset.trackerFailedStepId) {
    checks.push({
      key: 'publish',
      label: 'Publish gate',
      status: 'fail',
      detail: `Pipeline step “${asset.trackerFailedStepId}” did not succeed`,
    });
  }
  const h = hashString(asset.id);
  if (h % 7 === 0 && !asset.stale) {
    checks.push({
      key: 'volume',
      label: 'Volume anomaly',
      status: 'warn',
      detail: 'Row count −12% vs 7d baseline',
    });
  }
  return checks;
}

/** Richer copy, logos, and checks for demo assets (lineage graph only). */
const LINEAGE_OVERRIDES = {
  'ddp-2024-001': {
    lineageName: 'customer_ltv_model',
    description: 'This asset is backed by the notebook at analytics/models/customer_ltv.ipynb.',
    techTags: ['Jupyter', 'Kubeflow', 'Spark', 'S3'],
    logoId: 'jupyter',
    validations: [
      { key: 'schema', label: 'Schema contract', status: 'pass', detail: 'pydantic model v3.2' },
      { key: 'tests', label: 'Unit & integration tests', status: 'pass', detail: '42 tests green' },
      { key: 'drift', label: 'Feature drift monitor', status: 'warn', detail: '2 features over PSI threshold' },
      { key: 'bias', label: 'Fairness audit', status: 'pass', detail: 'Within policy bounds' },
      { key: 'lineage', label: 'Upstream sync', status: 'pass', detail: 'All sources materialized' },
      {
        key: 'publish',
        label: 'Publish gate',
        status: 'fail',
        detail: 'Tracker: published step did not complete',
      },
    ],
  },
  'ddp-2024-002': {
    lineageName: 'order_revenue_analytics',
    techTags: ['Spark', 'Kubeflow', 'Jupyter', 'S3'],
    logoId: 'spark',
    validations: [
      { key: 'schema', label: 'Schema contract', status: 'pass' },
      { key: 'cost', label: 'Compute budget', status: 'pass', detail: 'Under monthly cap' },
      { key: 'partition', label: 'Partition keys', status: 'pass' },
      { key: 'dq', label: 'Great Expectations', status: 'warn', detail: '3 expectations skipped (empty batch)' },
    ],
  },
  'ddp-2024-004': {
    lineageName: 'clv_churn_risk_layer',
    techTags: ['Jupyter', 'Kubeflow', 'Spark', 'S3'],
    logoId: 'delta',
    validations: [
      { key: 'schema', label: 'Schema contract', status: 'pass' },
      { key: 'sla', label: 'Freshness SLA', status: 'fail', detail: 'Upstream model stale' },
      { key: 'dep', label: 'Dependency lock', status: 'fail', detail: 'Blocked on customer_ltv_model' },
    ],
  },
  'adp-2024-001': {
    lineageName: 'Data Conditioning (Silver +)',
    techTags: ['Kubeflow', 'Spark', 'S3'],
    logoId: 'kubeflow',
    validations: [
      { key: 'schema', label: 'Aggregation schema', status: 'pass' },
      { key: 'recon', label: 'Finance reconciliation', status: 'warn', detail: '1 subsidiary pending sign-off' },
      { key: 'acl', label: 'Access policies', status: 'pass' },
      { key: 'backup', label: 'Snapshot retention', status: 'pass' },
    ],
  },
  'pds-2024-001': {
    lineageName: 'enterprise_customer_data',
    logoId: 's3',
    validations: [
      { key: 'ingest', label: 'Ingestion health', status: 'pass' },
      { key: 'encrypt', label: 'Encryption at rest', status: 'pass' },
      { key: 'catalog', label: 'Business glossary', status: 'warn', detail: '12 columns lack business defs' },
    ],
  },
  'pds-2024-002': {
    lineageName: 'customer_lifetime_value_bronze',
    logoId: 'snowflake',
    validations: [
      { key: 'ingest', label: 'Bronze ingest', status: 'pass' },
      { key: 'dedupe', label: 'Survivorship rules', status: 'pass' },
    ],
  },
  'cds-2024-009': {
    lineageName: 'clv_feature_store',
    techTags: ['Kubeflow', 'Spark', 'S3'],
    logoId: 'snowflake',
    description: 'Materialized feature set for training and batch scoring.',
    validations: [
      { key: 'fresh', label: 'Feature TTL', status: 'pass' },
      { key: 'nulls', label: 'Null rate bounds', status: 'pass' },
      { key: 'keys', label: 'Entity key integrity', status: 'pass' },
    ],
  },
  'cds-2024-010': {
    lineageName: 'clv_label_store',
    techTags: ['Jupyter', 'Spark', 'S3'],
    logoId: 'warehouse',
    validations: [
      { key: 'window', label: 'Label windows', status: 'pass' },
      { key: 'leak', label: 'Leakage checks', status: 'warn', detail: 'Review cohort overlap Q2' },
    ],
  },
  'dw-2024-001': {
    lineageName: 'partner_revenue_signals',
    techTags: ['S3', 'Spark'],
    logoId: 's3',
    description: 'Partner SFTP → landing zone → curated partner signals.',
    validations: [
      { key: 'contract', label: 'Partner file contract', status: 'pass' },
      { key: 'virus', label: 'Malware scan', status: 'pass' },
      { key: 'pii', label: 'PII attestation', status: 'pending', detail: 'Awaiting DPA renewal' },
    ],
  },
  'cdp-2024-001': {
    lineageName: 'realtime_clv_scores',
    techTags: ['Kubeflow', 'Spark', 'S3'],
    logoId: 'delta',
    validations: [
      { key: 'lat', label: 'Serving latency p99', status: 'pass', detail: '42ms' },
      { key: 'cache', label: 'Cache coherence', status: 'pass' },
      { key: 'consumer', label: 'Downstream SLOs', status: 'warn', detail: 'CRM shard warming slow' },
    ],
  },
  'cdp-2024-002': {
    lineageName: 'order_revenue_serving_layer',
    techTags: ['Jupyter', 'Kubeflow', 'S3'],
    logoId: 'jupyter',
    validations: [
      { key: 'spec', label: 'Schema contract lint', status: 'pass' },
      { key: 'rate', label: 'Rate limits', status: 'pass' },
    ],
  },
  'cds-2024-011': {
    lineageName: 'order_revenue_enrichment',
    logoId: 'spark',
    validations: [
      { key: 'join', label: 'Join cardinality', status: 'pass' },
      { key: 'dq', label: 'Referential integrity', status: 'pass' },
    ],
  },
  'cds-2024-001': {
    lineageName: 'customer_demographics',
    logoId: 's3',
    validations: [
      { key: 'acl', label: 'Column ACLs', status: 'warn', detail: 'Restricted fields masked' },
      { key: 'schema', label: 'Hive metastore', status: 'pass' },
    ],
  },
  'cds-2024-002': {
    lineageName: 'customer_transactions',
    logoId: 'snowflake',
    validations: [
      { key: 'volume', label: 'Daily volume', status: 'pass' },
      { key: 'late', label: 'Late arriving facts', status: 'pass' },
    ],
  },
  'ads-2024-001': {
    lineageName: 'legacy_customer_feed',
    logoId: 'warehouse',
    validations: [
      { key: 'compat', label: 'Legacy format', status: 'warn', detail: 'Non-standard date encoding' },
      { key: 'sla', label: 'Ingest SLA', status: 'pass' },
    ],
  },
};

const PIPELINE_STEP_PRESENTATION = {
  data_bucket: {
    lineageName: 'data_bucket',
    description: 'Landing intake for this upstream feed before aggregated dataset creation.',
    techTags: ['S3', 'Landing zone'],
    logoId: 's3',
    logoLabel: 'Data bucket',
    footerStatusLabel: 'In bucket',
    validations: [
      { key: 'land', label: 'Landing prefix ACL', status: 'pass', detail: 'Write scoped to partition' },
      { key: 'encrypt', label: 'Encryption at rest', status: 'pass' },
      { key: 'size', label: 'Object size limits', status: 'pass' },
    ],
    materializedSuffix: 'bucket',
  },
  scanning: {
    lineageName: 'Aggregated dataset creation',
    description:
      'Build the aggregated dataset from landed inputs: choose grain, roll up metrics, assign stable keys, and emit partitioned artifacts before Data Movement.',
    techTags: ['Spark', 'Delta', 'S3'],
    logoId: 'spark',
    logoLabel: 'Spark',
    footerStatusLabel: 'Aggregated',
    validations: [
      { key: 'grain', label: 'Aggregation grain', status: 'pass', detail: 'Partition scheme aligned to SLA' },
      { key: 'roll', label: 'Metric rollups', status: 'pass', detail: 'Sum / count / distinct approx stable vs raw' },
      { key: 'keys', label: 'Surrogate keys', status: 'pass', detail: 'Deterministic IDs for conformed dims' },
      { key: 'card', label: 'Cardinality watch', status: 'warn', detail: 'High-cardinality dim flagged for review' },
    ],
    materializedSuffix: 'aggregate',
  },
  conditioning: {
    lineageName: 'Data Movement',
    description:
      'Orchestrated moves between zones and clusters: bandwidth-aware copies, integrity checks at rest, and handoff into OCR.',
    techTags: ['Spark', 'Delta', 'S3'],
    logoId: 'spark',
    logoLabel: 'Data Movement',
    footerStatusLabel: 'Moved',
    validations: [
      { key: 'copy', label: 'Cross-zone copy', status: 'pass', detail: 'Incremental sync completed within window' },
      { key: 'integrity', label: 'Checksum verification', status: 'pass', detail: 'Object ETags matched source' },
      { key: 'route', label: 'Routing / ACL handoff', status: 'pass', detail: 'Destination bucket policies applied' },
      { key: 'burst', label: 'Throughput variance', status: 'warn', detail: 'Burst throttled per egress policy' },
    ],
    materializedSuffix: 'movement',
  },
  data_validation: {
    lineageName: 'OCR',
    description:
      'Optical character recognition and layout extraction from scans and PDFs: deskew, language detection, and structured field candidates.',
    techTags: ['Vision OCR', 'PDF'],
    logoId: 'scan',
    logoLabel: 'OCR',
    footerStatusLabel: 'Parsed',
    validations: [
      { key: 'deskew', label: 'Deskew & DPI', status: 'pass', detail: 'Pages normalized for OCR engine' },
      { key: 'language', label: 'Language detection', status: 'pass', detail: 'Primary locale en-US (0.94)' },
      { key: 'layout', label: 'Layout regions', status: 'pass', detail: 'Tables and running text segmented' },
      { key: 'conf', label: 'Low-confidence spans', status: 'warn', detail: '3 blocks below 85% confidence' },
    ],
    materializedSuffix: 'ocr',
  },
  write: {
    lineageName: 'Data Conditioning (Bronze)',
    description:
      'Bronze-layer conditioning on landed objects: standard layouts, typed columns, partition keys, and lineage stamps before OCR.',
    techTags: ['Kubeflow', 'Spark', 'Delta', 'S3'],
    logoId: 'kubeflow',
    logoLabel: 'Kubeflow',
    footerStatusLabel: 'Bronze written',
    validations: [
      { key: 'layout', label: 'Bronze path layout', status: 'pass', detail: 'Hive-style partitions enforced' },
      { key: 'types', label: 'Raw → bronze types', status: 'pass', detail: 'Casts + nullable rules applied' },
      { key: 'lineage', label: 'Bronze lineage stamp', status: 'pass', detail: 'Source URI + ingest batch id recorded' },
      { key: 'dup', label: 'Late-batch overlap', status: 'warn', detail: '1 partition overlap resolved by ingest_time' },
    ],
    materializedSuffix: 'bronze',
  },
};

/** Synthetic pipeline nodes inserted before the focal asset in the lineage graph. */
export function getPipelineStepLineagePresentation(step, focusAsset, opts = {}) {
  const upstreamAsset = opts?.upstreamAsset;
  const pipelineFileCount = fileCountForCatalogAsset(focusAsset);

  if (step === 'data_bucket') {
    const cfg = PIPELINE_STEP_PRESENTATION.data_bucket;
    const fid = focusAsset?.id || 'asset';
    const labelSource =
      upstreamAsset?.name || upstreamAsset?.title || upstreamAsset?.id || cfg.lineageName;
    const lineageName = `${toSnakeCaseLabel(labelSource)}_data_bucket`;
    const t = materializedLabelForId(`${fid}_${cfg.materializedSuffix}`);
    return {
      lineageName,
      description: cfg.description,
      techTags: cfg.techTags,
      unsyncedCount: null,
      materializedLabel: t,
      logoId: cfg.logoId,
      logoLabel: cfg.logoLabel,
      footerStatusLabel: cfg.footerStatusLabel,
      validations: stampValidationRuleIds(lineageName, cfg.validations),
      fileCount: pipelineFileCount,
    };
  }

  const cfg = PIPELINE_STEP_PRESENTATION[step];
  if (!cfg) {
    return {
      lineageName: 'pipeline_step',
      description: 'Pipeline step',
      techTags: [],
      unsyncedCount: null,
      materializedLabel: '—',
      logoId: 'default',
      logoLabel: 'Step',
      footerStatusLabel: 'Completed',
      validations: [],
      fileCount: pipelineFileCount,
    };
  }
  const fid = focusAsset?.id || 'asset';
  const t = materializedLabelForId(`${fid}_${cfg.materializedSuffix}`);
  return {
    lineageName: cfg.lineageName,
    description: cfg.description,
    techTags: cfg.techTags,
    unsyncedCount: null,
    materializedLabel: t,
    logoId: cfg.logoId,
    logoLabel: cfg.logoLabel,
    footerStatusLabel: cfg.footerStatusLabel,
    validations: stampValidationRuleIds(cfg.lineageName, cfg.validations),
    fileCount: pipelineFileCount,
  };
}

export function getLineagePresentation(asset) {
  if (!asset) {
    return {
      lineageName: 'asset',
      description: 'No description',
      techTags: ['S3'],
      unsyncedCount: null,
      materializedLabel: '—',
      logoId: 'default',
      logoLabel: 'Catalog',
      footerStatusLabel: 'Written',
      validations: [],
      fileCount: 0,
    };
  }
  const override = LINEAGE_OVERRIDES[asset.id] || {};
  const lineageName = override.lineageName || toSnakeCaseLabel(asset.name || asset.title);
  const rawDesc = (override.description ?? asset.description ?? '').trim();
  const description =
    rawDesc.length > 0 ? (rawDesc.length > 90 ? `${rawDesc.slice(0, 87)}…` : rawDesc) : 'No description';
  const techTags = override.techTags || TECH_BY_TYPE[asset.type] || ['S3', 'Parquet'];
  const unsyncedCount = asset.stale ? 1 : null;
  const validations = stampValidationRuleIds(lineageName, override.validations || buildDefaultValidations(asset));
  const logoId = override.logoId || inferLogoId(techTags, asset.type);
  const logoLabel = override.logoLabel || `${logoId} platform`;

  return {
    lineageName,
    description,
    techTags,
    unsyncedCount,
    materializedLabel: materializedLabelForId(asset.id),
    logoId,
    logoLabel,
    footerStatusLabel: 'Written',
    validations,
    fileCount: fileCountForCatalogAsset(asset),
    runSortKey: override.runSortKey,
    runId: override.runId,
  };
}

export function summarizeLineageValidations(validations) {
  return validations.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, pending: 0 }
  );
}
