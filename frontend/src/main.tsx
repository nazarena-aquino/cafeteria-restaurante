import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#2C1810',
            color: '#FAF3E8',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#C9943A', secondary: '#FAF3E8' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FAF3E8' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
