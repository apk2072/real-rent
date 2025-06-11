// Placeholder for MCP server
// In a real implementation, this would use the MCP SDK
import { RentRollDatabase } from '../db/database';
import http from 'http';

// Define interfaces to mock the MCP SDK
interface MCPServer {
  name: string;
  description: string;
  port: number;
  registerTool: (tool: MCPTool) => void;
  start: () => Promise<void>;
}

interface MCPTool {
  name: string;
  description: string;
  process: (params: any) => Promise<any>;
}

// Define the MCP tool for querying rent roll data
export class RentRollQueryTool implements MCPTool {
  name = 'rent_roll_query';
  description = 'Query the rent roll database with natural language or SQL';
  
  private db: RentRollDatabase;
  
  constructor() {
    this.db = RentRollDatabase.getInstance();
  }
  
  async process(params: any): Promise<any> {
    const { query_type, query } = params;
    
    try {
      if (query_type === 'sql') {
        // Direct SQL query
        console.log('Executing SQL query:', query);
        return await this.db.executeQuery(query);
      } else if (query_type === 'natural_language') {
        // For natural language queries, we'll use predefined queries based on keywords
        const lowerQuery = query.toLowerCase();
        console.log('Processing natural language query:', lowerQuery);
        
        // Check for specific query types
        if (lowerQuery.includes('vacant') || lowerQuery.includes('empty') || lowerQuery.includes('unoccupied')) {
          console.log('Querying vacant units');
          return await this.db.getRentRollByStatus('VU');
        } 
        
        if (lowerQuery.includes('occupied') || lowerQuery.includes('rented')) {
          console.log('Querying occupied units');
          return await this.db.getRentRollByStatus('O');
        } 
        
        if (lowerQuery.includes('summary') || lowerQuery.includes('statistics') || 
            lowerQuery.includes('overview') || lowerQuery.includes('report')) {
          console.log('Querying summary statistics');
          return await this.db.getSummaryStatistics();
        }
        
        // Unit specific queries
        const unitMatch = lowerQuery.match(/unit\s+(\d+)/i) || lowerQuery.match(/apartment\s+(\d+)/i);
        if (unitMatch && unitMatch[1]) {
          const unitNumber = unitMatch[1];
          console.log('Querying specific unit:', unitNumber);
          return await this.db.executeQuery('SELECT * FROM rent_roll WHERE unit = ?', [unitNumber]);
        }
        
        // Rent range queries
        const rentMatch = lowerQuery.match(/rent\s+(above|over|more than|greater than)\s+(\d+)/i) ||
                          lowerQuery.match(/rent\s+(exceeding)\s+(\d+)/i);
        if (rentMatch && rentMatch[2]) {
          const rentAmount = parseInt(rentMatch[2], 10);
          console.log('Querying units with rent above:', rentAmount);
          return await this.db.executeQuery('SELECT * FROM rent_roll WHERE autobill > ?', [rentAmount]);
        }
        
        const rentBelowMatch = lowerQuery.match(/rent\s+(below|under|less than|lower than)\s+(\d+)/i);
        if (rentBelowMatch && rentBelowMatch[2]) {
          const rentAmount = parseInt(rentBelowMatch[2], 10);
          console.log('Querying units with rent below:', rentAmount);
          return await this.db.executeQuery('SELECT * FROM rent_roll WHERE autobill < ?', [rentAmount]);
        }
        
        // Lease ending soon queries
        if (lowerQuery.includes('lease end') || lowerQuery.includes('expiring') || 
            lowerQuery.includes('expiration') || lowerQuery.includes('ending soon')) {
          const currentYear = new Date().getFullYear();
          console.log('Querying leases ending soon');
          return await this.db.executeQuery(
            "SELECT * FROM rent_roll WHERE lease_ends LIKE ? AND lease_ends IS NOT NULL", 
            [`%/${currentYear}%`]
          );
        }
        
        // If no specific query is matched, inform the user
        console.log('No specific query matched, returning limited results');
        return {
          message: "Your query wasn't specific enough. Try asking about vacant units, occupied units, specific unit numbers, rent ranges, or lease expirations.",
          sample_results: await this.db.executeQuery('SELECT * FROM rent_roll LIMIT 5')
        };
      }
      
      throw new Error('Invalid query_type. Use "sql" or "natural_language"');
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
}

// Create and configure the MCP server
export function createMCPServer(): MCPServer {
  // Store registered tools
  const tools: Record<string, MCPTool> = {};
  let httpServer: http.Server | null = null;
  
  const server: MCPServer = {
    name: 'rent-roll-server',
    description: 'MCP server for querying rent roll data',
    port: 3100,
    registerTool: (tool: MCPTool) => {
      console.log(`Registered tool: ${tool.name}`);
      tools[tool.name] = tool;
    },
    start: async () => {
      // Create a simple HTTP server to handle requests
      httpServer = http.createServer(async (req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }
        
        // Only handle POST requests to /tools/{toolName}
        if (req.method === 'POST' && req.url) {
          const toolMatch = req.url.match(/\/tools\/([^\/]+)/);
          if (toolMatch) {
            const toolName = toolMatch[1];
            const tool = tools[toolName];
            
            if (tool) {
              // Read the request body
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              
              req.on('end', async () => {
                try {
                  // Parse the request body
                  const params = JSON.parse(body);
                  
                  // Process the request
                  const result = await tool.process(params);
                  
                  // Send the response
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
                } catch (error) {
                  console.error('Error processing request:', error);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Internal server error' }));
                }
              });
              
              return;
            }
          }
        }
        
        // Handle 404 for all other requests
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      });
      
      // Start the server
      httpServer.listen(3100, () => {
        console.log(`Real MCP server started on port 3100`);
      });
    }
  };
  
  // Register the rent roll query tool
  server.registerTool(new RentRollQueryTool());
  
  return server;
}
