import { createMCPServer } from '../api/mcpService';

// Create and start the MCP server
const server = createMCPServer();

// Start the server
server.start().then(() => {
  console.log(`MCP server started on port ${server.port}`);
}).catch((error: Error) => {
  console.error('Failed to start MCP server:', error);
});
