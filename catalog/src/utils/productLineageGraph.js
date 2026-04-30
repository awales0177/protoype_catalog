import { getFullRelationshipData } from './assetRelationships';
import {
  getLineagePresentation,
  getPipelineStepLineagePresentation,
  summarizeLineageValidations,
} from './productLineagePresentation';

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

/** Per-node validation rows for the Data validation tab (same graph as lineage). */
export function getLineageValidationBreakdown(assetId, assetsById) {
  const { nodes } = getProductLineageGraph(assetId, assetsById);
  return nodes.map((node) => {
    const pres = node.pipelineStep
      ? getPipelineStepLineagePresentation(node.pipelineStep, assetsById[node.focusAssetId], {
          upstreamAsset: node.bucketSourceId ? assetsById[node.bucketSourceId] : undefined,
        })
      : getLineagePresentation(node.asset);
    return {
      id: node.id,
      lineageName: pres.lineageName,
      catalogName: node.asset?.name || null,
      isPipelineStep: Boolean(node.pipelineStep),
      pipelineStep: node.pipelineStep || null,
      validations: pres.validations,
      summary: summarizeLineageValidations(pres.validations),
    };
  });
}
