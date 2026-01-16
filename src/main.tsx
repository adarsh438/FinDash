import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CurrencyProvider } from './context/CurrencyContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CurrencyProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
