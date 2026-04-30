import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function routerBasename(): string | undefined {
  const raw = process.env.PUBLIC_URL ?? '';
  if (!raw || raw === '/') return undefined;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing root element');
}

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
