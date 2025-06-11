import { queryRentRoll, queryFinancialData } from './mcpClient';

export async function handleQuery(query: string, queryType: 'natural_language' | 'sql') {
  try {
    // Check if this is a financial query when using natural language
    if (queryType === 'natural_language') {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('mortgage') || 
          lowerQuery.includes('interest rate') || 
          lowerQuery.includes('fed rate') ||
          lowerQuery.includes('prime rate')) {
        // This is a financial query
        return await queryFinancialData(query);
      }
    }
    
    // Otherwise, treat as a rent roll query
    const results = await queryRentRoll(queryType, query);
    return results;
  } catch (error) {
    console.error('Error processing query:', error);
    throw error;
  }
}
