import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as THREE from 'three'
import App from './App.jsx'
import './index.css'

// Enable Three.js internal cache for better performance on reload/revisit
THREE.Cache.enabled = true

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
