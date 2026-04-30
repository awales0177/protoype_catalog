/**
 * Sample / demo data and display defaults used across the app.
 * Replace or override these when wiring to real APIs or config.
 */

import { LakeAreaIcon, WarehouseIcon, WaterIcon, RocketIcon } from '../icons';

// ----- Search page -----
export const SEARCH_TABS = [
  { id: 'all', label: 'All results' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'data-products', label: 'Data Products' },
  { id: 'curated-lists', label: 'Curated Lists' },
];

export const SEARCH_DROPDOWN_META_DEFAULTS = {
  owner: 'Data Governance Team',
  lastUpdated: 'Mar 12, 2025',
  keyMetadataLabel: 'Key metadata',
};

// ----- Search filters (useSearchResults) -----
export const DATA_PRODUCT_TYPES = ['Aggregated data product', 'Derived data product', 'Child data product'];
export const TOPIC_TYPES = ['Topic'];
export const DATA_PRODUCT_FILTER_TYPES = [...DATA_PRODUCT_TYPES, ...TOPIC_TYPES, 'Transfer record'];
export const BRONZE_PARENT_DATASET_IDS = ['pds-2024-002', 'pds-2024-003'];

export const DATASET_FILTER_OPTIONS = [
  { typeValue: 'Parent dataset', label: 'Parent' },
  { typeValue: 'Child dataset', label: 'Child' },
  { typeValue: 'Adoption record', label: 'Adopted' },
];

export const DATA_PRODUCT_FILTER_OPTIONS = [
  { typeValue: 'Aggregated data product', label: 'Aggregated' },
  { typeValue: 'Derived data product', label: 'Derived' },
  { typeValue: 'Transfer record', label: 'Transfer' },
  { typeValue: 'Topic', label: 'Topic' },
];

/** Reference copy for the search results “record types” info modal (grouped). */
export const SEARCH_RECORD_TYPE_GROUPS = [
  {
    title: 'Datasets',
    items: [
      { name: 'Parent dataset', description: 'Top-level dataset that groups related child and adopted sources.' },
      { name: 'Child dataset', description: 'Dataset derived from or scoped under a parent dataset.' },
      { name: 'Adoption record', description: 'Record representing data adopted from an external or legacy system.' },
    ],
  },
  {
    title: 'Data products & related',
    items: [
      { name: 'Aggregated data product', description: 'Rollups and summaries built from one or more datasets.' },
      { name: 'Derived data product', description: 'Transformed or modeled output, often layered (e.g. bronze to gold).' },
      { name: 'Child data product', description: 'Product scoped under a broader data product or domain.' },
      { name: 'Transfer record', description: 'Tracks movement or handoff of data between systems or stages.' },
      { name: 'Topic', description: 'Thematic grouping for governance, discovery, or domain organization.' },
    ],
  },
  {
    title: 'Curated lists',
    items: [
      { name: 'Curated list', description: 'A named collection of catalog assets maintained for a team or use case.' },
    ],
  },
];

// ----- Asset page -----
export const DATA_LAKE_OPTIONS = [
  { id: 'data-lake-prod', label: 'data-lake-prod', Icon: LakeAreaIcon },
  { id: 'data-lake-staging', label: 'data-lake-staging', Icon: WarehouseIcon },
  { id: 'data-lake-dev', label: 'data-lake-dev', Icon: WaterIcon },
  { id: 'data-lake-archive', label: 'data-lake-archive', Icon: RocketIcon },
];

export const BREADCRUMB_LABELS = {
  bronze: 'Bronze',
  curatedLists: 'CuratedLists',
};

// ----- Home page -----
export const DATA_LAKES = [
  { id: 'raw', Icon: RocketIcon, category: 'Landing zone', title: 'Raw Landing Zone', check: true, meta: 'Landing · 2.4 PB · s3://data-lake/raw' },
  { id: 'arc', Icon: RocketIcon, category: 'Landing zone', title: 'Compliance Archive', check: true, meta: 'Cold storage · 1.1 PB · 7-year retention' },
  { id: 'cur-lakehouse', Icon: LakeAreaIcon, category: 'Lakehouse', title: 'Curated Analytics Lakehouse', check: false, meta: 'Curated · 456 TB · 12,840 objects' },
  { id: 'ds', Icon: LakeAreaIcon, category: 'Lakehouse', title: 'Data Science Lakehouse', check: false, meta: 'Sandbox · 89 TB · abfss://dlake/ds' },
  { id: 'customer360', Icon: WaterIcon, category: 'Lake', title: 'Customer 360 Lake', check: false, meta: 'Bronze / Silver / Gold · 189 TB' },
  { id: 'cur', Icon: WarehouseIcon, category: 'Warehouse', title: 'Curated Analytics Warehouse', check: false, meta: 'Curated · 456 TB · 12,840 objects' },
];

export const HOME_PAGE_SAMPLE = {
  dataGovernanceDashboardDesc: 'Dashboard for the Data Governance Office',
};

// ----- Asset details (overview defaults) -----
export const ASSET_OVERVIEW_DEFAULTS = {
  owner: 'Data Governance Team',
  ownerHref: '#owner',
  lastUpdated: 'Mar 12, 2025',
  status: 'Approved',
  sourceSystem: 'SYS CRM Cloud',
  s3LocationBase: 's3://data-lake-prod/products',
  dataVolumeLast30Days: '2.4 TB',
  productScores: [
    { label: 'Freshness score', value: 94 },
    { label: 'Data quality score', value: 88 },
    { label: 'Data validation score', value: 91 },
  ],
  overviewLinkCards: [
    { title: 'Pipeline', desc: 'View pipeline definition and runs', href: '#pipeline' },
    { title: 'Product agreement', desc: 'SLA and terms', href: '#product-agreement' },
  ],
};

// ----- Data profiles tab -----
export const DATA_PROFILES_FILE_TYPES = [
  { label: '.parquet', count: '12,840' },
  { label: '.json', count: '3,291' },
  { label: '.csv', count: '1,056' },
  { label: '.avro', count: '892' },
  { label: '.orc', count: '445' },
];

export const DATA_PROFILES_TAGS = [
  { label: 'Analytics', count: '24' },
  { label: 'Landing', count: '18' },
  { label: 'Curated', count: '12' },
  { label: 'PII', count: '9' },
  { label: 'Encrypted', count: '6' },
];

export const DATA_PROFILES_LANGUAGES = [
  { label: 'SQL', count: '42' },
  { label: 'Python', count: '28' },
  { label: 'Scala', count: '15' },
  { label: 'R', count: '11' },
  { label: 'Java', count: '8' },
];

export const DATA_PROFILES_SCHEMA_GROUPS = [
  { chips: ['id', 'name', 'email', 'created_at'], count: 12 },
  { chips: ['order_id', 'customer_id', 'amount', 'status'], count: 8 },
  { chips: ['sku', 'name', 'category', 'price'], count: 5 },
];

// ----- Data volume chart -----
export function getDataVolumeLast30Days() {
  const data = [];
  const start = new Date();
  start.setDate(start.getDate() - 30);
  for (let i = 0; i <= 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const t = i / 30;
    const base = 90 + Math.sin(t * Math.PI * 2) * 15;
    const noise = (Math.random() - 0.5) * 20;
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(Math.max(70, Math.min(125, base + noise))),
    });
  }
  return data;
}

// ----- Globe / region modal -----
export const REGION_OPTIONS = [
  { id: 'americas', label: 'Americas' },
  { id: 'emea', label: 'EMEA' },
  { id: 'apac', label: 'APAC' },
  { id: 'global', label: 'Global' },
];
