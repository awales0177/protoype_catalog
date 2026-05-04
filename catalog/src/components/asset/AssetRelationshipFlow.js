import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { assetDetail } from '../../routes';
import { getFullRelationshipData, getTypeLabel, getTypeLabelClass } from '../../utils/assetRelationships';
import './AssetRelationshipFlow.css';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

function layoutNodesEdges(nodes, edges, direction = 'TB') {
  if (nodes.length === 0) return { nodes, edges };
  dagreGraph.setGraph({ rankdir: direction, nodesep: 48, ranksep: 72, marginx: 24, marginy: 24 });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 94 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: { x: pos.x - 110, y: pos.y - 47 },
    };
  });
  return { nodes: layoutedNodes, edges };
}

function AssetFlowNode({ data, selected }) {
  const { catalogId = '', asset, isCurrent, href } = data;
  const idAttr = catalogId ? `relationship-diagram-${catalogId}` : undefined;
  const label = getTypeLabel(asset.type);
  const labelClass = getTypeLabelClass(asset.type);
  const baseClass = `assetFlowNode ${isCurrent ? 'assetFlowNode--current' : ''} ${selected ? 'assetFlowNode--selected' : ''}`;

  const body = (
    <>
      <Handle type="target" position={Position.Top} className="assetFlowHandle" />
      <span className="assetFlowNodeName">{asset.name}</span>
      {catalogId ? (
        <span className="assetFlowNodeCatalogId" title="Catalog asset id">
          {catalogId}
        </span>
      ) : null}
      {label && (
        <span className={`assetFlowNodeType relationshipsTypeChip ${labelClass}`}>{label}</span>
      )}
      <Handle type="source" position={Position.Bottom} className="assetFlowHandle" />
    </>
  );

  if (href) {
    return (
      <Link
        id={idAttr}
        to={href}
        className={`${baseClass} nodrag nopan`}
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </Link>
    );
  }
  return (
    <div id={idAttr} className={baseClass}>
      {body}
    </div>
  );
}

AssetFlowNode.propTypes = {
  data: PropTypes.shape({
    catalogId: PropTypes.string,
    asset: PropTypes.object.isRequired,
    isCurrent: PropTypes.bool,
    href: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
};

const nodeTypes = { asset: AssetFlowNode };

function AssetRelationshipFlow({ assetId, assetsById, getAssetUrl }) {
  const resolveUrl = getAssetUrl || assetDetail;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes: relNodes, edges: relEdges } = getFullRelationshipData(assetId, assetsById);
    const safeNodes = Array.isArray(relNodes) ? relNodes : [];
    const safeEdges = Array.isArray(relEdges) ? relEdges : [];
    const rfNodes = safeNodes.map(({ id, asset }) => ({
      id,
      type: 'asset',
      position: { x: 0, y: 0 },
      data: {
        catalogId: id,
        asset,
        isCurrent: id === assetId,
        href: resolveUrl(id),
      },
    }));
    const rfEdges = safeEdges.map((e, i) => ({
      id: `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
    }));
    return layoutNodesEdges(rfNodes, rfEdges);
  }, [assetId, assetsById, resolveUrl]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useLayoutEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  /* duration must be 0: duplicate d3-selection copies (e.g. react-simple-maps vs xyflow)
   * mean selection.transition is missing when animated fit uses d3-transition on the wrong instance. */
  const onInit = useCallback((instance) => {
    requestAnimationFrame(() => instance.fitView({ padding: 0.2, duration: 0 }));
  }, []);

  if (!initialNodes?.length) {
    return (
      <div className="assetRelationshipFlowWrap assetRelationshipFlowWrap--empty">
        <p className="assetRelationshipFlowEmpty">No nodes to display in the diagram.</p>
      </div>
    );
  }

  return (
    <div className="assetRelationshipFlowWrap">
      <ReactFlow
        key={assetId}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 0 }}
        zoomOnDoubleClick={false}
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} fitViewOptions={{ padding: 0.2, duration: 0 }} />
      </ReactFlow>
    </div>
  );
}

AssetRelationshipFlow.propTypes = {
  assetId: PropTypes.string.isRequired,
  asset: PropTypes.object,
  assetsById: PropTypes.object.isRequired,
  getAssetUrl: PropTypes.func,
};

export default AssetRelationshipFlow;
