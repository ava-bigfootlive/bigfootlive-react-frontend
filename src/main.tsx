import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('BigfootLive React App - Starting initialization...');

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  console.log('Creating React root and rendering app...');
  try {
    createRoot(rootElement).render(
      <App />
    );
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Failed to render React app:', error);
    // Show error in the DOM
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h2>React Failed to Load</h2>
        <pre>${error}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element not found!');
}