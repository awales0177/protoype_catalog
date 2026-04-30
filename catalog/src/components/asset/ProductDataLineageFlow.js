import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { assetDetail } from '../../routes';
import { getProductLineageGraph } from '../../utils/productLineageGraph';
import {
  getLineagePresentation,
  getPipelineStepLineagePresentation,
  getTechTagLogoId,
  summarizeLineageValidations,
} from '../../utils/productLineagePresentation';
import LineagePlatformLogo from './LineagePlatformLogo';
import './ProductDataLineageFlow.css';

const NODE_W = 300;
/* Dagre box must cover card + tech row + optional unsynced badge offset */
const NODE_H = 300;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

function layoutNodesEdges(nodes, edges) {
  if (nodes.length === 0) return { nodes, edges };
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 68,
    ranksep: 96,
    marginx: 40,
    marginy: 36,
  });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_W, height: NODE_H });
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
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
    };
  });
  return { nodes: layoutedNodes, edges };
}

function TableGridIcon() {
  return (
    <svg className="lineageNodeIcon lineageNodeIcon--table" width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M2 2h12v12H2V2zm1 1v4h4V3H3zm5 0v4h4V3H8zm5 0v4h1V3h-1zM3 8v4h4V8H3zm5 0v4h4V8H8zm5 0v4h1V8h-1z"
      />
    </svg>
  );
}

function LineageFlowNode({ data, selected }) {
  const {
    href,
    isCurrent,
    isPipelineStep,
    lineageName,
    description,
    techTags,
    unsyncedCount,
    materializedLabel,
    footerStatusLabel,
    logoId,
    logoLabel,
    validations,
  } = data;
  const baseClass = `lineageFlowNodeCard ${isCurrent ? 'lineageFlowNodeCard--current' : ''} ${selected ? 'lineageFlowNodeCard--selected' : ''} ${isPipelineStep ? 'lineageFlowNodeCard--pipeline' : ''}`;
  const vsum = summarizeLineageValidations(validations);
  const footerMods = [];
  if (vsum.fail > 0) footerMods.push('lineageFlowNodeFooter--risk');
  if (vsum.pending > 0 && vsum.fail === 0) footerMods.push('lineageFlowNodeFooter--pending');

  const inner = (
    <>
      <Handle type="target" position={Position.Left} className="lineageFlowHandle" />
      <div className="lineageFlowNodeCardInner">
        <div className="lineageFlowNodeHeader">
          <span className="lineageFlowNodeLogoBadge">
            <LineagePlatformLogo logoId={logoId} label={logoLabel} />
          </span>
          <div className="lineageFlowNodeTitleRow">
            <TableGridIcon />
            <span className="lineageFlowNodeTitle">{lineageName}</span>
          </div>
        </div>
        <p className="lineageFlowNodeDesc">{description}</p>
        {validations.length > 0 && (
          <div className="lineageValidationBlock" aria-label="Validation checks">
            <div className="lineageValidationBlockHead">
              <span className="lineageValidationBlockTitle">Checks</span>
              <span className="lineageValidationBlockCounts" title="Pass / warn / fail / pending">
                <span className="lineageCount lineageCount--pass">{vsum.pass}</span>
                <span className="lineageCountSep">·</span>
                <span className="lineageCount lineageCount--warn">{vsum.warn}</span>
                <span className="lineageCountSep">·</span>
                <span className="lineageCount lineageCount--fail">{vsum.fail}</span>
                <span className="lineageCountSep">·</span>
                <span className="lineageCount lineageCount--pending">{vsum.pending}</span>
              </span>
            </div>
            <ul className="lineageValidationList">
              {validations.slice(0, 5).map((v) => (
                <li key={v.key} className={`lineageValidationItem lineageValidationItem--${v.status}`}>
                  <span className="lineageValidationDot" aria-hidden />
                  <span className="lineageValidationLabel" title={v.detail || undefined}>
                    {v.label}
                  </span>
                </li>
              ))}
            </ul>
            {validations.length > 5 && (
              <p className="lineageValidationMore">+{validations.length - 5} more checks</p>
            )}
          </div>
        )}
        <div className={`lineageFlowNodeFooter ${footerMods.join(' ')}`}>
          <span className="lineageFlowNodeFooterStatus">{footerStatusLabel || 'Materialized'}</span>
          <span className="lineageFlowNodeFooterTime">{materializedLabel}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="lineageFlowHandle" />
    </>
  );

  const body = (
    <div className="lineageFlowNodeWrap">
      {unsyncedCount != null && unsyncedCount > 0 && (
        <div className="lineageUnsyncedBadge" title="Upstream changes not yet reflected">
          <span className="lineageUnsyncedBadgeIcon" aria-hidden>
            ◷
          </span>
          Unsynced ({unsyncedCount})
        </div>
      )}
      {href ? (
        <Link to={href} className={`${baseClass} nodrag nopan`} onClick={(e) => e.stopPropagation()}>
          {inner}
        </Link>
      ) : (
        <div className={baseClass}>{inner}</div>
      )}
      <div className="lineageTechRow">
        {techTags.map((t) => {
          const chipLogoId = getTechTagLogoId(t);
          return (
            <span key={t} className="lineageTechChip" title={t}>
              <LineagePlatformLogo logoId={chipLogoId} label={t} variant="chip" />
              <span className="lineageTechChipLabel">{t}</span>
            </span>
          );
        })}
      </div>
    </div>
  );

  return body;
}

LineageFlowNode.propTypes = {
  data: PropTypes.shape({
    href: PropTypes.string,
    isCurrent: PropTypes.bool,
    isPipelineStep: PropTypes.bool,
    lineageName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    techTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    unsyncedCount: PropTypes.number,
    materializedLabel: PropTypes.string.isRequired,
    footerStatusLabel: PropTypes.string,
    logoId: PropTypes.string.isRequired,
    logoLabel: PropTypes.string.isRequired,
    validations: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        status: PropTypes.oneOf(['pass', 'warn', 'fail', 'pending']).isRequired,
        detail: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  selected: PropTypes.bool,
};

const nodeTypes = { lineage: LineageFlowNode };

const defaultEdgeOptions = {
  type: 'simplebezier',
  style: { stroke: '#5a5a5a', strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#5a5a5a', width: 12, height: 12 },
};

function ProductDataLineageFlow({ assetId, assetsById, getAssetUrl }) {
  const resolveUrl = getAssetUrl || assetDetail;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes: relNodes, edges: relEdges } = getProductLineageGraph(assetId, assetsById);
    const safeNodes = Array.isArray(relNodes) ? relNodes : [];
    const safeEdges = Array.isArray(relEdges) ? relEdges : [];
    const rfNodes = safeNodes.map((node) => {
      const { id, asset, pipelineStep, focusAssetId, bucketSourceId } = node;
      const pres = pipelineStep
        ? getPipelineStepLineagePresentation(pipelineStep, assetsById[focusAssetId], {
            upstreamAsset: bucketSourceId ? assetsById[bucketSourceId] : undefined,
          })
        : getLineagePresentation(asset);
      const isPipeline = Boolean(pipelineStep);
      return {
        id,
        type: 'lineage',
        position: { x: 0, y: 0 },
        data: {
          ...pres,
          isCurrent: id === assetId,
          isPipelineStep: isPipeline,
          href: isPipeline ? '' : resolveUrl(id),
        },
      };
    });
    const rfEdges = safeEdges.map((e, i) => ({
      id: `le-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      ...defaultEdgeOptions,
    }));
    return layoutNodesEdges(rfNodes, rfEdges);
  }, [assetId, assetsById, resolveUrl]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    requestAnimationFrame(() => instance.fitView({ padding: 0.12, duration: 0 }));
  }, []);

  if (!initialNodes?.length) {
    return (
      <div className="productDataLineageFlowWrap productDataLineageFlowWrap--empty">
        <p className="productDataLineageFlowEmpty">No lineage nodes to display. Add parent or child assets to see the graph.</p>
      </div>
    );
  }

  return (
    <div className="productDataLineageFlowWrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.12, duration: 0 }}
        zoomOnDoubleClick={false}
        minZoom={0.15}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={14} size={1.25} color="#c8c8c8" variant="dots" />
        <Controls showInteractive={false} fitViewOptions={{ padding: 0.12, duration: 0 }} />
      </ReactFlow>
    </div>
  );
}

ProductDataLineageFlow.propTypes = {
  assetId: PropTypes.string.isRequired,
  assetsById: PropTypes.object.isRequired,
  getAssetUrl: PropTypes.func,
};

export default ProductDataLineageFlow;
