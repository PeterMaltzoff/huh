import { Node, Edge } from 'reactflow';

interface ProcessJsonResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Process JSON data and convert it to nodes and edges for ReactFlow
 * @param jsonData - The JSON data to process
 * @returns Object containing nodes and edges
 */
export const processJsonData = (jsonData: any): ProcessJsonResult => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;
  
  // Create a root node
  const rootId = `node-${nodeId++}`;
  const rootLabel = Array.isArray(jsonData) ? '[Array]' : '{Object}';
  
  nodes.push({
    id: rootId,
    data: { 
      label: rootLabel,
      isRoot: true 
    },
    position: { x: 0, y: 0 },
    type: 'custom'
  });
  
  // Process the JSON data recursively
  processJsonNode(rootId, jsonData, nodes, edges, nodeId);
  
  // Mark nodes that have children
  const nodesWithChildren = new Set(edges.map(edge => edge.source));
  
  // Update nodes with hasChildren property
  const updatedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      hasChildren: nodesWithChildren.has(node.id)
    }
  }));
  
  console.log('Processed JSON data:', {
    nodesCount: updatedNodes.length,
    edgesCount: edges.length,
    nodesWithChildrenCount: nodesWithChildren.size
  });
  
  return { nodes: updatedNodes, edges };
};

/**
 * Process a JSON node and its children recursively
 * @param parentId - The ID of the parent node
 * @param data - The data to process
 * @param nodes - The nodes array to add to
 * @param edges - The edges array to add to
 * @param nodeId - The current node ID counter
 * @returns The updated node ID counter
 */
const processJsonNode = (
  parentId: string, 
  data: any, 
  nodes: Node[], 
  edges: Edge[],
  nodeId: number
): number => {
  if (Array.isArray(data)) {
    // Process array items
    return processArrayNode(parentId, data, nodes, edges, nodeId);
  } else if (data !== null && typeof data === 'object') {
    // Process object properties
    return processObjectNode(parentId, data, nodes, edges, nodeId);
  }
  
  // For primitive values, create a single node
  const id = `node-${nodeId++}`;
  const label = formatPrimitiveValue(data);
  
  nodes.push({
    id,
    data: { label },
    position: { x: 0, y: 0 },
    type: 'custom'
  });
  
  edges.push({
    id: `edge-${parentId}-${id}`,
    source: parentId,
    target: id,
    type: 'smoothstep'
  });
  
  return nodeId;
};

/**
 * Process an array node and its items
 * @param parentId - The ID of the parent node
 * @param data - The array to process
 * @param nodes - The nodes array to add to
 * @param edges - The edges array to add to
 * @param nodeId - The current node ID counter
 * @returns The updated node ID counter
 */
const processArrayNode = (
  parentId: string, 
  data: any[], 
  nodes: Node[], 
  edges: Edge[],
  nodeId: number
): number => {
  data.forEach((item, index) => {
    const id = `node-${nodeId++}`;
    
    if (Array.isArray(item)) {
      // Create a node for the array
      nodes.push({
        id,
        data: { label: `[${index}]: [Array]` },
        position: { x: 0, y: 0 },
        type: 'custom'
      });
      
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep'
      });
      
      // Process the nested array
      nodeId = processJsonNode(id, item, nodes, edges, nodeId);
    } else if (item !== null && typeof item === 'object') {
      // Create a node for the object
      nodes.push({
        id,
        data: { label: `[${index}]: {Object}` },
        position: { x: 0, y: 0 },
        type: 'custom'
      });
      
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep'
      });
      
      // Process the nested object
      nodeId = processJsonNode(id, item, nodes, edges, nodeId);
    } else {
      // Create a node for the primitive value
      nodes.push({
        id,
        data: { label: `[${index}]: ${formatPrimitiveValue(item)}` },
        position: { x: 0, y: 0 },
        type: 'custom'
      });
      
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep'
      });
    }
  });
  
  return nodeId;
};

/**
 * Process an object node and its properties
 * @param parentId - The ID of the parent node
 * @param data - The object to process
 * @param nodes - The nodes array to add to
 * @param edges - The edges array to add to
 * @param nodeId - The current node ID counter
 * @returns The updated node ID counter
 */
const processObjectNode = (
  parentId: string, 
  data: Record<string, any>, 
  nodes: Node[], 
  edges: Edge[],
  nodeId: number
): number => {
  // Check if this is a special format object (e.g., a person with a name)
  const keys = Object.keys(data);
  if (keys.includes('name') && keys.length === 2) {
    const otherKey = keys.find(key => key !== 'name');
    if (otherKey) {
      const id = `node-${nodeId++}`;
      const name = data.name;
      const otherValue = data[otherKey];
      
      // Only use special format for primitive values
      if (typeof otherValue !== 'object' || otherValue === null) {
        nodes.push({
          id,
          data: { 
            label: `${name}|${otherKey}: ${formatPrimitiveValue(otherValue)}`,
            isSpecialFormat: true 
          },
          position: { x: 0, y: 0 },
          type: 'custom'
        });
        
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep'
        });
        
        return nodeId;
      }
    }
  }
  
  // Process regular object properties
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const id = `node-${nodeId++}`;
      
      if (Array.isArray(value)) {
        // Create a node for the array
        nodes.push({
          id,
          data: { label: `${key}: [Array]` },
          position: { x: 0, y: 0 },
          type: 'custom'
        });
        
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep'
        });
        
        // Process the nested array
        nodeId = processJsonNode(id, value, nodes, edges, nodeId);
      } else if (value !== null && typeof value === 'object') {
        // Create a node for the object
        nodes.push({
          id,
          data: { label: `${key}: {Object}` },
          position: { x: 0, y: 0 },
          type: 'custom'
        });
        
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep'
        });
        
        // Process the nested object
        nodeId = processJsonNode(id, value, nodes, edges, nodeId);
      } else {
        // Create a node for the primitive value
        nodes.push({
          id,
          data: { label: `${key}: ${formatPrimitiveValue(value)}` },
          position: { x: 0, y: 0 },
          type: 'custom'
        });
        
        edges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep'
        });
      }
    }
  }
  
  return nodeId;
};

/**
 * Format a primitive value for display
 * @param value - The value to format
 * @returns The formatted value as a string
 */
const formatPrimitiveValue = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
};

/**
 * Get all children nodes for a given node
 * @param nodeId - The ID of the node to get children for
 * @param edges - All edges in the graph
 * @returns Array of child node IDs
 */
export const getChildrenNodes = (nodeId: string, edges: Edge[]): string[] => {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
}; 