import '@fontsource/archivo/latin-400.css';
import '@fontsource/archivo/latin-600.css';
import '@fontsource/archivo/latin-700.css';
import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-700.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
