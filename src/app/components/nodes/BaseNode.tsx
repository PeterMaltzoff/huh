import { memo, ReactNode, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Paper, Box, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface BaseNodeData {
  label: string;
  isRoot?: boolean;
  isSpecialFormat?: boolean;
  hasChildren?: boolean;
}

export interface BaseNodeProps extends NodeProps<BaseNodeData> {
  children?: ReactNode;
  handlePosition?: Position;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  width?: number;
}

const BaseNode = ({ 
  data, 
  isConnectable, 
  id, 
  children, 
  handlePosition = Position.Bottom,
  showSourceHandle = true,
  showTargetHandle = true,
  width,
  selected,
}: BaseNodeProps) => {
  const isRoot = data.isRoot || false;
  const hasChildren = data.hasChildren || false;
  const reactFlowInstance = useReactFlow();
  
  // Calculate appropriate width based on content length
  const getNodeWidth = () => {
    if (width) return width;
    
    const baseWidth = 180;
    const charWidth = 8; // Approximate width of a character in pixels
    const maxWidth = 450;
    
    // Calculate width based on the longest line in the content
    const lines = data.label.split('\n');
    const longestLine = lines.reduce((max, line) => 
      line.length > max.length ? line : max, '');
    
    return Math.min(
      Math.max(baseWidth, longestLine.length * charWidth),
      maxWidth
    );
  };
  
  const nodeWidth = getNodeWidth();

  return (
    <Paper
      elevation={2}
      sx={{
        padding: '10px',
        borderRadius: '8px',
        width: nodeWidth,
        backgroundColor: isRoot ? 'rgba(156, 39, 176, 0.08)' : 
                     selected ? 'rgba(156, 39, 176, 0.05)' : 'white',
        border: isRoot ? '1px solid rgba(156, 39, 176, 0.5)' : 
                selected ? '1px solid rgba(156, 39, 176, 0.4)' : '1px solid #e0e0e0',
        position: 'relative',
        cursor: hasChildren ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderColor: isRoot ? 'rgba(156, 39, 176, 0.8)' : 
                     hasChildren ? 'rgba(156, 39, 176, 0.5)' : '#bdbdbd',
          transform: hasChildren ? 'translateY(-2px)' : 'none',
          backgroundColor: hasChildren ? 'rgba(156, 39, 176, 0.05)' : undefined,
        },
        userSelect: 'none',
      }}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={handlePosition === Position.Bottom ? Position.Top : Position.Left}
          isConnectable={isConnectable}
          style={{
            background: '#9c27b0',
            width: '8px',
            height: '8px',
            border: '2px solid white',
          }}
        />
      )}
      
      <Box sx={{ position: 'relative' }}>
        {children}
        
        {hasChildren && !isRoot && (
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -8, 
              right: -8, 
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9c27b0',
              border: '1px solid rgba(156, 39, 176, 0.3)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                transform: 'scale(1.1)',
              }
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </Box>
        )}
      </Box>
      
      {showSourceHandle && (
        <Handle
          type="source"
          position={handlePosition}
          isConnectable={isConnectable}
          style={{
            background: '#9c27b0',
            width: '8px',
            height: '8px',
            border: '2px solid white',
          }}
        />
      )}
    </Paper>
  );
};

export default memo(BaseNode); 