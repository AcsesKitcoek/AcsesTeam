import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainCampusPage from './pages/MainCampusPage'
import TeamsBuildingPage from './pages/TeamsBuildingPage'
import './App.css'


/**
 * Main App Component with Routing
 * Simplified and modularized with extracted page components
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainCampusPage />} />
      <Route path="/teams" element={<TeamsBuildingPage />} />
    </Routes>
  )
}

export default App
