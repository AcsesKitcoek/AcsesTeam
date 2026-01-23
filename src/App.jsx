import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGLTF, useTexture } from '@react-three/drei';
import MainCampusPage from './pages/MainCampusPage';
import TeamsBuildingPage from './pages/TeamsBuildingPage';
import ContactUsPage from './pages/ContactUsPage';
import EventGalleryPage from './pages/EventGalleryPage';
import AboutACSESPage from './pages/AboutACSESPage';
import { SmartLoader } from './components/ui/SmartLoader'; // Import the new SmartLoader
import { imageManifest } from './assets/imageManifest';
import './App.css';

// --- Global Asset Preloader ---
const modelUrls = [
  '/models/main-campus.glb',
  '/models/towerss.glb',
  '/models/contactUs.glb',
  '/models/event-gallery.glb',
  '/models/about-acses.glb',
];
const textureUrls = [
  '/images/ACSES_Image.jpg',
  ...imageManifest
];

// Preload all assets. This will start downloading them in the background.
useGLTF.preload(modelUrls);
useTexture.preload(textureUrls);

/**
 * Main App Component with Routing and the new Smart Loader system.
 */
function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<MainCampusPage />} />
        <Route path="/teams" element={<TeamsBuildingPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/events" element={<EventGalleryPage />} />
        <Route path="/about" element={<AboutACSESPage />} />
      </Routes>

      {/* Render the new, self-contained Smart Loader */}
      <SmartLoader />
    </main>
  );
}

export default App;
