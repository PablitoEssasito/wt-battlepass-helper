import React from 'react'
import ReactDOM from 'react-dom/client'
import './base.css'
import App from './App.tsx'
import './index.css'

// Renders over the build-time markup instead of hydrating it; scripts/prerender.js explains why.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
