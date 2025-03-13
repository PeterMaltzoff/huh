'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Container, 
  Typography, 
  CircularProgress,
  Paper,
  ThemeProvider,
  createTheme,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HubIcon from '@mui/icons-material/Hub';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReactFlow, { 
  Node, 
  Edge, 
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
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './components/CustomNode';
import { 
  getVerticalTreeLayout, 
  getHorizontalTreeLayout, 
  getRadialLayout, 
  getForceLayout 
} from './utils/layoutUtils';

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Create a custom theme with a bright unique color
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // Bright purple as the main color
    },
    secondary: {
      main: '#8bc34a', // Light green for the play button
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
          },
        },
      },
    },
  },
});

// Main component that uses ReactFlow hooks
function FlowContent() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layouting, setLayouting] = useState(false);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();

  // Apply layout when nodes change
  useEffect(() => {
    if (nodes.length > 0 && !layouting) {
      applyLayout('vertical');
    }
  }, [nodes.length]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Response from Ollama:', data);
        
        if (data.isValidJson) {
          // Create nodes and edges from the JSON data
          createFlowFromJson(data.result);
        } else {
          setError('Received invalid JSON from Ollama. Displaying raw response.');
          console.log('Invalid JSON received:', data.rawResponse || data.result);
          
          // Try to display the raw text as a simple node
          createRawResponseFlow(data.result, data.rawResponse);
        }
      } else {
        setError(data.error || 'An error occurred while processing your request');
      }
    } catch (err) {
      console.error('Error submitting text:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const applyLayout = async (layoutType: 'vertical' | 'horizontal' | 'radial' | 'force') => {
    if (!nodes.length) return;
    
    setLayouting(true);
    
    try {
      let result;
      
      switch (layoutType) {
        case 'vertical':
          result = await getVerticalTreeLayout(nodes, edges);
          break;
        case 'horizontal':
          result = await getHorizontalTreeLayout(nodes, edges);
          break;
        case 'radial':
          result = await getRadialLayout(nodes, edges);
          break;
        case 'force':
          result = await getForceLayout(nodes, edges);
          break;
        default:
          result = await getVerticalTreeLayout(nodes, edges);
      }
      
      setNodes([...result.nodes]);
      
      // Fit view after layout is applied
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 50);
    } catch (error) {
      console.error('Error applying layout:', error);
    } finally {
      setLayouting(false);
    }
  };

  const createRawResponseFlow = useCallback((result: string, rawResponse?: string) => {
    // Reset existing nodes and edges
    setNodes([]);
    setEdges([]);
    
    const displayText = result || '';
    const rawText = rawResponse || '';
    
    // Create a simple visualization for the raw response
    const newNodes: Node[] = [
      {
        id: 'root',
        type: 'custom',
        data: { 
          label: 'Raw Response',
          isRoot: true
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
            isRoot: false
          },
          position: { x: 250, y: 150 + (index * 100) },
        });
        
        newEdges.push({
          id: `edge-root-${index}`,
          source: 'root',
          target: `chunk-${index}`,
          animated: true,
          type: 'straight',
          style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: theme.palette.primary.main,
          },
        });
      });
    } else {
      newNodes.push({
        id: 'raw-text',
        type: 'custom',
        data: { 
          label: displayText,
          isRoot: false
        },
        position: { x: 250, y: 150 },
      });
      
      newEdges.push({
        id: 'edge-root-raw',
        source: 'root',
        target: 'raw-text',
        animated: true,
        type: 'straight',
        style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: theme.palette.primary.main,
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
          isRoot: false
        },
        position: { x: 250, y: newNodes.length * 100 + 150 },
      });
      
      newEdges.push({
        id: 'edge-root-original',
        source: 'root',
        target: 'original-response',
        animated: true,
        type: 'straight',
        style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: theme.palette.primary.main,
        },
      });
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  const createFlowFromJson = useCallback((jsonData: any) => {
    // Reset existing nodes and edges
    setNodes([]);
    setEdges([]);
    
    // Create a simple visualization based on the JSON structure
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Create a root node for the main JSON object
    newNodes.push({
      id: 'root',
      type: 'custom',
      data: { 
        label: 'JSON Result',
        isRoot: true
      },
      position: { x: 250, y: 50 },
    });
    
    // Function to recursively process JSON objects and arrays
    const processJsonNode = (
      parentId: string, 
      data: any, 
      startX: number, 
      startY: number, 
      isArray: boolean = false
    ) => {
      let currentY = startY;
      let maxChildX = startX; // Track the furthest X position
      
      if (Array.isArray(data)) {
        // Handle arrays
        data.forEach((item, index) => {
          const nodeId = `${parentId}-array-${index}`;
          
          if (typeof item === 'object' && item !== null) {
            // Create a node for this array item
            newNodes.push({
              id: nodeId,
              type: 'custom',
              data: { 
                label: `[${index}]`,
                isRoot: false
              },
              position: { x: startX + 200, y: currentY },
            });
            
            // Connect to parent with improved edge styling
            newEdges.push({
              id: `edge-${parentId}-${nodeId}`,
              source: parentId,
              target: nodeId,
              animated: true,
              type: 'straight',
              style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: theme.palette.primary.main,
              },
            });
            
            // Process this object recursively
            const childMaxX = processJsonNode(nodeId, item, startX + 350, currentY);
            maxChildX = Math.max(maxChildX, childMaxX);
            currentY += 200; // Increase Y for next item - more vertical space
          } else {
            // Simple value in array
            newNodes.push({
              id: nodeId,
              type: 'custom',
              data: { 
                label: `[${index}]: ${String(item)}`,
                isRoot: false
              },
              position: { x: startX + 200, y: currentY },
            });
            
            // Connect to parent with improved edge styling
            newEdges.push({
              id: `edge-${parentId}-${nodeId}`,
              source: parentId,
              target: nodeId,
              animated: true,
              type: 'straight',
              style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: theme.palette.primary.main,
              },
            });
            
            currentY += 120; // Smaller spacing for simple values, but still more space
          }
        });
      } else if (typeof data === 'object' && data !== null) {
        // Check if this is a leaf object with exactly two keys, one being "name"
        const keys = Object.keys(data);
        if (keys.length === 2 && keys.includes('name')) {
          // Get the other key (not "name")
          const otherKey = keys.find(k => k !== 'name') || '';
          const nameValue = String(data['name']);
          const otherValue = String(data[otherKey]);
          
          // Create a special formatted node
          newNodes.push({
            id: `${parentId}-special-node`,
            type: 'custom',
            data: { 
              label: `${nameValue}|${otherKey}:${otherValue}`,
              isRoot: false,
              isSpecialFormat: true
            },
            position: { x: startX + 200, y: currentY },
          });
          
          // Connect to parent
          newEdges.push({
            id: `edge-${parentId}-special-node`,
            source: parentId,
            target: `${parentId}-special-node`,
            animated: true,
            type: 'straight',
            style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: theme.palette.primary.main,
            },
          });
          
          currentY += 120;
        } else {
          // Handle regular objects
          Object.entries(data).forEach(([key, value], index) => {
            const nodeId = `${parentId}-${key.replace(/\s+/g, '-')}`;
            
            if (typeof value === 'object' && value !== null) {
              // Create a node for this key
              newNodes.push({
                id: nodeId,
                type: 'custom',
                data: { 
                  label: key,
                  isRoot: false
                },
                position: { x: startX + 200, y: currentY },
              });
              
              // Connect to parent with improved edge styling
              newEdges.push({
                id: `edge-${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                animated: true,
                type: 'straight',
                style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: theme.palette.primary.main,
                },
              });
              
              // Process this object recursively
              const isValueArray = Array.isArray(value);
              const childMaxX = processJsonNode(nodeId, value, startX + 350, currentY, isValueArray);
              maxChildX = Math.max(maxChildX, childMaxX);
              currentY += 200; // Increase Y for next property - more vertical space
            } else {
              // Simple key-value pair
              newNodes.push({
                id: nodeId,
                type: 'custom',
                data: { 
                  label: `${key}: ${String(value)}`,
                  isRoot: false
                },
                position: { x: startX + 200, y: currentY },
              });
              
              // Connect to parent with improved edge styling
              newEdges.push({
                id: `edge-${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                animated: true,
                type: 'straight',
                style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: theme.palette.primary.main,
                },
              });
              
              currentY += 120; // Smaller spacing for simple values, but still more space
            }
          });
        }
      }
      
      return Math.max(startX, maxChildX);
    };
    
    // Start processing from the root
    processJsonNode('root', jsonData, 250, 150);
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges, theme.palette.primary.main]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && inputText.trim()) {
      handleSubmit();
    }
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
            Huh - Ollama Text Processor
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              width: '100%', 
              maxWidth: 700,
              mt: 1,
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter text to process..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              disabled={loading}
              sx={{ 
                mr: 1.5,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                  '& fieldset': {
                    borderWidth: 1.5,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.light,
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '14px 16px',
                  fontSize: '1rem',
                },
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={loading || !inputText.trim()}
              sx={{ 
                minWidth: '60px',
                height: '60px',
                borderRadius: '30px',
                boxShadow: '0 4px 10px rgba(139, 195, 74, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(139, 195, 74, 0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={28} color="inherit" /> : <PlayArrowIcon fontSize="large" />}
            </Button>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
              {error}
            </Typography>
          )}
        </Box>
        
        <Paper 
          ref={reactFlowWrapper}
          elevation={4}
          sx={{ 
            flex: 1,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            connectionLineType={ConnectionLineType.Straight}
            defaultEdgeOptions={{
              type: 'straight',
              animated: true,
              style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }}
            fitViewOptions={{
              padding: 0.2,
            }}
            zoomOnScroll={false}
            panOnScroll={true}
            panOnDrag={true}
            nodesDraggable={true}
          >
            <Controls 
              showInteractive={true} 
              position="bottom-right"
              style={{
                marginRight: 10,
                marginBottom: 10,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: 8,
              }}
            />
            <MiniMap 
              nodeStrokeColor={(n) => {
                return n.data?.isRoot ? theme.palette.primary.main : '#555';
              }}
              nodeColor={(n) => {
                return n.data?.isRoot ? theme.palette.primary.main : '#fff';
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
              style={{
                borderRadius: 8,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Background color="#f0f0f0" gap={16} size={1} />
            
            <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button 
                variant="outlined" 
                size="medium" 
                onClick={clearGraph}
                startIcon={<CloseIcon />}
                sx={{ 
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  borderRadius: 2,
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  mb: 2,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: 'rgba(156, 39, 176, 0.04)',
                  }
                }}
              >
                Clear Graph
              </Button>
              
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Layout Options
              </Typography>
              
              <ButtonGroup variant="outlined" orientation="vertical" sx={{ mb: 2 }}>
                <Tooltip title="Vertical Tree Layout" placement="left">
                  <Button 
                    onClick={() => applyLayout('vertical')}
                    startIcon={<SwapVertIcon />}
                    disabled={layouting || nodes.length === 0}
                    sx={{ borderColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                  >
                    Vertical
                  </Button>
                </Tooltip>
                <Tooltip title="Horizontal Tree Layout" placement="left">
                  <Button 
                    onClick={() => applyLayout('horizontal')}
                    startIcon={<SwapHorizIcon />}
                    disabled={layouting || nodes.length === 0}
                    sx={{ borderColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                  >
                    Horizontal
                  </Button>
                </Tooltip>
                <Tooltip title="Radial Layout" placement="left">
                  <Button 
                    onClick={() => applyLayout('radial')}
                    startIcon={<AccountTreeIcon />}
                    disabled={layouting || nodes.length === 0}
                    sx={{ borderColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                  >
                    Radial
                  </Button>
                </Tooltip>
                <Tooltip title="Force-Directed Layout" placement="left">
                  <Button 
                    onClick={() => applyLayout('force')}
                    startIcon={<HubIcon />}
                    disabled={layouting || nodes.length === 0}
                    sx={{ borderColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                  >
                    Force
                  </Button>
                </Tooltip>
              </ButtonGroup>
              
              {layouting && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CircularProgress size={24} color="primary" />
                </Box>
              )}
            </Panel>
          </ReactFlow>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

// Wrapper component that provides the ReactFlow context
export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
}
