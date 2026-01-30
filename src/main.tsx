/**
 * @file main.tsx
 * @description Entry point for the Barby Music Club frontend application.
 * 
 * This file initializes the React application with:
 * - App component containing all providers and routing
 * 
 * @see https://github.com/kfirmoscovich1/barby.co.il-remake-react
 */

import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>,
)
