/**
 * Prototype schema lineage: source headers, column mappings, and net-new fields.
 * Keyed by catalog asset id. Extend or replace when wiring to metadata services.
 */

const SCHEMA_LINEAGE_BY_ASSET = {
  'ddp-2024-001': {
    sourceLabel: 'Bronze · pds-2024-002 / clv_bronze_customers',
    sourceColumns: ['customer_id', 'event_ts', 'order_total', 'currency', 'region_code', 'loyalty_tier', 'email_hash'],
    transforms: [
      {
        id: 'fx',
        sources: ['order_total', 'currency'],
        target: 'order_total_usd',
        expression: 'order_total * daily_fx_to_usd(currency, event_ts)',
      },
      {
        id: 'session',
        sources: ['customer_id', 'event_ts'],
        target: 'session_key',
        expression: "sha256(concat(customer_id, ':', date_trunc('day', event_ts)))",
      },
      {
        id: 'tier',
        sources: ['loyalty_tier'],
        target: 'loyalty_tier_norm',
        expression: "upper(trim(loyalty_tier))",
      },
    ],
    addedColumns: [
      { name: 'clv_score_30d', note: 'Batch model v3 output' },
      { name: 'churn_risk_band', note: 'Deciles from score distribution' },
      { name: 'feature_version', note: 'Pinned feature store snapshot id' },
    ],
  },
  'cdp-2024-001': {
    sourceLabel: 'Gold · ddp-2024-001 / clv_scored_customers',
    sourceColumns: ['customer_id', 'session_key', 'order_total_usd', 'clv_score_30d', 'churn_risk_band', 'feature_version'],
    transforms: [
      {
        id: 'score_scale',
        sources: ['clv_score_30d'],
        target: 'clv_score_scaled',
        expression: 'round(clv_score_30d * 100, 4)',
      },
    ],
    addedColumns: [
      { name: 'stream_ingest_ts', note: 'Kafka envelope timestamp' },
      { name: 'activation_ready', note: 'Gate: score freshness & consent' },
    ],
  },
  'ddp-2024-002': {
    sourceLabel: 'Bronze · pds-2024-003 / order_revenue_raw',
    sourceColumns: ['order_id', 'placed_at', 'gross_amount', 'discount', 'tax', 'fulfillment_center'],
    transforms: [
      {
        id: 'net',
        sources: ['gross_amount', 'discount', 'tax'],
        target: 'net_revenue',
        expression: 'gross_amount - coalesce(discount, 0) + coalesce(tax, 0)',
      },
      {
        id: 'day',
        sources: ['placed_at'],
        target: 'order_date',
        expression: "cast(placed_at as date)",
      },
    ],
    addedColumns: [
      { name: 'promo_applied_flag', note: 'Joined from promo dimension' },
      { name: 'currency_normalization_key', note: 'FK to rates table' },
    ],
  },
  'adp-2024-001': {
    tables: [
      {
        id: 'enterprise-customer-events',
        sourceLabel: 'Curated · pds-2024-001 / enterprise_customer_events',
        sourceColumns: ['customer_id', 'event_type', 'event_ts', 'amount', 'sku', 'channel'],
        transforms: [
          {
            id: 'month_bucket',
            sources: ['event_ts'],
            target: 'report_month',
            expression: "date_trunc('month', event_ts)::date",
          },
          {
            id: 'rev',
            sources: ['amount', 'channel'],
            target: 'net_revenue',
            expression: 'amount * channel_adjustment(channel)',
          },
        ],
        addedColumns: [
          { name: 'rolling_3m_spend', note: 'Window over customer_id' },
          { name: 'data_quality_flag', note: 'Completeness vs contract' },
        ],
      },
      {
        id: 'dim-product-catalog',
        sourceLabel: 'Silver · pds-2024-002 / dim_product_catalog',
        sourceColumns: ['sku', 'product_family', 'list_price', 'cost_to_serve', 'active_from', 'seasonality_tag'],
        transforms: [
          {
            id: 'sku-norm',
            sources: ['sku'],
            target: 'sku_norm',
            expression: "upper(trim(regexp_replace(sku, '\\\\s+', '')))",
          },
          {
            id: 'margin',
            sources: ['list_price', 'cost_to_serve'],
            target: 'implied_margin_pct',
            expression: '(list_price - coalesce(cost_to_serve, 0)) / nullif(list_price, 0)',
          },
          {
            id: 'season',
            sources: ['seasonality_tag'],
            target: 'seasonality_bucket',
            expression: "coalesce(nullif(trim(seasonality_tag), ''), 'CORE')",
          },
        ],
        addedColumns: [
          { name: 'product_tier', note: 'Ladder from product_family' },
          { name: 'assortment_wave_id', note: 'Planning snapshot FK' },
        ],
      },
      {
        id: 'dim-reporting-calendar',
        sourceLabel: 'Reference · shared / dim_reporting_calendar',
        sourceColumns: ['calendar_month', 'month_start_date', 'month_end_date', 'iso_week_year', 'fiscal_qtr'],
        transforms: [
          {
            id: 'align-month',
            sources: ['month_start_date'],
            target: 'calendar_month_key',
            expression: "to_char(month_start_date, 'YYYY-MM')",
          },
          {
            id: 'bounds',
            sources: ['month_start_date', 'month_end_date'],
            target: 'month_bounds_valid',
            expression: 'month_end_date >= month_start_date',
          },
        ],
        addedColumns: [
          { name: 'fiscal_period_id', note: 'Corp calendar surrogate key' },
          { name: 'reporting_timezone', note: 'Anchor for month close' },
        ],
      },
      {
        id: 'bronze-regional-returns',
        sourceLabel: 'Bronze · pds-2024-003 / regional_returns_feed',
        sourceColumns: ['return_id', 'original_order_id', 'return_amount', 'reason_code', 'processed_at'],
        transforms: [
          {
            id: 'returns-net',
            sources: ['return_amount'],
            target: 'return_amount_abs',
            expression: 'abs(coalesce(return_amount, 0))',
          },
          {
            id: 'reason',
            sources: ['reason_code'],
            target: 'return_reason_family',
            expression: "case when reason_code like 'DEF%' then 'DEFECT' when reason_code like 'CX%' then 'CX' else 'OTHER' end",
          },
        ],
        addedColumns: [
          { name: 'matched_summary_order', note: 'Join to Monthly Sales grain' },
          { name: 'return_aging_days', note: 'processed_at minus original ship date' },
        ],
      },
    ],
  },
};

export function getSchemaLineageForAsset(assetId) {
  if (!assetId) return null;
  const raw = SCHEMA_LINEAGE_BY_ASSET[assetId.toLowerCase()] ?? null;
  if (!raw) return null;
  if (Array.isArray(raw.tables)) {
    return { tables: raw.tables };
  }
  return { tables: [raw] };
}
