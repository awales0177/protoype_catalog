/** Mock data and helpers for asset detail page (attachments, comments, history, tracker, bucket). */

export const TRACKER_STEPS = [
  { id: 'ingested', label: 'Ingested', status: 'done' },
  { id: 'validated', label: 'Validated', status: 'done' },
  { id: 'profiled', label: 'Profiled', status: 'current' },
  { id: 'published', label: 'Published', status: 'pending' },
  { id: 'consumed', label: 'Consumed', status: 'pending' },
];

export const TRACKER_STEP_FILES = {
  ingested: [
    { id: 'ing-1', fileName: 'batch_20240301.json.gz', size: '2.4 MB', date: '2024-03-01 08:12', status: 'Completed' },
    { id: 'ing-2', fileName: 'batch_20240302.json.gz', size: '2.1 MB', date: '2024-03-02 07:45', status: 'Completed' },
    { id: 'ing-3', fileName: 'inventory.parquet', size: '15.2 MB', date: '2024-03-02 14:20', status: 'Completed' },
  ],
  validated: [
    { id: 'val-1', fileName: 'batch_20240301.json.gz', size: '2.4 MB', date: '2024-03-01 08:18', status: 'Passed' },
    { id: 'val-2', fileName: 'batch_20240302.json.gz', size: '2.1 MB', date: '2024-03-02 07:52', status: 'Passed' },
    { id: 'val-3', fileName: 'inventory.parquet', size: '15.2 MB', date: '2024-03-02 14:28', status: 'Passed' },
  ],
  profiled: [
    { id: 'pro-1', fileName: 'batch_20240301.json.gz', size: '2.4 MB', date: '2024-03-01 08:22', status: 'Profiled' },
    { id: 'pro-2', fileName: 'batch_20240302.json.gz', size: '2.1 MB', date: '2024-03-02 07:58', status: 'In progress' },
    { id: 'pro-3', fileName: 'inventory.parquet', size: '15.2 MB', date: '—', status: 'Pending' },
  ],
  published: [],
  consumed: [
    { id: 'con-1', fileName: 'batch_20240301.json.gz', size: '2.4 MB', date: '2024-03-03 09:00', status: 'Accessed' },
  ],
};

/** For a given asset and step index, return effective step status (done | failed | current | pending). */
export function getTrackerStepStatus(asset, step, stepIndex) {
  const failedId = asset.trackerFailedStepId;
  if (asset.feed && failedId) {
    const failedIndex = TRACKER_STEPS.findIndex((s) => s.id === failedId);
    if (stepIndex < failedIndex) return 'done';
    if (step.id === failedId) return 'failed';
    return 'pending';
  }
  if (asset.feed) return 'done';
  return step.status;
}

/** Mock attachments for the record. */
export function getAssetAttachments(assetId) {
  return [
    { id: 1, name: 'Data_Dictionary_v2.xlsx', size: '124 KB', date: '2024-03-12', uploadedBy: 'Jordan Lee', type: 'xlsx' },
    { id: 2, name: 'Schema_ER_diagram.pdf', size: '892 KB', date: '2024-03-10', uploadedBy: 'Sam Chen', type: 'pdf' },
    { id: 3, name: 'Sample_export_20240301.csv', size: '2.1 MB', date: '2024-03-08', uploadedBy: 'Alex Rivera', type: 'csv' },
    { id: 4, name: 'Ingestion_runbook.md', size: '18 KB', date: '2024-03-05', uploadedBy: 'Jordan Lee', type: 'md' },
    { id: 5, name: 'PII_field_mapping.docx', size: '256 KB', date: '2024-03-01', uploadedBy: 'Sam Chen', type: 'docx' },
    { id: 6, name: 'Validation_rules.yaml', size: '4 KB', date: '2024-02-28', uploadedBy: 'Alex Rivera', type: 'yaml' },
    { id: 7, name: 'Legacy_source_spec.pdf', size: '1.2 MB', date: '2024-02-25', uploadedBy: 'Jordan Lee', type: 'pdf' },
    { id: 8, name: 'Sample_export_20240215.csv', size: '1.8 MB', date: '2024-02-15', uploadedBy: 'Sam Chen', type: 'csv' },
    { id: 9, name: 'Data_quality_report_Q1.xlsx', size: '445 KB', date: '2024-02-10', uploadedBy: 'Alex Rivera', type: 'xlsx' },
    { id: 10, name: 'README_attribution.txt', size: '2 KB', date: '2024-02-05', uploadedBy: 'Jordan Lee', type: 'txt' },
    { id: 11, name: 'Contact_list_template.xlsx', size: '89 KB', date: '2024-01-30', uploadedBy: 'Sam Chen', type: 'xlsx' },
    { id: 12, name: 'Approval_audit_log.pdf', size: '312 KB', date: '2024-01-20', uploadedBy: 'Alex Rivera', type: 'pdf' },
  ];
}

/** Mock comments for the record. */
export function getInitialAssetComments(assetId) {
  return [
    { id: 1, author: 'Sam Chen', authorInitials: 'SC', date: '2024-03-12', time: '14:22', body: 'Can we add a note in the description that this feed includes PII? I\'ll update the classification once that\'s in.' },
    { id: 2, author: 'Jordan Lee', authorInitials: 'JL', date: '2024-03-12', time: '15:08', body: 'Done — added to description and set classification to Customer Personal Info.' },
    { id: 3, author: 'Alex Rivera', authorInitials: 'AR', date: '2024-03-10', time: '09:15', body: 'Linking this to the new source system ticket. Will migrate off legacy next quarter.' },
  ];
}

/** Mock change history for the record. Each entry describes what changed. */
export function getAssetHistoryLogs(assetId) {
  return [
    { id: 1, date: '2024-03-14', time: '10:32', user: 'Jordan Lee', userInitials: 'JL', action: 'Updated', changes: [{ id: 'c1-1', field: 'Description', oldValue: 'Legacy customer feed from CRM.', newValue: 'Legacy customer feed from CRM. Includes PII fields for matching.' }] },
    { id: 2, date: '2024-03-12', time: '14:15', user: 'Sam Chen', userInitials: 'SC', action: 'Status changed', changes: [{ id: 'c2-1', field: 'Status', oldValue: 'Draft', newValue: 'Approved' }] },
    { id: 3, date: '2024-03-10', time: '09:00', user: 'Alex Rivera', userInitials: 'AR', action: 'Updated', changes: [{ id: 'c3-1', field: 'Tags', oldValue: 'From Source Asset, Legacy', newValue: 'From Source Asset, Legacy, PII' }, { id: 'c3-2', field: 'Data Classification', oldValue: 'Internal', newValue: 'Customer Personal Info' }] },
    { id: 4, date: '2024-03-08', time: '16:45', user: 'Jordan Lee', userInitials: 'JL', action: 'Created', changes: [{ id: 'c4-1', field: 'Record', oldValue: null, newValue: 'Asset created and linked to source system.' }] },
    { id: 5, date: '2024-03-05', time: '11:20', user: 'Sam Chen', userInitials: 'SC', action: 'Updated', changes: [{ id: 'c5-1', field: 'Last Synced', oldValue: '—', newValue: 'Dec. 11, 2023' }] },
  ];
}

/** Mock bucket tree: path segments -> { folders, files, base }. */
export function getBucketEntriesAtPath(assetId, pathSegments, lakeName = 'data-lake-prod') {
  const key = pathSegments.join('/');
  const base = `s3://${lakeName}/datasets/${assetId || 'default'}`;
  const all = {
    '': { folders: ['raw', 'processed', 'schema', 'checks'], files: ['manifest.json', 'README.md'] },
    raw: { folders: ['incoming', 'landing'], files: ['_SUCCESS'] },
    'raw/incoming': { folders: [], files: ['batch_20240301.json.gz', 'batch_20240302.json.gz'] },
    'raw/landing': { folders: [], files: ['inventory.parquet', 'metadata.json'] },
    processed: { folders: ['daily', 'snapshots'], files: ['_SUCCESS'] },
    'processed/daily': { folders: [], files: ['part-00001.parquet', 'part-00002.parquet'] },
    'processed/snapshots': { folders: [], files: ['latest.parquet', 'schema.avsc'] },
    schema: { folders: [], files: ['table.ddl', 'columns.json'] },
    checks: { folders: ['quality'], files: ['run.log'] },
    'checks/quality': { folders: [], files: ['profiles.json', 'rules.yaml'] },
  };
  const entry = all[key] || { folders: [], files: [] };
  return { ...entry, base };
}

/** Root folders of the bucket with recursive file count; each row may include one level of sub-prefix breakdown. */
export function getBucketRootDistribution(assetId, lakeName = 'data-lake-prod') {
  const root = getBucketEntriesAtPath(assetId, [], lakeName);

  const countUnderPath = (pathSegments) => {
    let fileCount = 0;
    const walk = (segs) => {
      const e = getBucketEntriesAtPath(assetId, segs, lakeName);
      fileCount += e.files.length;
      e.folders.forEach((f) => walk([...segs, f]));
    };
    walk(pathSegments);
    return fileCount;
  };

  return root.folders.map((folder) => {
    const entry = getBucketEntriesAtPath(assetId, [folder], lakeName);
    const children = entry.folders.map((sub) => ({
      name: sub,
      fileCount: countUnderPath([folder, sub]),
    }));
    return {
      name: folder,
      fileCount: countUnderPath([folder]),
      children,
    };
  });
}

/** Model summary card for product Details secondary tab (no field-level schema table). */
export const DEFAULT_PRODUCT_MODEL_INFO = {
  logicalName: 'cars',
  logicalLabel: 'Cars',
  version: '1.2',
  domain: 'Automotive / Sales',
  format: 'Parquet · CSV-compatible views',
  encoding: 'UTF-8',
  rowCardinality: 'One row per vehicle listing',
  updateFrequency: 'Batch (as available)',
  owner: 'Data Engineering',
  notes:
    'Logical model aligns with curated `cars.csv`. Consumers rely on documented fields and semantic versioning on breaking changes.',
};

/** Product agreement (Details tab) — groups listed under Providers, Producers, Consumers. */
export const DEFAULT_PRODUCT_AGREEMENT = {
  title: 'Product agreement',
  maturityLine: 'Active governed data product',
  stewardLine: 'Steward · Analytics Platform Team',
  effectiveDate: 'Jan 2024',
  providers: ['Dealer Systems Federation', 'OEM Telemetry Program', 'Legacy CRM export batch'],
  producers: ['Analytics Platform Team', 'Data Engineering — ingest', 'Data Quality guild'],
  consumers: ['Sales Analytics workspace', 'Customer 360 product', 'ML feature store · pricing models', 'Regional reporting hub'],
};

/** Default README markdown for product Documentation section (below cards). */
export const README_MARKDOWN = `# 🚗 Cars Data Product (\`cars.csv\`)

## Overview

\`cars.csv\` is a curated **data product** that provides structured, tabular information about cars, including pricing, usage, fuel characteristics, and ownership details.  
It is designed to support **analytics, reporting, and machine learning** use cases while remaining simple, portable, and easy to consume.

This dataset represents a **governed data product**, not just a raw file.

---

## Product Details

| Attribute            | Value |
|---------------------|------|
| **Product Name**     | Cars |
| **File Name**        | cars.csv |
| **Product Type**     | Analytical Dataset |
| **Data Domain**      | Automotive / Sales |
| **Format**           | CSV |
| **Granularity**      | One row per car |
| **Update Frequency** | Batch (as available) |
| **Owner**            | Data Engineering |
| **Status**           | Active |

---

## Schema

| Column Name       | Type      | Description |
|------------------|----------|-------------|
| \`Car_Name\`        | String   | Name or model of the car |
| \`Year\`            | Integer  | Year of manufacture |
| \`Selling_Price\`   | Float    | Selling price of the car |
| \`Present_Price\`   | Float    | Current market price |
| \`Kms_Driven\`      | Integer  | Total kilometers driven |
| \`Fuel_Type\`       | String   | Fuel type (Petrol, Diesel, CNG) |
| \`Seller_Type\`     | String   | Seller category (Dealer, Individual) |
| \`Transmission\`    | String   | Transmission type (Manual, Automatic) |
| \`Owner\`           | Integer  | Number of previous owners |

---

## Intended Use Cases

- 📊 Sales and pricing analysis  
- 🚘 Vehicle depreciation modeling  
- 🤖 Machine learning feature engineering  
- 📈 Market trend analysis  
- 🧪 Data quality and profiling demonstrations  

---

## Data Quality Notes

- Prices are represented as numeric values and may require normalization for currency or inflation adjustments.
- Missing or extreme values should be validated prior to model training.
- Categorical fields (\`Fuel_Type\`, \`Seller_Type\`, \`Transmission\`) may require encoding for ML workflows.

---

## Governance & Contracts

- This dataset is treated as a **Data Product**, not a raw ingest.
- Schema changes must be versioned and communicated to downstream consumers.
- Consumers should rely only on documented fields.
- Backward compatibility is maintained whenever possible.

---

## Lineage (Logical)

\`\`\`mermaid
flowchart LR
  subgraph Sources
    A[Dealer Systems]
    B[Sales CRM]
  end
  subgraph Pipeline
    C[Ingest]
    D[Validate]
    E[Transform]
  end
  subgraph Product
    F[(cars.csv)]
  end
  subgraph Consumers
    G[Sales Analytics]
    H[ML Models]
    I[Reporting]
  end
  A --> C
  B --> C
  C --> D
  D --> E
  E --> F
  F --> G
  F --> H
  F --> I
\`\`\``;
