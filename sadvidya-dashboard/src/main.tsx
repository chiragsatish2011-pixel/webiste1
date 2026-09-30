import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './context/DataContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/*
      basename comes from Vite's base setting: '/' when you run it locally or
      host it at a domain root, '/webiste1/' on GitHub Pages. Without it every
      route would sit at the wrong path on Pages.
    */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
