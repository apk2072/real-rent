import { createFinancialMCPServer } from '../api/financialMcpService';

// Create and start the Financial MCP server
const server = createFinancialMCPServer();

// Start the server
server.start().then(() => {
  console.log(`Financial MCP server started on port ${server.port}`);
}).catch((error: Error) => {
  console.error('Failed to start Financial MCP server:', error);
});
