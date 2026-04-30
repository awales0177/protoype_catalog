/**
 * Transformation toolchain (“tool records”) for data product catalog assets.
 * @typedef {{ toolRecordId: string, name: string, version: string, transformRole?: string }} ProductToolRecord
 */

/** Default stack — shown when no per-asset override exists */
export const DEFAULT_PRODUCT_TOOLING = [
  {
    toolRecordId: 'tool-dbt-core',
    name: 'dbt',
    version: '1.8.4',
    transformRole: 'SQL transforms, documentation & tests',
  },
  {
    toolRecordId: 'tool-apache-spark',
    name: 'Apache Spark',
    version: '3.5.1',
    transformRole: 'Distributed joins & aggregations',
  },
  {
    toolRecordId: 'tool-airflow',
    name: 'Apache Airflow',
    version: '2.9.2',
    transformRole: 'Pipeline orchestration',
  },
  {
    toolRecordId: 'tool-great-expectations',
    name: 'Great Expectations',
    version: '0.18.12',
    transformRole: 'Expectations & validation in-flight',
  },
];

/** Per-asset pipelines — illustrative variance across products */
const BY_ASSET_ID = {
  'ddp-2024-001': [
    {
      toolRecordId: 'tool-spark-sql',
      name: 'Apache Spark SQL',
      version: '3.5.1',
      transformRole: 'Monthly rollup & cube builds',
    },
    {
      toolRecordId: 'tool-trino',
      name: 'Trino',
      version: '449',
      transformRole: 'Federated reads prior to materialization',
    },
    {
      toolRecordId: 'tool-airflow',
      name: 'Apache Airflow',
      version: '2.9.2',
      transformRole: 'Orchestration',
    },
  ],
  'xfer-2024-001': [
    {
      toolRecordId: 'tool-aws-dms',
      name: 'AWS Database Migration Service',
      version: '3.5.2',
      transformRole: 'Change capture & initial load',
    },
    {
      toolRecordId: 'tool-aws-glue',
      name: 'AWS Glue',
      version: '5.0',
      transformRole: 'Schema evolution & job bookmarks',
    },
    {
      toolRecordId: 'tool-custom-validator',
      name: 'Lake validation service',
      version: '2024.06.1',
      transformRole: 'Row counts & checksum gates between stages',
    },
  ],
  'cdp-2024-001': [
    {
      toolRecordId: 'tool-flink',
      name: 'Apache Flink',
      version: '1.19.1',
      transformRole: 'Stateful stream scoring',
    },
    {
      toolRecordId: 'tool-kafka',
      name: 'Apache Kafka',
      version: '3.7.0',
      transformRole: 'Event transport',
    },
    {
      toolRecordId: 'tool-feast',
      name: 'Feast',
      version: '0.37.0',
      transformRole: 'Online feature retrieval',
    },
  ],
};

/**
 * @param {string} assetId
 * @returns {ProductToolRecord[]}
 */
export function getProductToolingForAsset(assetId) {
  const key = (assetId || '').toLowerCase();
  const rows = BY_ASSET_ID[key] || DEFAULT_PRODUCT_TOOLING;
  return rows.map((r) => ({ ...r }));
}
