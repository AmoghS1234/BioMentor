import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// FIXED: Changed extension from .js to .jsx (or removed it)
import { FirebaseProvider } from './hooks/useFirebase.jsx' 

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>,
)