import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import { LangProvider } from './lib/i18n.tsx'
import { StoreProvider } from './lib/store.tsx'
import './index.css'

// The shared demo is served from a fixed file URL, so routing must not depend on the address bar.
const Router = import.meta.env.MODE === 'demo' ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <LangProvider>
          <App />
        </LangProvider>
      </StoreProvider>
    </Router>
  </StrictMode>,
)
