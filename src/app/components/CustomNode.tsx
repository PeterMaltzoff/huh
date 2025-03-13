import { memo, ReactNode, useEffect, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Paper, Typography, Box, Chip, Tooltip, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ListIcon from '@mui/icons-material/List';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';

interface CustomNodeData {
  label: string;
  isRoot?: boolean;
  isSpecialFormat?: boolean;
}

const CustomNode = ({ data, isConnectable, id }: NodeProps<CustomNodeData>) => {
  const isRoot = data.isRoot || false;
  const isSpecialFormat = data.isSpecialFormat || false;
  const label = data.label || '';
  const [copied, setCopied] = useState(false);
  const reactFlowInstance = useReactFlow();
  
  // Determine if this is a key-value pair
  const isKeyValue = label.includes(':') && !label.startsWith('[');
  
  // Extract value type for styling
  let valueType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'unknown' = 'unknown';
  let displayLabel: ReactNode = label;
  
  // Calculate appropriate width based on content length
  const getNodeWidth = () => {
    const baseWidth = 180;
    const charWidth = 8; // Approximate width of a character in pixels
    const maxWidth = 450;
    
    // Calculate width based on the longest line in the content
    const lines = label.split('\n');
    const longestLine = lines.reduce((max, line) => 
      line.length > max.length ? line : max, '');
    
    const calculatedWidth = Math.min(
      Math.max(baseWidth, longestLine.length * charWidth),
      maxWidth
    );
    
    return calculatedWidth;
  };
  
  const nodeWidth = getNodeWidth();
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(label).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  if (isSpecialFormat) {
    // Handle special format for leaf objects with name and one other property
    const [name, otherProp] = label.split('|');
    const [otherKey, otherValue] = otherProp.split(':');
    
    displayLabel = (
      <>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1.5,
          backgroundColor: 'rgba(156, 39, 176, 0.08)',
          py: 1.5,
          borderRadius: '8px 8px 0 0',
          position: 'relative',
          top: -10,
          mx: -10,
          borderBottom: '1px dashed rgba(156, 39, 176, 0.3)'
        }}>
          <PersonIcon sx={{ mr: 1, color: 'var(--primary-color)' }} />
          <Typography 
            variant="subtitle2" 
            fontWeight={600}
            sx={{ 
              color: 'var(--primary-color)',
              letterSpacing: '0.5px'
            }}
          >
            {name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                px: 1.5, 
                py: 0.7, 
                borderRadius: 1.5,
                fontWeight: 'bold',
                mr: 1.5,
                fontSize: '0.8rem'
              }}
            >
              {otherKey}
            </Typography>
          </Box>
          <Tooltip title={copied ? "Copied!" : "Copy content"}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.6, 
                '&:hover': { opacity: 1 },
                ml: 1
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" sx={{ pl: 0.5, lineHeight: 1.5, mt: 0.5 }}>
          {otherValue}
        </Typography>
      </>
    );
  } else if (isKeyValue) {
    const [key, ...valueParts] = label.split(':');
    const value = valueParts.join(':').trim();
    
    // Check value type
    if (value === 'true' || value === 'false') {
      valueType = 'boolean';
    } else if (!isNaN(Number(value)) && value !== '') {
      valueType = 'number';
    } else if (value === 'null') {
      valueType = 'null';
    } else if (value.startsWith('{') || value.startsWith('[')) {
      valueType = value.startsWith('{') ? 'object' : 'array';
    } else {
      valueType = 'string';
    }
    
    // Format the display with the key and a type indicator
    displayLabel = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                px: 1.5, 
                py: 0.7, 
                borderRadius: 1.5,
                fontWeight: 'bold',
                mr: 1.5,
                fontSize: '0.8rem'
              }}
            >
              {key}
            </Typography>
            <TypeChip type={valueType} />
          </Box>
          <Tooltip title={copied ? "Copied!" : "Copy content"}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.6, 
                '&:hover': { opacity: 1 },
                ml: 1
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" sx={{ pl: 0.5, lineHeight: 1.5 }}>
          {value}
        </Typography>
      </>
    );
  } else if (label.startsWith('[')) {
    // This is an array index
    valueType = 'array';
    displayLabel = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                px: 1.5, 
                py: 0.7, 
                borderRadius: 1.5,
                fontWeight: 'bold',
                mr: 1.5,
                fontSize: '0.8rem'
              }}
            >
              {label.split(':')[0]}
            </Typography>
            <TypeChip type="array" />
          </Box>
          <Tooltip title={copied ? "Copied!" : "Copy content"}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.6, 
                '&:hover': { opacity: 1 },
                ml: 1
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {label.includes(':') && (
          <Typography variant="body2" sx={{ pl: 0.5, lineHeight: 1.5 }}>
            {label.split(':')[1].trim()}
          </Typography>
        )}
      </>
    );
  } else if (isRoot) {
    displayLabel = (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="subtitle1" 
          fontWeight={600}
          sx={{ 
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            fontSize: '1.1rem',
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  } else {
    // For other types of nodes, add copy button
    displayLabel = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              flexGrow: 1
            }}
          >
            {label}
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy content"}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.6, 
                '&:hover': { opacity: 1 },
                ml: 1,
                mt: -0.5
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </>
    );
  }
  
  // Update node dimensions in the graph - safely use reactFlowInstance
  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [nodeWidth, reactFlowInstance]);
  
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2.5,
        borderRadius: 2.5,
        width: nodeWidth,
        minWidth: 180,
        maxWidth: 450,
        backgroundColor: isRoot ? 'var(--primary-color)' : '#fff',
        color: isRoot ? '#fff' : 'inherit',
        border: isRoot ? 'none' : isSpecialFormat ? '1px solid var(--primary-color)' : '1px solid var(--primary-color)',
        overflowWrap: 'break-word',
        boxShadow: isRoot 
          ? '0 8px 16px rgba(156, 39, 176, 0.3)' 
          : isSpecialFormat
            ? '0 6px 12px rgba(156, 39, 176, 0.2)'
            : '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isRoot 
            ? '0 10px 20px rgba(156, 39, 176, 0.4)' 
            : isSpecialFormat
              ? '0 8px 16px rgba(156, 39, 176, 0.3)'
              : '0 6px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ 
          background: isRoot ? '#fff' : 'var(--primary-color)',
          width: 10,
          height: 10,
          top: -5,
          border: '2px solid #fff',
          boxShadow: '0 0 6px rgba(0, 0, 0, 0.2)'
        }}
      />
      
      <Box sx={{ 
        wordBreak: 'break-word', 
        whiteSpace: 'pre-wrap',
        maxHeight: '300px',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--primary-color)',
          borderRadius: '3px',
        }
      }}>
        {displayLabel}
      </Box>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ 
          background: isRoot ? '#fff' : 'var(--primary-color)',
          width: 10,
          height: 10,
          bottom: -5,
          border: '2px solid #fff',
          boxShadow: '0 0 6px rgba(0, 0, 0, 0.2)'
        }}
      />
    </Paper>
  );
};

// Helper component for type indicators
const TypeChip = ({ type }: { type: string }) => {
  const chipLabel = type;
  let color: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning' = 'default';
  
  const getIcon = () => {
    switch (type) {
      case 'string':
        return <TextFieldsIcon fontSize="small" />;
      case 'number':
        return <NumbersIcon fontSize="small" />;
      case 'boolean':
        return <CheckIcon fontSize="small" />;
      case 'object':
        return <CodeIcon fontSize="small" />;
      case 'array':
        return <ListIcon fontSize="small" />;
      default:
        return undefined;
    }
  };
  
  switch (type) {
    case 'string':
      color = 'info';
      break;
    case 'number':
      color = 'warning';
      break;
    case 'boolean':
      color = 'success';
      break;
    case 'object':
      color = 'primary';
      break;
    case 'array':
      color = 'secondary';
      break;
    case 'null':
      color = 'error';
      break;
    default:
      break;
  }
  
  return (
    <Chip 
      icon={getIcon()}
      label={chipLabel}
      size="small" 
      color={color}
      sx={{ 
        height: 24, 
        '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.7rem' },
        '& .MuiChip-icon': { fontSize: '1rem' }
      }}
    />
  );
};

export default memo(CustomNode); 