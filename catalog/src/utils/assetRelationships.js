/** Relationship helpers for asset detail: parent/children and Mermaid diagram code. */

const MAX_NODES_FOR_DIAGRAM = 12;

/** Short type label for chips (PD, CD, DP, etc.). */
export function getTypeLabel(type) {
  const map = {
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
  return map[type] || null;
}

/** CSS class for type chip color (matches search page). */
export function getTypeLabelClass(type) {
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

/** Get parent and children for an asset from assets map (id -> detail shape). */
export function getRelationshipData(assetId, assetsById) {
  const current = assetsById[assetId];
  if (!current) return { parent: null, parents: [], children: [], totalNodes: 0 };
  const parentId = current.parentId;
  const parent = parentId ? assetsById[parentId] : null;
  const parents = parent ? [{ id: parentId, asset: parent }] : [];
  const children = Object.entries(assetsById)
    .filter(([, a]) => a.parentId === assetId)
    .map(([id, a]) => ({ id, asset: a }));
  const totalNodes = 1 + parents.length + children.length;
  return {
    parent,
    parents,
    children,
    totalNodes,
  };
}

/**
 * Full hierarchy: all ancestors up to root and all descendants down to leaves.
 * Returns { nodes: [{ id, asset }], edges: [{ source, target }] } for use in the graph.
 */
export function getFullRelationshipData(assetId, assetsById) {
  const current = assetsById[assetId];
  if (!current) return { nodes: [], edges: [] };

  const nodeMap = new Map(); // id -> asset
  const edges = [];

  function addNode(id) {
    if (nodeMap.has(id)) return;
    const asset = assetsById[id];
    if (asset) nodeMap.set(id, asset);
  }

  addNode(assetId);

  // Ancestors: walk up from current's parent to root
  let cur = current;
  while (cur.parentId) {
    const parentId = cur.parentId;
    addNode(parentId);
    edges.push({ source: parentId, target: cur.id });
    cur = assetsById[parentId];
    if (!cur) break;
  }

  // Descendants: BFS from current to all leaves
  const queue = [assetId];
  const visited = new Set([assetId]);
  while (queue.length) {
    const id = queue.shift();
    const children = Object.entries(assetsById).filter(([, a]) => a.parentId === id);
    for (const [cid] of children) {
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
export function getRelationshipDiagramCode(assetId, assetsById) {
  const { parents, children, totalNodes } = getRelationshipData(assetId, assetsById);
  if (totalNodes > MAX_NODES_FOR_DIAGRAM) return null;
  const current = assetsById[assetId];
  if (!current) return null;
  const sanitize = (s) => String(s).replace(/["\\]/g, '').replace(/\s+/g, ' ').trim();
  const nodeId = (id) => `N_${String(id).replace(/-/g, '_')}`;
  const label = (name) => `["${sanitize(name)}"]`;
  const lines = ['flowchart TB'];
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
