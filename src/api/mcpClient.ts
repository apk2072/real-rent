// Placeholder for MCP client
// In a real implementation, this would use the MCP SDK

// Define a simple client interface
interface MCPClient {
  callTool: (toolName: string, params: any) => Promise<any>;
}

// Create a mock MCP client for development that connects to our local MCP servers
const mcpClient: MCPClient = {
  callTool: async (toolName: string, params: any) => {
    console.log(`Mock MCP client calling tool: ${toolName}`, params);
    
    try {
      // Determine which server to call based on the tool name
      const port = toolName === 'financial_data_query' ? 3101 : 3100;
      
      // Make a direct HTTP request to our MCP server
      const response = await fetch(`http://localhost:${port}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling MCP tool:', error);
      
      // Fallback to mock data if the MCP server is not available
      if (toolName === 'financial_data_query') {
        const { query_type, query } = params;
        
        // Return different mock data based on the query
        if (query_type === 'natural_language') {
          const lowerQuery = query.toLowerCase();
          
          if (lowerQuery.includes('mortgage')) {
            return {
              type: 'mortgage_rates',
              data: [
                {
                  loanType: '30-year fixed',
                  rate: 6.85,
                  apr: 6.87,
                  lastUpdated: new Date().toLocaleDateString()
                },
                {
                  loanType: '15-year fixed',
                  rate: 6.15,
                  apr: 6.18,
                  lastUpdated: new Date().toLocaleDateString()
                }
              ],
              summary: 'Current 30-year fixed mortgage rate: 6.85%, 15-year fixed: 6.15%'
            };
          } else if (lowerQuery.includes('interest') || lowerQuery.includes('fed')) {
            return {
              type: 'interest_rates',
              data: [
                {
                  type: 'Federal Funds Rate',
                  rate: 5.33,
                  lastUpdated: new Date().toLocaleDateString()
                },
                {
                  type: 'Prime Rate',
                  rate: 8.50,
                  lastUpdated: new Date().toLocaleDateString()
                }
              ],
              summary: 'Current Federal Funds Rate: 5.33%, Prime Rate: 8.50%'
            };
          }
        }
        
        // Default response
        return {
          message: "Please ask about mortgage rates or interest rates.",
          examples: [
            "What are current mortgage rates?",
            "What is the federal funds rate?",
            "Show me all current rates"
          ]
        };
      } else if (toolName === 'rent_roll_query') {
        // Existing fallback logic for rent roll queries
        const { query_type, query } = params;
        
        // Return different mock data based on the query
        if (query_type === 'natural_language') {
          const lowerQuery = query.toLowerCase();
          
          if (lowerQuery.includes('vacant')) {
            return [
              { 
                unit: '112', 
                name: null,
                type: '1x1.1',
                sq_ft: 493,
                autobill: 24.60,
                deposit: 16.99,
                moved_in: null,
                lease_ends: null,
                status: 'VU'
              },
              { 
                unit: '204', 
                name: null,
                type: '2x2.1',
                sq_ft: 950,
                autobill: 1450.00,
                deposit: 1450.00,
                moved_in: null,
                lease_ends: null,
                status: 'VU'
              }
            ];
          } else if (lowerQuery.includes('occupied')) {
            return [
              { 
                unit: '110', 
                name: 'Jason Chen',
                type: '2x2.4',
                sq_ft: 990,
                autobill: 1664.36,
                deposit: 524.60,
                moved_in: '04/21/2018',
                lease_ends: '06/06/2026',
                status: 'O'
              },
              { 
                unit: '111', 
                name: 'Daniel Nichols',
                type: '1x1.3',
                sq_ft: 744,
                autobill: 1383.70,
                deposit: 1042.57,
                moved_in: '09/07/2024',
                lease_ends: '08/23/2025',
                status: 'O'
              }
            ];
          } else if (lowerQuery.includes('summary') || lowerQuery.includes('statistics')) {
            return {
              total_units: 152,
              occupied_units: 127,
              vacant_units: 17,
              total_potential_rent: 180268.90,
              total_actual_rent: 169039.66,
              avg_occupied_rent: 1331.02
            };
          }
        }
        
        // Default response
        return [
          { 
            unit: '110', 
            name: 'Jason Chen',
            type: '2x2.4',
            sq_ft: 990,
            autobill: 1664.36,
            deposit: 524.60,
            moved_in: '04/21/2018',
            lease_ends: '06/06/2026',
            status: 'O'
          },
          { 
            unit: '111', 
            name: 'Daniel Nichols',
            type: '1x1.3',
            sq_ft: 744,
            autobill: 1383.70,
            deposit: 1042.57,
            moved_in: '09/07/2024',
            lease_ends: '08/23/2025',
            status: 'O'
          },
          { 
            unit: '112', 
            name: null,
            type: '1x1.1',
            sq_ft: 493,
            autobill: 24.60,
            deposit: 16.99,
            moved_in: null,
            lease_ends: null,
            status: 'VU'
          }
        ];
      }
      
      throw new Error(`Unknown tool: ${toolName}`);
    }
  }
};

// Function to query the rent roll data
export async function queryRentRoll(queryType: 'natural_language' | 'sql', query: string) {
  try {
    const response = await mcpClient.callTool('rent_roll_query', {
      query_type: queryType,
      query,
    });
    
    return response;
  } catch (error) {
    console.error('Error querying rent roll data:', error);
    throw error;
  }
}

// Function to query financial data
export async function queryFinancialData(query: string) {
  try {
    const response = await mcpClient.callTool('financial_data_query', {
      query_type: 'natural_language',
      query,
    });
    
    return response;
  } catch (error) {
    console.error('Error querying financial data:', error);
    throw error;
  }
}

export default mcpClient;
