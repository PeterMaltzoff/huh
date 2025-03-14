'use client';

import { 
  Container, 
  Typography, 
  Paper,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { ReactFlowProvider } from 'reactflow';
import FlowContent from './components/flow/FlowContent';

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

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 64px)' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            backgroundColor: 'rgba(156, 39, 176, 0.04)',
            border: '1px solid rgba(156, 39, 176, 0.1)'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#9c27b0' }}>
            Huh - Ollama Text Processor
          </Typography>
          <Typography variant="body1">
            Enter any text below to process it with Ollama. The text will be explained and converted to JSON, then visualized as a graph.
          </Typography>
        </Paper>
        
        <ReactFlowProvider>
          <FlowContent />
        </ReactFlowProvider>
      </Container>
    </ThemeProvider>
  );
}
