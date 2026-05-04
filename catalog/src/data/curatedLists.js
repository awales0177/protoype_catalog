/** Dummy curated lists for the search CuratedLists tab. */

export const CURATED_LISTS = [
  {
    id: 'cl-customer-001',
    title: 'Customer data sources',
    description: 'All customer-related datasets and feeds used for analytics and identity resolution.',
    assetIds: ['pds-2024-001', 'cds-2024-001', 'cds-2024-002', 'ads-2024-001', 'cds-2024-003', 'cdp-2024-001'],
    owner: 'Data Governance Team',
    curators: ['Jordan Lee', 'Sam Chen'],
    visibility: 'public',
    updated: '2024-03-10',
  },
  {
    id: 'cl-legacy-feed-001',
    title: 'Legacy migration feed',
    description: 'Datasets and data products sourced from or dependent on the legacy customer feed.',
    assetIds: ['ads-2024-001', 'cds-2024-003', 'cds-2024-004', 'cds-2024-005', 'cds-2024-006', 'cds-2024-007', 'cds-2024-008'],
    owner: 'Migration Team',
    curators: ['Alex Rivera', 'Jordan Lee'],
    visibility: 'private',
    updated: '2024-03-08',
  },
  {
    id: 'cl-bronze-products-001',
    title: 'Bronze-layer data products',
    description: 'Data products built on bronze-layer datasets (CLV, Order Revenue).',
    assetIds: ['pds-2024-002', 'pds-2024-003', 'ddp-2024-001', 'ddp-2024-002'],
    owner: 'Analytics Platform',
    curators: ['Sam Chen'],
    visibility: 'public',
    updated: '2024-03-12',
  },
  {
    id: 'cl-governance-001',
    title: 'Governance & taxonomy',
    description: 'Data products for governance policies, taxonomy, and quality reference contexts.',
    assetIds: ['topic-2024-001', 'topic-2024-002', 'topic-2024-003'],
    owner: 'Data Governance Team',
    curators: ['Jordan Lee', 'Alex Rivera'],
    visibility: 'private',
    updated: '2024-03-01',
  },
  {
    id: 'cl-sales-001',
    title: 'Sales and orders',
    description: 'Order revenue, transactions, and related data products.',
    assetIds: ['pds-2024-003', 'cds-2024-004', 'ddp-2024-002', 'adp-2024-001', 'cdp-2024-002', 'topic-2024-002'],
    owner: 'Revenue Analytics',
    curators: ['Sam Chen', 'Jordan Lee', 'Alex Rivera'],
    visibility: 'public',
    updated: '2024-03-14',
  },
];

/** Get a curated list by id; returns null if not found. */
export function getCuratedListById(id) {
  const key = (id || '').toLowerCase();
  const found = CURATED_LISTS.find((l) => l.id.toLowerCase() === key);
  return found || null;
}

/** Filter curated lists by search query (title and description). */
export function filterCuratedListsByQuery(lists, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return lists;
  return lists.filter(
    (list) =>
      list.title.toLowerCase().includes(q) ||
      (list.description && list.description.toLowerCase().includes(q)) ||
      (list.owner && list.owner.toLowerCase().includes(q))
  );
}
