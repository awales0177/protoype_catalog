/** Relationship helpers for asset detail: parent/children and Mermaid diagram code. */

import type { CatalogAssetDetail } from '../types/catalog';
import { DATA_ASSETS, DATA_PRODUCT_TYPES } from '../data/assets';

const MAX_NODES_FOR_DIAGRAM = 12;

export type AssetsById = Record<string, CatalogAssetDetail | undefined>;

/** Short type label for chips (PD, CD, DP, etc.). */
export function getTypeLabel(type: string): string | null {
  const map: Record<string, string> = {
    'Parent dataset': 'PD',
    'Child dataset': 'CD',
    'Adoption record': 'AR',
    'Aggregated data product': 'ADP',
    'Derived data product': 'DDP',
    'Child data product': 'CDP',
    Topic: 'TOP',
    'Transfer record': 'TR',
    'Curated list': 'LIST',
  };
  return map[type] ?? null;
}

/** CSS class for type chip color (matches search page). */
export function getTypeLabelClass(type: string): string {
  if (type === 'Dataset') return 'dataset';
  if (type === 'Parent dataset') return 'parentDataset';
  if (type === 'Child dataset') return 'childDataset';
  if (type === 'Adoption record') return 'adoptionRecord';
  if (type === 'Data product') return 'dataProduct';
  if (type === 'Aggregated data product') return 'aggregatedDataProduct';
  if (type === 'Derived data product') return 'derivedDataProduct';
  if (type === 'Child data product') return 'childDataProduct';
  if (type === 'Topic') return 'topic';
  if (type === 'Transfer record') return 'transferRecord';
  if (type === 'Curated list') return 'list';
  return 'dataset';
}

export interface RelationshipRef {
  id: string;
  asset: CatalogAssetDetail;
}

export interface RelationshipData {
  parent: CatalogAssetDetail | null;
  parents: RelationshipRef[];
  children: RelationshipRef[];
  /** Catalog data products whose `sourceDatasetIds` include this asset. */
  dataProducts: RelationshipRef[];
  /** Count for lineage diagram cap (parents + children + center only — excludes linked products). */
  totalNodes: number;
}

function listDirectDataProducts(sourceAssetId: string, assetsById: AssetsById): RelationshipRef[] {
  const key = sourceAssetId.trim().toLowerCase();
  if (!key) return [];
  const out: RelationshipRef[] = [];
  for (const a of DATA_ASSETS) {
    if (!DATA_PRODUCT_TYPES.includes(a.type)) continue;
    const sources = (a.sourceDatasetIds as string[] | undefined) ?? [];
    if (!sources.some((sid) => String(sid).toLowerCase() === key)) continue;
    const id = String(a.id).toLowerCase();
    const detail = assetsById[id];
    if (detail) out.push({ id, asset: detail });
  }
  out.sort((x, y) => x.asset.name.localeCompare(y.asset.name));
  return out;
}

/** Get parent and children for an asset from assets map (id -> detail shape). */
export function getRelationshipData(assetId: string, assetsById: AssetsById): RelationshipData {
  const current = assetsById[assetId];
  if (!current) {
    return { parent: null, parents: [], children: [], dataProducts: [], totalNodes: 0 };
  }
  const parentId = current.parentId;
  const parent = parentId ? assetsById[parentId] ?? null : null;
  const parents = parent && parentId ? [{ id: parentId, asset: parent }] : [];
  const children = Object.entries(assetsById)
    .filter((entry): entry is [string, CatalogAssetDetail] => {
      const [, child] = entry;
      return child !== undefined && child.parentId === assetId;
    })
    .map(([id, child]) => ({ id, asset: child }));
  children.sort((a, b) => a.asset.name.localeCompare(b.asset.name));
  const dataProducts = listDirectDataProducts(assetId, assetsById);
  const totalNodes = 1 + parents.length + children.length;
  return {
    parent,
    parents,
    children,
    dataProducts,
    totalNodes,
  };
}

export interface RelationshipGraphNode {
  id: string;
  asset: CatalogAssetDetail;
}

export interface RelationshipGraphEdge {
  source: string;
  target: string;
}

export interface FullRelationshipData {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
}

/**
 * Full hierarchy: all ancestors up to root and all descendants down to leaves.
 * Returns { nodes, edges } for use in the graph.
 */
export function getFullRelationshipData(assetId: string, assetsById: AssetsById): FullRelationshipData {
  const current = assetsById[assetId];
  if (!current) return { nodes: [], edges: [] };

  const nodeMap = new Map<string, CatalogAssetDetail>();
  const edges: RelationshipGraphEdge[] = [];

  function addNode(id: string): void {
    if (nodeMap.has(id)) return;
    const asset = assetsById[id];
    if (asset) nodeMap.set(id, asset);
  }

  addNode(assetId);

  let cur: CatalogAssetDetail | undefined = current;
  while (cur?.parentId) {
    const parentId: string = cur.parentId;
    addNode(parentId);
    edges.push({ source: parentId, target: cur.id });
    cur = assetsById[parentId];
  }

  const queue = [assetId];
  const visited = new Set<string>([assetId]);
  while (queue.length) {
    const id = queue.shift()!;
    const childPairs = Object.entries(assetsById).filter(
      (entry): entry is [string, CatalogAssetDetail] => {
        const [, a] = entry;
        return a !== undefined && a.parentId === id;
      }
    );
    for (const [cid] of childPairs) {
      addNode(cid);
      edges.push({ source: id, target: cid });
      if (!visited.has(cid)) {
        visited.add(cid);
        queue.push(cid);
      }
    }
  }

  const nodes = Array.from(nodeMap.entries()).map(([id, asset]) => ({ id, asset }));
  return { nodes, edges };
}

/** Generate Mermaid flowchart code for relationship diagram; returns null if too many nodes. */
export function getRelationshipDiagramCode(assetId: string, assetsById: AssetsById): string | null {
  const { parents, children, totalNodes } = getRelationshipData(assetId, assetsById);
  if (totalNodes > MAX_NODES_FOR_DIAGRAM) return null;
  const current = assetsById[assetId];
  if (!current) return null;
  const sanitize = (s: string) =>
    String(s)
      .replace(/["\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const nodeId = (id: string) => `N_${String(id).replace(/-/g, '_')}`;
  const label = (name: string) => `["${sanitize(name)}"]`;
  const lines: string[] = ['flowchart TB'];
  const currentNodeId = 'ME';
  const currentLabel = label(current.name);
  parents.forEach(({ id: pid, asset: p }) => {
    lines.push(`${nodeId(pid)}${label(p.name)}`);
    lines.push(`${nodeId(pid)} --> ${currentNodeId}${currentLabel}`);
  });
  if (parents.length === 0) lines.push(`${currentNodeId}${currentLabel}`);
  children.forEach(({ id: cid, asset: c }) => {
    const cId = nodeId(cid);
    lines.push(`${cId}${label(c.name)}`);
    lines.push(`${currentNodeId} --> ${cId}`);
  });
  lines.push(`style ${currentNodeId} fill:#2e9ad0,color:#fff,stroke:#1c6696`);
  return lines.join('\n');
}
