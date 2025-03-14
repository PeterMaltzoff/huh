import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  NodeTypes,
  MiniMap,
  Panel,
  MarkerType,
  ConnectionLineType,
  useReactFlow,
  Node,
  Edge,
  NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CustomNode from '../CustomNode';
import { 
  getVerticalTreeLayout, 
  getHorizontalTreeLayout, 
  getRadialLayout, 
  getForceLayout 
} from '../../utils/layoutUtils';
import { processJsonData } from '../../utils/json/jsonProcessor';
import InputPanel from './InputPanel';
import FlowControls from './FlowControls';

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface FlowContentProps {
  // Add any props if needed
}

const FlowContent = (props: FlowContentProps) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layouting, setLayouting] = useState(false);
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [allEdges, setAllEdges] = useState<Edge[]>([]);
  const [currentRootId, setCurrentRootId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'json' | 'raw'>('json');
  const [currentLayoutType, setCurrentLayoutType] = useState<'vertical' | 'horizontal' | 'radial' | 'force'>('radial');
  const reactFlowInstance = useReactFlow();

  // Debug useEffect to log state changes
  useEffect(() => {
    console.log('Current state:', {
      allNodesCount: allNodes.length,
      allEdgesCount: allEdges.length,
      visibleNodesCount: nodes.length,
      visibleEdgesCount: edges.length,
      currentRootId
    });
  }, [allNodes, allEdges, nodes, edges, currentRootId]);

  const handleSubmit = async (text: string) => {
    setInputText(text);
    setLoading(true);
    setError('');
    setViewMode('json'); // Default to JSON view on new submission
    
    try {
      // Send the text to the Ollama API endpoint
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      setLastResponse(data); // Store the last response
      
      if (response.ok) {
        console.log('Response from Ollama:', data);
        console.log('isValidJson:', data.isValidJson);
        console.log('result type:', typeof data.result);
        
        // Check if we have a valid JSON result
        if (data.isValidJson === true) {
          console.log('Processing valid JSON data');
          displayJsonView(data.result);
        } else {
          console.log('Received invalid JSON, displaying raw response');
          setError('Received invalid JSON from Ollama. Displaying raw response.');
          console.log('Invalid JSON received:', data.rawResponse || data.result);
          
          // Create a simple visualization for the raw response
          createRawResponseFlow(data.result, data.rawResponse);
        }
      } else {
        setError(data.error || 'An error occurred while processing your request');
      }
    } catch (err) {
      console.error('Error submitting text:', err);
      setError('Failed to connect to the server: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Function to display JSON view
  const displayJsonView = async (jsonData: any) => {
    try {
      // Process the JSON data to create nodes and edges
      const jsonToProcess = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      console.log('JSON to process:', jsonToProcess);
      
      const { nodes: newNodes, edges: newEdges } = processJsonData(jsonToProcess);
      
      // Store all nodes and edges
      setAllNodes(newNodes);
      setAllEdges(newEdges);
      
      // Find the root node
      const rootNode = newNodes.find(node => node.data.isRoot);
      if (rootNode) {
        setCurrentRootId(rootNode.id);
        
        // Get only the root node and its immediate children
        const { visibleNodes, visibleEdges } = getVisibleNodesAndEdges(
          rootNode.id,
          newNodes,
          newEdges
        );
        
        // Set the nodes and edges to display
        setNodes(visibleNodes);
        setEdges(visibleEdges);
        
        // Apply the default layout (radial)
        await applyLayout(currentLayoutType);
      }
    } catch (err) {
      console.error('Error displaying JSON view:', err);
      setError('Failed to display JSON view: ' + (err instanceof Error ? err.message : String(err)));
      
      // Fallback to raw response if JSON processing fails
      if (lastResponse) {
        createRawResponseFlow(lastResponse.result, lastResponse.rawResponse);
      }
    }
  };

  // Toggle between JSON and raw view
  const toggleViewMode = async () => {
    if (!lastResponse) return;
    
    if (viewMode === 'json') {
      // Switch to raw view
      setViewMode('raw');
      createRawResponseFlow(lastResponse.result, lastResponse.rawResponse);
    } else {
      // Switch to JSON view
      setViewMode('json');
      if (lastResponse.isValidJson) {
        await displayJsonView(lastResponse.result);
      } else {
        setError('No valid JSON available to display.');
      }
    }
  };

  // Function to get visible nodes and edges based on the current root node
  const getVisibleNodesAndEdges = (
    rootId: string,
    allNodes: Node[],
    allEdges: Edge[]
  ) => {
    console.log(`Getting visible nodes and edges for root ${rootId}`);
    
    // Get the root node
    const rootNode = allNodes.find(node => node.id === rootId);
    if (!rootNode) {
      console.error(`Root node ${rootId} not found in allNodes`);
      return { visibleNodes: [], visibleEdges: [] };
    }
    
    // Get all edges that have the root node as source
    const directEdges = allEdges.filter(edge => edge.source === rootId);
    console.log(`Found ${directEdges.length} direct edges from root ${rootId}`);
    
    // Get all direct children nodes
    const childrenIds = directEdges.map(edge => edge.target);
    const childrenNodes = allNodes.filter(node => childrenIds.includes(node.id));
    console.log(`Found ${childrenNodes.length} direct children nodes`);
    
    // Mark nodes that have children
    const nodesWithChildren = new Set(allEdges.map(edge => edge.source));
    console.log(`Found ${nodesWithChildren.size} nodes with children`);
    
    // Create the visible nodes with hasChildren property
    const visibleNodes = [
      {
        ...rootNode,
        data: { 
          ...rootNode.data, 
          isRoot: true, 
          hasChildren: nodesWithChildren.has(rootId),
          label: rootNode.data.label + (nodesWithChildren.has(rootId) ? ' (has children)' : ' (no children)')
        }
      },
      ...childrenNodes.map(node => {
        const hasChildren = nodesWithChildren.has(node.id);
        return {
          ...node,
          data: { 
            ...node.data, 
            hasChildren,
            label: node.data.label + (hasChildren ? ' (has children)' : ' (no children)')
          }
        };
      })
    ];
    
    console.log(`Returning ${visibleNodes.length} visible nodes and ${directEdges.length} visible edges`);
    
    return { visibleNodes, visibleEdges: directEdges };
  };

  // Handle node click to make it the new root
  const handleNodeClick: NodeMouseHandler = (event, clickedNode) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Node clicked:', clickedNode.id, clickedNode);
    
    // Skip if the node is already the root or if we're layouting
    if (clickedNode.id === currentRootId || layouting) {
      console.log('Node is already root or layouting in progress, skipping');
      return;
    }
    
    // Check if the node has children (is not a leaf node)
    const hasChildren = allEdges.some(edge => edge.source === clickedNode.id);
    console.log('Node has children:', hasChildren, 'All edges count:', allEdges.length);
    
    if (!hasChildren) {
      console.log('Node has no children, skipping');
      return; // Do nothing for leaf nodes
    }
    
    // Set the clicked node as the new root
    console.log('Setting new root node:', clickedNode.id);
    
    // Force a complete re-render by clearing everything first
    setLayouting(true);
    setNodes([]);
    setEdges([]);
    
    // Use setTimeout to ensure the clearing happens before adding new nodes
    setTimeout(() => {
      setCurrentRootId(clickedNode.id);
      
      // Get the visible nodes and edges for the new root
      const { visibleNodes, visibleEdges } = getVisibleNodesAndEdges(
        clickedNode.id,
        allNodes,
        allEdges
      );
      
      // Reset positions to force re-layout
      const nodesWithResetPositions = visibleNodes.map(node => ({
        ...node,
        // Add a stable key that doesn't change on every render
        key: `${node.id}-${clickedNode.id}`,
        position: { x: 0, y: 0 } // Reset position to force re-layout
      }));
      
      console.log('New visible nodes:', nodesWithResetPositions.length);
      console.log('New visible edges:', visibleEdges.length);
      
      // Update the nodes and edges
      setNodes(nodesWithResetPositions);
      setEdges(visibleEdges);
      
      // Apply layout - use the current layout type
      applyLayout(currentLayoutType);
      
      setLayouting(false);
    }, 100);
  };

  const createRawResponseFlow = useCallback((result: string, rawResponse?: string) => {
    // Reset existing nodes and edges
    setNodes([]);
    setEdges([]);
    setAllNodes([]);
    setAllEdges([]);
    setCurrentRootId(null);
    
    const displayText = result || '';
    const rawText = rawResponse || '';
    
    // Create a simple visualization for the raw response
    const newNodes: Node[] = [
      {
        id: 'root',
        type: 'custom',
        data: { 
          label: 'Raw Response',
          isRoot: true,
          hasChildren: true
        },
        position: { x: 250, y: 50 },
      }
    ];
    
    const newEdges: Edge[] = [];
    
    // Split the text into chunks if it's too long
    if (displayText.length > 300) {
      const chunks = [];
      for (let i = 0; i < displayText.length; i += 300) {
        chunks.push(displayText.substring(i, i + 300));
      }
      
      chunks.forEach((chunk, index) => {
        newNodes.push({
          id: `chunk-${index}`,
          type: 'custom',
          data: { 
            label: `Part ${index + 1}: ${chunk}`,
            isRoot: false,
            hasChildren: false
          },
          position: { x: 250, y: 150 + (index * 100) },
        });
        
        newEdges.push({
          id: `edge-root-${index}`,
          source: 'root',
          target: `chunk-${index}`,
          animated: true,
          type: 'straight',
          style: { stroke: '#9c27b0', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#9c27b0',
          },
        });
      });
    } else {
      newNodes.push({
        id: 'raw-text',
        type: 'custom',
        data: { 
          label: displayText,
          isRoot: false,
          hasChildren: false
        },
        position: { x: 250, y: 150 },
      });
      
      newEdges.push({
        id: 'edge-root-raw',
        source: 'root',
        target: 'raw-text',
        animated: true,
        type: 'straight',
        style: { stroke: '#9c27b0', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#9c27b0',
        },
      });
    }
    
    // If we have the raw response and it's different from the result, add it as well
    if (rawText && rawText !== displayText) {
      newNodes.push({
        id: 'original-response',
        type: 'custom',
        data: { 
          label: 'Original Response (first 300 chars): ' + rawText.substring(0, 300) + (rawText.length > 300 ? '...' : ''),
          isRoot: false,
          hasChildren: false
        },
        position: { x: 250, y: newNodes.length * 100 + 150 },
      });
      
      newEdges.push({
        id: 'edge-root-original',
        source: 'root',
        target: 'original-response',
        animated: true,
        type: 'straight',
        style: { stroke: '#9c27b0', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#9c27b0',
        },
      });
    }
    
    console.log('Setting raw response flow nodes:', newNodes.length);
    console.log('Setting raw response flow edges:', newEdges.length);
    
    // First set the all nodes and edges
    setAllNodes(newNodes);
    setAllEdges(newEdges);
    
    // Then set the current root
    setCurrentRootId('root');
    
    // Finally set the visible nodes and edges
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  const applyLayout = async (layoutType: 'vertical' | 'horizontal' | 'radial' | 'force') => {
    if (!nodes.length) {
      console.log('No nodes to layout');
      return;
    }
    
    console.log(`Applying ${layoutType} layout to ${nodes.length} nodes`);
    setLayouting(true);
    // Update the current layout type
    setCurrentLayoutType(layoutType);
    
    try {
      let layoutedElements;
      
      // Use tighter spacing for the layout
      const layoutOptions = {
        'elk.layered.spacing.nodeNodeBetweenLayers': '80', // Reduced from 150
        'elk.spacing.nodeNode': '50', // Reduced from 100
      };
      
      switch (layoutType) {
        case 'vertical':
          layoutedElements = await getVerticalTreeLayout(nodes, edges, layoutOptions);
          break;
        case 'horizontal':
          layoutedElements = await getHorizontalTreeLayout(nodes, edges, layoutOptions);
          break;
        case 'radial':
          layoutedElements = await getRadialLayout(nodes, edges);
          break;
        case 'force':
          layoutedElements = await getForceLayout(nodes, edges, {
            'elk.spacing.nodeNode': '60' // Reduced from 120
          });
          break;
        default:
          layoutedElements = await getVerticalTreeLayout(nodes, edges, layoutOptions);
      }
      
      console.log(`Layout applied, got ${layoutedElements.nodes.length} nodes with positions`);
      
      // Create completely new node objects to force re-render
      const newNodes = layoutedElements.nodes.map(node => ({
        ...node,
        // Use a stable key that doesn't change on every render
        key: `${node.id}-${layoutType}`,
      }));
      
      setNodes([...newNodes]);
      setEdges([...layoutedElements.edges]);
      
      // Fit the view to show all nodes
      setTimeout(() => {
        console.log('Fitting view to show all nodes');
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    } catch (err) {
      console.error('Error applying layout:', err);
    } finally {
      setLayouting(false);
    }
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setAllNodes([]);
    setAllEdges([]);
    setInputText('');
    setError('');
    setCurrentRootId(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputPanel 
        onSubmit={handleSubmit}
        onClear={clearGraph}
        loading={loading}
        error={error}
      />
      
      {lastResponse && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={toggleViewMode}
            startIcon={viewMode === 'json' ? <CodeIcon /> : <AccountTreeIcon />}
            sx={{ borderRadius: 2 }}
            disabled={!lastResponse.isValidJson}
          >
            {viewMode === 'json' ? 'Show Raw Response' : 'Show JSON View'}
          </Button>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
        <ReactFlow
          key={`flow-${currentRootId}-${currentLayoutType}`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#9c27b0',
            },
            style: {
              stroke: '#9c27b0',
              strokeWidth: 2,
            },
            animated: true,
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{
            stroke: '#9c27b0',
            strokeWidth: 2,
          }}
          fitView
          proOptions={{ hideAttribution: true }}
          zoomOnScroll={false}
          panOnScroll={true}
          selectionOnDrag={false}
          panOnDrag={true}
          elementsSelectable={true}
          nodesConnectable={false}
        >
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeColor={(node) => {
              return node.data.isRoot ? '#9c27b0' : '#e0e0e0';
            }}
          />
          <Background color="#f5f5f5" gap={16} />
          <Panel position="top-right">
            <FlowControls 
              onLayoutChange={applyLayout}
              disabled={layouting || !nodes.length}
              currentLayout={currentLayoutType}
            />
          </Panel>
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default FlowContent; 