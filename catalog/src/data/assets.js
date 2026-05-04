export const DATASET_TYPES = ['Parent dataset', 'Child dataset', 'Adoption record'];
export const DATA_PRODUCT_TYPES = ['Data product'];
const SOURCE_DATASET_TYPES = ['Parent dataset', 'Child dataset', 'Adoption record'];

export const DATA_ASSETS = [
  { id: 'pds-2024-001', type: 'Parent dataset', title: 'Enterprise Customer Data', desc: 'Master parent dataset for all customer-related sources', feed: false },
  { id: 'pds-2024-002', type: 'Parent dataset', title: 'Customer Lifetime Value', desc: 'Bronze layer dataset for Customer Lifetime Value data product', feed: false },
  { id: 'pds-2024-003', type: 'Parent dataset', title: 'Order Revenue Analytics', desc: 'Bronze layer dataset for Order Revenue Analytics data product', feed: false },
  { id: 'cds-2024-001', type: 'Child dataset', title: 'Customer Demographics', desc: 'Child of Enterprise Customer Data', sourceDatasetIds: ['pds-2024-001'], feed: false, noDataAccess: true },
  { id: 'cds-2024-002', type: 'Child dataset', title: 'Customer Transactions', desc: 'Child of Enterprise Customer Data', sourceDatasetIds: ['pds-2024-001'], feed: false },
  { id: 'ads-2024-001', type: 'Adoption record', title: 'Legacy Customer Feed', desc: 'Composite ingestion from legacy CRM for staged migration.', sourceDatasetIds: ['pds-2024-001'], feed: true },
  { id: 'cds-2024-003', type: 'Child dataset', title: 'Legacy Contact Sync', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: true },
  { id: 'cds-2024-004', type: 'Child dataset', title: 'Legacy Order History', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: true },
  { id: 'cds-2024-005', type: 'Child dataset', title: 'Legacy Preference Cache', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: true },
  { id: 'cds-2024-006', type: 'Child dataset', title: 'Legacy Address Book', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: true },
  { id: 'cds-2024-007', type: 'Child dataset', title: 'Legacy Subscription Feed', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: true },
  { id: 'cds-2024-008', type: 'Child dataset', title: 'Legacy Customer Reference', desc: 'Child of Legacy Customer Feed', sourceDatasetIds: ['ads-2024-001'], feed: false, stale: true },
  { id: 'adp-2024-001', type: 'Data product', title: 'Monthly Sales Summary', desc: 'Aggregated from Enterprise Customer Data', sourceDatasetIds: ['pds-2024-001'], feed: true },
  { id: 'ddp-2024-001', type: 'Data product', title: 'Customer Lifetime Value', desc: 'Derived from Bronze layer Customer Lifetime Value dataset', sourceDatasetIds: ['pds-2024-002'], feed: true, trackerFailedStepId: 'published' },
  { id: 'ddp-2024-002', type: 'Data product', title: 'Order Revenue Analytics', desc: 'Derived from Bronze layer Order Revenue Analytics dataset', sourceDatasetIds: ['pds-2024-003'], feed: false },
  { id: 'cds-2024-009', type: 'Child dataset', title: 'CLV Feature Store', desc: 'Curated features for lifetime value scoring pipelines', sourceDatasetIds: ['pds-2024-002'], feed: false },
  { id: 'cds-2024-010', type: 'Child dataset', title: 'CLV Label Store', desc: 'Historical labels and outcome windows for model training', sourceDatasetIds: ['pds-2024-002'], feed: false },
  { id: 'cds-2024-011', type: 'Child dataset', title: 'Order Revenue Enrichment', desc: 'Joined orders, promos, and fulfillment for revenue analytics', sourceDatasetIds: ['pds-2024-003'], feed: false },
  { id: 'dw-2024-001', type: 'Parent dataset', title: 'Partner Revenue Signals', desc: 'Third-party partner feed ingested into the warehouse for CLV features', feed: true },
  { id: 'cdp-2024-001', type: 'Data product', title: 'Real-time CLV Scores', desc: 'Streaming scores consumed by activation and CRM systems', sourceDatasetIds: ['pds-2024-002'], feed: true },
  { id: 'cdp-2024-002', type: 'Data product', title: 'Order Revenue Serving Layer', desc: 'Normalized revenue metrics for dashboards and downstream apps', sourceDatasetIds: ['pds-2024-003'], feed: false },
  { id: 'ddp-2024-004', type: 'Data product', title: 'CLV Churn Risk Layer', desc: 'Downstream risk scores derived from the Customer Lifetime Value model', sourceDatasetIds: ['pds-2024-002'], feed: false, stale: true },
  {
    id: 'topic-2024-001',
    type: 'Data product',
    title: 'Customer Data Governance',
    desc: 'Policies and standards for customer data quality and privacy',
    feed: false,
    sourceDatasetIds: ['pds-2024-001'],
  },
  {
    id: 'topic-2024-002',
    type: 'Data product',
    title: 'Sales & Orders',
    desc: 'Grouping for sales transactions, orders, and fulfillment domains',
    feed: false,
    sourceDatasetIds: ['pds-2024-003'],
  },
  {
    id: 'topic-2024-003',
    type: 'Data product',
    title: 'Product Information',
    desc: 'Product catalog, inventory, and taxonomy context',
    feed: false,
    sourceDatasetIds: ['pds-2024-001'],
  },
];

/** Get parent datasets, child datasets, sibling datasets (only for Child dataset – others with same parent), and data products */
export function getRelatedAssets(datasetId) {
  const asset = DATA_ASSETS.find((a) => a.id === datasetId);
  const sourceIds = asset && (asset.sourceDatasetIds || []).length > 0 ? asset.sourceDatasetIds : [];
  const parentDatasets = sourceIds.length > 0
    ? DATA_ASSETS.filter((a) => sourceIds.includes(a.id))
    : [];
  const childDatasets = DATA_ASSETS.filter(
    (a) => a.type === 'Child dataset' && (a.sourceDatasetIds || []).includes(datasetId)
  );
  const siblingDatasets = asset && asset.type === 'Child dataset' && sourceIds.length > 0
    ? DATA_ASSETS.filter(
        (a) => a.id !== datasetId && a.type === 'Child dataset' && (a.sourceDatasetIds || []).some((sid) => sourceIds.includes(sid))
      )
    : [];
  const dataProducts = DATA_ASSETS.filter(
    (a) => DATA_PRODUCT_TYPES.includes(a.type) && (a.sourceDatasetIds || []).includes(datasetId)
  );
  return { parentDatasets, childDatasets, siblingDatasets, dataProducts };
}

export function isSourceDatasetType(type) {
  return SOURCE_DATASET_TYPES.includes(type);
}

export function filterAssetsByQuery(assets, query) {
  const q = query.trim().toLowerCase();
  if (!q) return assets;
  return assets.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      (a.desc && a.desc.toLowerCase().includes(q)) ||
      a.type.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
  );
}

/** Normalize a list asset to detail-view shape (single source of truth for asset page). */
function toDetailAsset(a) {
  return {
    id: a.id,
    name: a.title,
    title: a.title,
    description: a.desc ?? '',
    type: a.type,
    tags: a.tags ?? [],
    feed: a.feed ?? false,
    stale: a.stale ?? false,
    noDataAccess: a.noDataAccess ?? false,
    trackerFailedStepId: a.trackerFailedStepId ?? null,
    parentId: (a.sourceDatasetIds && a.sourceDatasetIds[0]) || null,
  };
}

/** Map of asset id -> detail shape for relationship helpers and asset page. */
export const ASSETS_BY_ID = Object.fromEntries(
  DATA_ASSETS.map((a) => [a.id, toDetailAsset(a)])
);

/** Get asset by id for detail page; returns fallback if not found. */
export function getAssetById(id) {
  const key = (id || '').toLowerCase();
  const found = ASSETS_BY_ID[key];
  if (found) return found;
  return {
    id: key,
    name: id || 'Unknown',
    title: id || 'Unknown',
    description: 'No description available.',
    type: 'Parent dataset',
    tags: [],
    feed: false,
    stale: false,
    noDataAccess: false,
    trackerFailedStepId: null,
    parentId: null,
  };
}
