import http from 'http';
import { FinancialDataService, MortgageRate, InterestRate } from './financialDataService';

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

// Define the MCP tool for querying financial data
export class FinancialDataTool implements MCPTool {
  name = 'financial_data_query';
  description = 'Query current mortgage and interest rates';
  
  private financialService: FinancialDataService;
  
  constructor() {
    this.financialService = new FinancialDataService();
  }
  
  async process(params: any): Promise<any> {
    const { query_type, query } = params;
    
    try {
      if (query_type === 'natural_language') {
        // For natural language queries, we'll use predefined queries based on keywords
        const lowerQuery = query.toLowerCase();
        console.log('Processing financial query:', lowerQuery);
        
        // Check for mortgage rate queries
        if (lowerQuery.includes('mortgage') || 
            lowerQuery.includes('home loan') || 
            lowerQuery.includes('house loan')) {
          console.log('Querying mortgage rates');
          const mortgageRates = await this.financialService.getMortgageRates();
          return {
            type: 'mortgage_rates',
            data: mortgageRates,
            summary: `Current 30-year fixed mortgage rate: ${mortgageRates[0]?.rate}%, 15-year fixed: ${mortgageRates[1]?.rate}%`
          };
        }
        
        // Check for interest rate queries
        if (lowerQuery.includes('interest') || 
            lowerQuery.includes('fed') || 
            lowerQuery.includes('federal reserve') ||
            lowerQuery.includes('prime rate')) {
          console.log('Querying interest rates');
          const interestRates = await this.financialService.getInterestRates();
          return {
            type: 'interest_rates',
            data: interestRates,
            summary: `Current Federal Funds Rate: ${interestRates[0]?.rate}%, Prime Rate: ${interestRates[1]?.rate}%`
          };
        }
        
        // If query mentions rates but not specific, return both
        if (lowerQuery.includes('rate')) {
          console.log('Querying all rates');
          const [mortgageRates, interestRates] = await Promise.all([
            this.financialService.getMortgageRates(),
            this.financialService.getInterestRates()
          ]);
          
          return {
            type: 'all_rates',
            mortgage_rates: mortgageRates,
            interest_rates: interestRates,
            summary: `Current 30-year mortgage: ${mortgageRates[0]?.rate}%, Federal Funds Rate: ${interestRates[0]?.rate}%`
          };
        }
        
        // Default response if no specific query matched
        return {
          message: "Please ask about mortgage rates or interest rates.",
          examples: [
            "What are current mortgage rates?",
            "What is the federal funds rate?",
            "Show me all current rates"
          ]
        };
      }
      
      throw new Error('Invalid query_type. Use "natural_language"');
    } catch (error) {
      console.error('Error processing financial query:', error);
      throw error;
    }
  }
}

// Create and configure the MCP server
export function createFinancialMCPServer(): MCPServer {
  // Store registered tools
  const tools: Record<string, MCPTool> = {};
  let httpServer: http.Server | null = null;
  
  const server: MCPServer = {
    name: 'financial-data-server',
    description: 'MCP server for querying financial data',
    port: 3101, // Use a different port from the rent roll server
    registerTool: (tool: MCPTool) => {
      console.log(`Registered financial tool: ${tool.name}`);
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
      httpServer.listen(3101, () => {
        console.log(`Financial MCP server started on port 3101`);
      });
    }
  };
  
  // Register the financial data tool
  server.registerTool(new FinancialDataTool());
  
  return server;
}
