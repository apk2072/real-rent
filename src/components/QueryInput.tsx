import React, { useState } from 'react';

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
          <h4>Example queries:</h4>
          <ul>
            {queryType === 'natural_language' ? (
              <>
                <li onClick={() => setQuery('Show me all vacant units')}>
                  Show me all vacant units
                </li>
                <li onClick={() => setQuery('What is the occupancy rate?')}>
                  What is the occupancy rate?
                </li>
                <li onClick={() => setQuery('Show me units with rent above 1500')}>
                  Show me units with rent above 1500
                </li>
                <li onClick={() => setQuery('Which leases are expiring soon?')}>
                  Which leases are expiring soon?
                </li>
              </>
            ) : (
              <>
                <li onClick={() => setQuery('SELECT * FROM rent_roll WHERE status = "VU"')}>
                  SELECT * FROM rent_roll WHERE status = "VU"
                </li>
                <li
                  onClick={() =>
                    setQuery(
                      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "O" THEN 1 ELSE 0 END) as occupied FROM rent_roll'
                    )
                  }
                >
                  SELECT COUNT(*) as total, SUM(CASE WHEN status = "O" THEN 1 ELSE 0 END) as occupied FROM rent_roll
                </li>
                <li onClick={() => setQuery('SELECT * FROM rent_roll WHERE unit = "110"')}>
                  SELECT * FROM rent_roll WHERE unit = "110"
                </li>
                <li onClick={() => setQuery('SELECT * FROM rent_roll WHERE autobill > 1500')}>
                  SELECT * FROM rent_roll WHERE autobill {">"} 1500
                </li>
              </>
            )}
          </ul>
        </div>

        <button type="submit" className="submit-button">
          Run Query
        </button>
      </form>
    </div>
  );
};

export default QueryInput;
