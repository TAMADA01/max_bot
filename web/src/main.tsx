import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MaxUI } from '@maxhub/max-ui';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <MaxUI>
          <App />
      </MaxUI>
  </StrictMode>,
)
