import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainCampusPage from './pages/MainCampusPage'
import TeamsBuildingPage from './pages/TeamsBuildingPage'
import ContactUsPage from './pages/ContactUsPage'
import EventGalleryPage from './pages/EventGalleryPage'
import AboutACSESPage from './pages/AboutACSESPage'
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
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/events" element={<EventGalleryPage />} />
      <Route path="/about" element={<AboutACSESPage />} />
    </Routes>
  )
}

export default App
