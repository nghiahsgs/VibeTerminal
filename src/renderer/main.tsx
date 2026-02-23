import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/global.css'

// No StrictMode - incompatible with xterm.js terminal lifecycle
createRoot(document.getElementById('root')!).render(<App />)
