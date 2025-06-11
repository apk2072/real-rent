import React from 'react';

interface ResultDisplayProps {
  results: any;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ results }) => {
  // Check if results is an array
  if (Array.isArray(results)) {
    return (
      <div className="results-container">
        <h2>Results</h2>
        <p>{results.length} records found</p>
        <table className="results-table">
          <thead>
            <tr>
              {results.length > 0 && Object.keys(results[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value: any, i) => (
                  <td key={i}>{value !== null ? String(value) : 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  // Check if results is a financial data response
  if (results && (results.type === 'mortgage_rates' || results.type === 'interest_rates' || results.type === 'all_rates')) {
    return (
      <div className="results-container">
        <h2>Financial Data</h2>
        <div className="summary-box">
          <h3>Summary</h3>
          <p>{results.summary}</p>
        </div>
        
        {/* Display mortgage rates if available */}
        {(results.type === 'mortgage_rates' || results.type === 'all_rates') && (
          <div className="rates-section">
            <h3>Mortgage Rates</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Loan Type</th>
                  <th>Rate (%)</th>
                  <th>APR (%)</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {(results.mortgage_rates || results.data).map((rate: any, index: number) => (
                  <tr key={index}>
                    <td>{rate.loanType}</td>
                    <td>{rate.rate}</td>
                    <td>{rate.apr}</td>
                    <td>{rate.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Display interest rates if available */}
        {(results.type === 'interest_rates' || results.type === 'all_rates') && (
          <div className="rates-section">
            <h3>Interest Rates</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Rate (%)</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {(results.interest_rates || results.data).map((rate: any, index: number) => (
                  <tr key={index}>
                    <td>{rate.type}</td>
                    <td>{rate.rate}</td>
                    <td>{rate.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
  
  // Check if results is an object with message and examples (guidance)
  if (results && results.message && results.examples) {
    return (
      <div className="results-container">
        <h2>Information</h2>
        <p>{results.message}</p>
        <h3>Example Queries:</h3>
        <ul>
          {results.examples.map((example: string, index: number) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      </div>
    );
  }
  
  // For other object results (like summary statistics)
  return (
    <div className="results-container">
      <h2>Results</h2>
      <table className="results-table">
        <tbody>
          {Object.entries(results).map(([key, value]) => (
            <tr key={key}>
              <td className="key-cell">{key.replace(/_/g, ' ')}</td>
              <td className="value-cell">
                {typeof value === 'number' 
                  ? key.includes('rate') || key.includes('percent') 
                    ? `${Number(value).toFixed(2)}%` 
                    : key.includes('rent') || key.includes('deposit') 
                      ? `$${Number(value).toFixed(2)}` 
                      : value
                  : String(value)
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultDisplay;
