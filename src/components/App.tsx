import React, { useState } from 'react';
import QueryInput from './QueryInput';
import ResultDisplay from './ResultDisplay';
import { handleQuery } from '../api/queryHandler';

const App: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onQuerySubmit = async (query: string, queryType: 'natural_language' | 'sql') => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the query handler directly instead of fetch
      const data = await handleQuery(query, queryType);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Real Rent Analysis</h1>
        <p>Ask questions about your rent roll data using natural language or SQL</p>
      </header>
      
      <main>
        <QueryInput onSubmit={onQuerySubmit} />
        
        {loading && <div className="loading">Loading results...</div>}
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {results && <ResultDisplay results={results} />}
      </main>
      
      <footer>
        <p>Powered by Model Context Protocol</p>
      </footer>
    </div>
  );
};

export default App;
