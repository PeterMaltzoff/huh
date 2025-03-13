# Huh - Ollama Text Processor

A beautiful web application that processes text using Ollama models and visualizes the results as a JSON graph.

## Features

- Clean, modern UI with Material UI components
- Text processing with Ollama models
- Two-step processing: Explain text → Convert to JSON
- Advanced JSON visualization with React Flow:
  - Hierarchical representation of nested JSON objects and arrays
  - Color-coded nodes based on data types
  - Interactive graph with zoom, pan, and minimap
  - Multiple layout algorithms (Vertical Tree, Horizontal Tree, Radial, Force-Directed)
  - Smart node sizing that adapts to content length
  - Copy-to-clipboard functionality for node content
  - Special formatting for name-value pairs
  - Direct diagonal edge connections for cleaner visualization
- Beautiful purple and green color scheme
- Handles non-JSON responses gracefully

## Layout Algorithms

The application now supports multiple layout algorithms to optimize node spacing and visualization:

1. **Vertical Tree Layout**: Organizes nodes in a top-down tree structure, ideal for hierarchical data.
2. **Horizontal Tree Layout**: Arranges nodes in a left-to-right tree structure, better for wide hierarchies.
3. **Radial Layout**: Places nodes in a circular pattern around the root node, good for compact visualization.
4. **Force-Directed Layout**: Uses physics simulation to position nodes, automatically minimizing overlaps.

Each layout can be selected from the control panel on the right side of the graph. The application automatically applies the vertical tree layout when data is first loaded.

## Prerequisites

- Node.js and npm
- Ollama installed and running locally
- A running Ollama model (defaults to 'gemma3')

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start Ollama with your preferred model:
   ```
   ollama run gemma3
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. Enter text in the input field
2. Click the green play button
3. The text is sent to the Ollama API for processing:
   - First, Ollama explains the text
   - Then, Ollama converts the explanation to JSON
4. The JSON result is visualized as an interactive graph:
   - Each JSON key becomes a node
   - Nested objects and arrays are displayed hierarchically
   - Nodes are color-coded by data type (string, number, boolean, etc.)
   - Nodes automatically resize based on content length
   - You can copy node content with the copy button
   - Objects with exactly two keys (one being "name") get special formatting
   - Connections between nodes use direct diagonal lines for clarity
5. If the model doesn't return valid JSON, the application will attempt to extract JSON from the response or display the raw text
6. Use the layout controls to optimize the visualization for your specific data

## Advanced Features

### Smart Node Sizing
Nodes automatically adjust their width based on the content length, ensuring that text is displayed properly without unnecessary truncation or wrapping.

### Copy to Clipboard
Each node includes a copy button that allows you to easily copy the node's content to your clipboard.

### Layout Controls
The control panel provides options to switch between different layout algorithms, allowing you to find the best visualization for your data structure.

### Special Formatting for Name-Value Pairs
When the JSON contains a leaf object with exactly two keys, one being "name", the application displays it in a special format with the name prominently displayed at the top and the other property below. This is particularly useful for representing entities like people, products, or locations in a more intuitive way.

### Direct Edge Connections
The graph uses straight diagonal lines to connect nodes instead of orthogonal (right-angled) connections, creating a cleaner and more intuitive visualization of relationships between data elements.

## Technologies Used

- Next.js
- React
- Material UI
- React Flow for interactive graph visualization
- ELK layout algorithms for optimized node positioning
- Ollama API (with gemma3 model)

## License

MIT
