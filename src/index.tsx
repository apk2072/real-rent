import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles.css';

// Add console log to verify the script is running
console.log('React application starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React application mounted successfully');
}
