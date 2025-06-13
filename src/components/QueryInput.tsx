import React, { useState, useEffect } from 'react';

interface QueryInputProps {
  onSubmit: (query: string, queryType: 'natural_language' | 'sql') => void;
}

const QueryInput: React.FC<QueryInputProps> = ({ onSubmit }) => {
  const [query, setQuery] = useState<string>('');
  const [queryType, setQueryType] = useState<'natural_language' | 'sql'>('natural_language');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query, queryType);
    }
  };

  const naturalLanguageQueries = [
    'Show me all vacant units',
    'Compare 15-year vs 30-year mortgage rates',
    'What is the occupancy rate?',
    'Show me units with rent above 1500',
    'Which leases are expiring soon?',
    'What are the current mortgage rates?',
    'Calculate monthly payment for a $500,000 property',
    'How have interest rates changed in the last 6 months?',
    'What is the average 30-year fixed mortgage rate today?',
    'What would be the total interest paid on a 30-year loan?'
  ];

  const sqlQueries = [
    'SELECT * FROM rent_roll WHERE status = "VU"',
    'SELECT COUNT(*) as total, SUM(CASE WHEN status = "O" THEN 1 ELSE 0 END) as occupied FROM rent_roll',
    'SELECT * FROM rent_roll WHERE unit = "110"',
    'SELECT * FROM rent_roll WHERE autobill > 1500'
  ];

  const currentQueries = queryType === 'natural_language' ? naturalLanguageQueries : sqlQueries;

  return (
    <div className="query-input-container">
      <form onSubmit={handleSubmit}>
        <div className="query-type-selector">
          <label>
            <input
              type="radio"
              name="queryType"
              value="natural_language"
              checked={queryType === 'natural_language'}
              onChange={() => setQueryType('natural_language')}
            />
            Natural Language
          </label>
          <label>
            <input
              type="radio"
              name="queryType"
              value="sql"
              checked={queryType === 'sql'}
              onChange={() => setQueryType('sql')}
            />
            SQL
          </label>
        </div>

        <div className="query-input">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              queryType === 'natural_language'
                ? 'Ask a question about your rent roll data...'
                : 'Enter an SQL query...'
            }
            rows={5}
          />
        </div>

        <div className="query-examples">
          <h4>Examples:</h4>
          <div className="examples-inline">
            {currentQueries.map((q, index) => (
              <span 
                key={`${queryType}-${index}`} 
                className="example-query" 
                onClick={() => setQuery(q)}
              >
                {q}
                {index < currentQueries.length - 1 && ' | '}
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Run Query
        </button>
      </form>
    </div>
  );
};

export default QueryInput;
