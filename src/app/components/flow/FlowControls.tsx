import { ButtonGroup, Button, Tooltip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HubIcon from '@mui/icons-material/Hub';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface FlowControlsProps {
  onLayoutChange: (layoutType: 'vertical' | 'horizontal' | 'radial' | 'force') => void;
  disabled: boolean;
  currentLayout?: 'vertical' | 'horizontal' | 'radial' | 'force';
}

const FlowControls = ({ onLayoutChange, disabled, currentLayout = 'radial' }: FlowControlsProps) => {
  return (
    <ButtonGroup 
      variant="outlined" 
      aria-label="layout control" 
      size="small"
      sx={{ 
        mb: 2,
        '& .MuiButton-root': {
          borderColor: 'rgba(156, 39, 176, 0.5)',
          color: '#9c27b0',
          '&:hover': {
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.04)',
          },
        }
      }}
    >
      <Tooltip title="Vertical Tree Layout">
        <span>
          <Button 
            onClick={() => onLayoutChange('vertical')}
            disabled={disabled}
            startIcon={<SwapVertIcon />}
            sx={{
              ...(currentLayout === 'vertical' && {
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                borderColor: '#9c27b0',
                fontWeight: 'bold',
              })
            }}
          >
            Vertical
          </Button>
        </span>
      </Tooltip>
      
      <Tooltip title="Horizontal Tree Layout">
        <span>
          <Button 
            onClick={() => onLayoutChange('horizontal')}
            disabled={disabled}
            startIcon={<SwapHorizIcon />}
            sx={{
              ...(currentLayout === 'horizontal' && {
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                borderColor: '#9c27b0',
                fontWeight: 'bold',
              })
            }}
          >
            Horizontal
          </Button>
        </span>
      </Tooltip>
      
      <Tooltip title="Radial Layout">
        <span>
          <Button 
            onClick={() => onLayoutChange('radial')}
            disabled={disabled}
            startIcon={<HubIcon />}
            sx={{
              ...(currentLayout === 'radial' && {
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                borderColor: '#9c27b0',
                fontWeight: 'bold',
              })
            }}
          >
            Radial
          </Button>
        </span>
      </Tooltip>
      
      <Tooltip title="Force-Directed Layout">
        <span>
          <Button 
            onClick={() => onLayoutChange('force')}
            disabled={disabled}
            startIcon={<AccountTreeIcon />}
            sx={{
              ...(currentLayout === 'force' && {
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                borderColor: '#9c27b0',
                fontWeight: 'bold',
              })
            }}
          >
            Force
          </Button>
        </span>
      </Tooltip>
    </ButtonGroup>
  );
};

export default FlowControls; 