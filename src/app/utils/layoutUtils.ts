import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';

// Initialize ELK instance
const elk = new ELK();

// Default layout options - all values must be strings for ELK
const defaultOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
  'elk.spacing.nodeNode': '100',
  'elk.padding': '[top=50, left=50, bottom=50, right=50]',
  'elk.edgeRouting': 'STRAIGHT',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
};

/**
 * Applies ELK layout algorithm to nodes and edges
 * @param nodes - The nodes to layout
 * @param edges - The edges connecting the nodes
 * @param options - Optional layout options to override defaults
 * @returns Promise with the layouted nodes
 */
export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  options: Record<string, string> = {}
): Promise<{ nodes: Node[], edges: Edge[] }> => {
  if (!nodes.length) return { nodes, edges };

  // Combine default options with any custom options
  const layoutOptions = { ...defaultOptions, ...options };

  // Prepare the graph for ELK
  const elkNodes = nodes.map(node => ({
    id: node.id,
    width: node.width || 200, // Default width if not available
    height: node.height || 100, // Default height if not available
    // Use existing position as a hint for the layout algorithm
    x: node.position?.x,
    y: node.position?.y
  }));

  const elkEdges = edges.map(edge => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target]
  }));

  // Create the graph structure for ELK
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: layoutOptions,
    children: elkNodes,
    edges: elkEdges as ElkExtendedEdge[]
  };

  try {
    // Apply the layout
    const layoutedGraph = await elk.layout(graph);

    // Map the layout back to React Flow nodes
    const layoutedNodes = nodes.map(node => {
      const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
      
      if (elkNode && elkNode.x !== undefined && elkNode.y !== undefined) {
        return {
          ...node,
          position: {
            x: elkNode.x,
            y: elkNode.y
          }
        };
      }
      
      return node;
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('Error applying layout:', error);
    return { nodes, edges };
  }
};

/**
 * Applies a radial layout to the nodes
 */
export const getRadialLayout = async (
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node[], edges: Edge[] }> => {
  return getLayoutedElements(nodes, edges, {
    'elk.algorithm': 'org.eclipse.elk.radial',
    'elk.edgeRouting': 'STRAIGHT'
  });
};

/**
 * Applies a force-directed layout to the nodes
 */
export const getForceLayout = async (
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node[], edges: Edge[] }> => {
  return getLayoutedElements(nodes, edges, {
    'elk.algorithm': 'org.eclipse.elk.force',
    'elk.force.iterations': '300',
    'elk.force.repulsivePower': '50',
    'elk.edgeRouting': 'STRAIGHT',
    'elk.spacing.nodeNode': '120'
  });
};

/**
 * Applies a horizontal tree layout
 */
export const getHorizontalTreeLayout = async (
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node[], edges: Edge[] }> => {
  return getLayoutedElements(nodes, edges, {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '200',
    'elk.spacing.nodeNode': '150',
    'elk.edgeRouting': 'STRAIGHT'
  });
};

/**
 * Applies a vertical tree layout
 */
export const getVerticalTreeLayout = async (
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node[], edges: Edge[] }> => {
  return getLayoutedElements(nodes, edges, {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.layered.spacing.nodeNodeBetweenLayers': '150',
    'elk.spacing.nodeNode': '100',
    'elk.edgeRouting': 'STRAIGHT'
  });
}; 