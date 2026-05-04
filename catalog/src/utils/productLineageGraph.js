import { getFullRelationshipData } from './assetRelationships';
import {
  getLineagePresentation,
  getPipelineStepLineagePresentation,
  makeRulRuleId,
  summarizeLineageValidations,
} from './productLineagePresentation';

const STEP_RANK = {
  data_bucket: 1,
  scanning: 2,
  conditioning: 3,
  data_validation: 4,
  write: 5,
};

function compositeRunSortKey(assetId, node) {
  if (node.pipelineStep) {
    const r = STEP_RANK[node.pipelineStep] || 0;
    const tie = runSortKey(`${assetId}|${node.id}`);
    return r * 1_000_000_000 + tie;
  }
  return 6_000_000_000 + runSortKey(`${assetId}|${node.id}`);
}

/** Stable unsigned hash for deterministic run identifiers (sort reports by run id). */
function runSortKey(parts) {
  let h = 0;
  const s = String(parts);
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

/** Bronze / silver / gold for validation rules (one tier per lineage partition node). */
function lakeTierForNode(node, assetId) {
  const low = `${node.asset?.name || ''} ${node.pipelineStep || ''}`.toLowerCase();
  if (low.includes('bronze') || low.includes('landing') || low.includes('bucket') || low.includes('write')) {
    return 'bronze';
  }
  if (low.includes('gold') || low.includes('mart') || low.includes('analytics') || low.includes('serving')) {
    return 'gold';
  }
  if (low.includes('silver') || low.includes('condition') || low.includes('movement')) {
    return 'silver';
  }
  const tiers = ['bronze', 'silver', 'gold'];
  const seed = runSortKey(`${assetId}|${node.id}|${node.pipelineStep || 'catalog'}|tier`);
  return tiers[seed % 3];
}

/**
 * Additional edges shown only on the lineage tab (cross-links, feature tables, downstream products).
 * Keys are the asset id of the page being viewed.
 */
const LINEAGE_VIEW_EXTRAS = {
  'ddp-2024-001': [
    { source: 'cds-2024-009', target: 'ddp-2024-001' },
    { source: 'cds-2024-010', target: 'ddp-2024-001' },
    { source: 'dw-2024-001', target: 'cds-2024-009' },
    { source: 'ddp-2024-001', target: 'cdp-2024-001' },
    { source: 'ddp-2024-001', target: 'ddp-2024-004' },
  ],
  'adp-2024-001': [
    { source: 'cds-2024-001', target: 'adp-2024-001' },
    { source: 'cds-2024-002', target: 'adp-2024-001' },
    { source: 'ads-2024-001', target: 'adp-2024-001' },
  ],
  'ddp-2024-002': [
    { source: 'cds-2024-011', target: 'ddp-2024-002' },
    { source: 'ddp-2024-002', target: 'cdp-2024-002' },
  ],
};

function edgeKey(e) {
  return `${e.source}->${e.target}`;
}

function edgeKeyPair(source, target) {
  return `${source}->${target}`;
}

/**
 * Inserts Data P&L synthetic steps before the focal asset:
 * upstream → (per-feed) data bucket → aggregated dataset creation → Data Movement → OCR → write → focal.
 */
function injectDataPnLPipelineSteps(focusId, nodeMap, edges) {
  const incomingIndices = edges
    .map((e, i) => (e.target === focusId ? i : -1))
    .filter((i) => i >= 0);
  if (incomingIndices.length === 0) return;

  const scanId = `__lineage_scan__${focusId}`;
  const conditionId = `__lineage_condition__${focusId}`;
  const validateId = `__lineage_validate__${focusId}`;
  const writeId = `__lineage_write__${focusId}`;

  const existing = new Set(edges.map(edgeKey));
  const add = (source, target) => {
    const k = edgeKeyPair(source, target);
    if (!existing.has(k)) {
      existing.add(k);
      edges.push({ source, target });
    }
  };

  incomingIndices.forEach((i) => {
    const src = edges[i].source;
    const bucketId = `__lineage_bucket__${focusId}__${src}`;
    edges[i] = { ...edges[i], target: bucketId };
    if (!nodeMap.has(bucketId)) {
      nodeMap.set(bucketId, {
        id: bucketId,
        asset: null,
        pipelineStep: 'data_bucket',
        focusAssetId: focusId,
        bucketSourceId: src,
      });
    }
    add(bucketId, scanId);
  });

  add(scanId, conditionId);
  add(conditionId, validateId);
  add(validateId, writeId);
  add(writeId, focusId);

  const synth = [
    { id: scanId, step: 'scanning' },
    { id: conditionId, step: 'conditioning' },
    { id: validateId, step: 'data_validation' },
    { id: writeId, step: 'write' },
  ];

  synth.forEach(({ id, step }) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, {
        id,
        asset: null,
        pipelineStep: step,
        focusAssetId: focusId,
      });
    }
  });
}

/**
 * Full relationship tree plus demo cross-edges for a richer lineage view.
 */
export function getProductLineageGraph(assetId, assetsById) {
  const base = getFullRelationshipData(assetId, assetsById);
  const nodeMap = new Map((base.nodes || []).map((n) => [n.id, n]));
  const edgeSet = new Set((base.edges || []).map(edgeKey));
  const edges = [...(base.edges || [])];

  const extras = LINEAGE_VIEW_EXTRAS[assetId] || [];
  for (const e of extras) {
    const a = assetsById[e.source];
    const b = assetsById[e.target];
    if (!a || !b) continue;
    if (!nodeMap.has(e.source)) {
      nodeMap.set(e.source, { id: e.source, asset: a });
    }
    if (!nodeMap.has(e.target)) {
      nodeMap.set(e.target, { id: e.target, asset: b });
    }
    const k = edgeKey(e);
    if (!edgeSet.has(k)) {
      edgeSet.add(k);
      edges.push({ source: e.source, target: e.target });
    }
  }

  injectDataPnLPipelineSteps(assetId, nodeMap, edges);

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

/** Aggregate validation outcomes across every node in the lineage graph. */
export function getGraphValidationRollup(assetId, assetsById) {
  const { nodes } = getProductLineageGraph(assetId, assetsById);
  const rollup = { pass: 0, warn: 0, fail: 0, pending: 0 };
  let checkCount = 0;
  for (const node of nodes) {
    const { validations } = node.pipelineStep
      ? getPipelineStepLineagePresentation(node.pipelineStep, assetsById[node.focusAssetId], {
          upstreamAsset: node.bucketSourceId ? assetsById[node.bucketSourceId] : undefined,
        })
      : getLineagePresentation(node.asset);
    const s = summarizeLineageValidations(validations);
    rollup.pass += s.pass || 0;
    rollup.warn += s.warn || 0;
    rollup.fail += s.fail || 0;
    rollup.pending += s.pending || 0;
    checkCount += validations.length;
  }
  return { ...rollup, nodeCount: nodes.length, checkCount };
}


/**
 * Snapshot of lineage checks — one catalog history job run per offset (deterministic replay).
 */
function buildBaselineLineageValidationRuleCards(assetId, assetsById) {
  const { nodes } = getProductLineageGraph(assetId, assetsById);
  const cards = [];

  for (const node of nodes) {
    const pres = node.pipelineStep
      ? getPipelineStepLineagePresentation(node.pipelineStep, assetsById[node.focusAssetId], {
          upstreamAsset: node.bucketSourceId ? assetsById[node.bucketSourceId] : undefined,
        })
      : getLineagePresentation(node.asset);

    const fallbackSort = compositeRunSortKey(assetId, node);
    const runSortVal =
      typeof pres.runSortKey === 'number' && !Number.isNaN(pres.runSortKey) ? pres.runSortKey : fallbackSort;
    const partitionRunCode =
      typeof pres.runId === 'string' && pres.runId.trim() !== ''
        ? pres.runId.trim()
        : `RUN-${String(runSortVal).padStart(10, '0')}`;

    const lineageSlug = String(pres.lineageName || 'node').replace(/\s+/g, '_');

    const lakeTier = lakeTierForNode(node, assetId);

    for (const v of pres.validations || []) {
      const ruleSlug = `${lineageSlug}::${v.key}`;
      const rawId = typeof v.ruleId === 'string' ? v.ruleId.trim() : '';
      const ruleId =
        rawId && /^RUL-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)
          ? rawId
          : makeRulRuleId(`${node.id}|${ruleSlug}`);
      const ruleName = (v.label && String(v.label).trim()) || String(v.key || 'Rule');
      const detail = v.detail != null ? String(v.detail).trim() : '';
      const description = detail || null;

      cards.push({
        ruleKey: `${node.id}::${v.key}`,
        partitionRunCode,
        lakeTier,
        runSortKey: runSortVal,
        ruleId,
        ruleName,
        status: v.status,
        description,
      });
    }
  }

  cards.sort((a, b) => {
    if (a.runSortKey !== b.runSortKey) return a.runSortKey - b.runSortKey;
    const rc = String(a.partitionRunCode).localeCompare(String(b.partitionRunCode));
    if (rc !== 0) return rc;
    const ra = String(a.ruleId);
    const rb = String(b.ruleId);
    if (ra !== rb) return ra.localeCompare(rb);
    return String(a.ruleKey).localeCompare(String(b.ruleKey));
  });

  return cards;
}

export function getLineageValidationRuleCards(assetId, assetsById, validationSessionOffset = 0) {
  const offset = Number(validationSessionOffset) || 0;
  const baseline = buildBaselineLineageValidationRuleCards(assetId, assetsById);
  return baseline.map((c) => ({
    ...c,
    validationSessionOffset: offset,
    ruleKey: `${offset}__${c.ruleKey}`,
  }));
}