import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- THIS WAS MISSING
import './index.css'
import App from './App.jsx'
import { FirebaseProvider } from './hooks/useFirebase.jsx' 
import { ThemeProvider } from './hooks/useTheme.jsx'
import { TourProvider } from './context/TourContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseProvider>
      <ThemeProvider>
        {/* Router must be here so TourContext works */}
        <BrowserRouter> 
            <TourProvider>
                <App />
            </TourProvider>
        </BrowserRouter>
      </ThemeProvider>
    </FirebaseProvider>
  </React.StrictMode>,
)