import { ReactElement } from 'react';
import { Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ListIcon from '@mui/icons-material/List';

type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'unknown';

interface TypeChipProps {
  type: DataType;
  value?: string;
}

const TypeChip = ({ type, value }: TypeChipProps) => {
  const getIcon = (): ReactElement => {
    switch (type) {
      case 'string':
        return <TextFieldsIcon fontSize="small" />;
      case 'number':
        return <NumbersIcon fontSize="small" />;
      case 'boolean':
        return value === 'true' ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />;
      case 'array':
        return <ListIcon fontSize="small" />;
      case 'object':
        return <CodeIcon fontSize="small" />;
      default:
        return <CodeIcon fontSize="small" />;
    }
  };

  const getColor = (): string => {
    switch (type) {
      case 'string':
        return '#4caf50'; // Green
      case 'number':
        return '#2196f3'; // Blue
      case 'boolean':
        return '#ff9800'; // Orange
      case 'array':
        return '#9c27b0'; // Purple
      case 'object':
        return '#f44336'; // Red
      case 'null':
        return '#9e9e9e'; // Gray
      default:
        return '#9e9e9e'; // Gray
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={type}
      size="small"
      sx={{
        backgroundColor: `${getColor()}20`,
        color: getColor(),
        borderColor: `${getColor()}50`,
        border: '1px solid',
        fontWeight: 500,
        fontSize: '0.7rem',
        height: '20px',
        '& .MuiChip-icon': {
          color: getColor(),
        },
      }}
    />
  );
};

export default TypeChip; 