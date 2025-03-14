import { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';

interface InputPanelProps {
  onSubmit: (inputText: string) => void;
  onClear: () => void;
  loading: boolean;
  error: string;
}

const InputPanel = ({ onSubmit, onClear, loading, error }: InputPanelProps) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        label="Enter any text to process"
        multiline
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        fullWidth
        variant="outlined"
        placeholder="Enter any text or question here..."
        error={!!error}
        helperText={error || 'Press Ctrl+Enter to process'}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={loading || !inputText.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          sx={{
            borderRadius: '28px',
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          {loading ? 'Processing...' : 'Process Text'}
        </Button>
        
        <Tooltip title="Clear graph">
          <Button
            variant="outlined"
            onClick={onClear}
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: '28px',
              borderColor: 'rgba(156, 39, 176, 0.5)',
              color: '#9c27b0',
              '&:hover': {
                borderColor: '#9c27b0',
                backgroundColor: 'rgba(156, 39, 176, 0.04)',
              },
            }}
          >
            Clear
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default InputPanel; 