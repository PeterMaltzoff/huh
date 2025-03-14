import { useState, ReactNode } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Typography, Box, Tooltip, IconButton, Divider } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import BaseNode, { BaseNodeData } from './BaseNode';
import TypeChip from './TypeChip';

interface DataNodeProps extends NodeProps<BaseNodeData> {}

const DataNode = (props: DataNodeProps) => {
  const { data, isConnectable, id } = props;
  const [copied, setCopied] = useState(false);
  const label = data.label || '';
  const isSpecialFormat = data.isSpecialFormat || false;
  
  // Determine if this is a key-value pair
  const isKeyValue = label.includes(':') && !label.startsWith('[');
  
  // Extract value type for styling
  let valueType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'unknown' = 'unknown';
  let displayLabel: ReactNode = label;
  let valueContent = '';
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(label).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Process the label to determine type and format display
  if (isKeyValue) {
    const colonIndex = label.indexOf(':');
    const key = label.substring(0, colonIndex).trim();
    valueContent = label.substring(colonIndex + 1).trim();
    
    // Determine value type
    if (valueContent.startsWith('"') && valueContent.endsWith('"')) {
      valueType = 'string';
      valueContent = valueContent.substring(1, valueContent.length - 1);
    } else if (valueContent === 'true' || valueContent === 'false') {
      valueType = 'boolean';
    } else if (valueContent === 'null') {
      valueType = 'null';
    } else if (!isNaN(Number(valueContent))) {
      valueType = 'number';
    } else if (valueContent.startsWith('{')) {
      valueType = 'object';
    } else if (valueContent.startsWith('[')) {
      valueType = 'array';
    }
    
    displayLabel = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            sx={{ 
              color: '#555',
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '40%'
            }}
          >
            {key}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TypeChip type={valueType} value={valueContent} />
            
            <Tooltip title="Copy value" placement="top">
              <IconButton 
                size="small" 
                onClick={handleCopy}
                sx={{ 
                  ml: 'auto', 
                  opacity: copied ? 1 : 0.5,
                  color: copied ? 'success.main' : 'inherit',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            fontSize: '0.85rem',
            color: valueType === 'string' ? '#4caf50' : 
                   valueType === 'number' ? '#2196f3' : 
                   valueType === 'boolean' ? '#ff9800' : '#666'
          }}
        >
          {valueContent}
        </Typography>
      </>
    );
  } else if (isSpecialFormat) {
    // Handle special format for leaf objects with name and one other property
    const [name, otherProp] = label.split('|');
    const [otherKey, otherValue] = otherProp ? otherProp.split(':') : ['', ''];
    
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
          <PersonIcon sx={{ mr: 1, color: 'var(--primary-color, #9c27b0)' }} />
          <Typography 
            variant="subtitle2" 
            fontWeight={600}
            sx={{ 
              color: 'var(--primary-color, #9c27b0)',
              letterSpacing: '0.5px'
            }}
          >
            {name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: '#555', mr: 1 }}>
            {otherKey}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {otherValue}
          </Typography>
        </Box>
      </>
    );
  } else {
    // Simple label display for array items or root objects
    displayLabel = (
      <Typography 
        variant="body2" 
        sx={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          fontSize: '0.85rem'
        }}
      >
        {label}
      </Typography>
    );
  }
  
  return (
    <BaseNode {...props}>
      {displayLabel}
    </BaseNode>
  );
};

export default DataNode; 