import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGLTF, useProgress } from '@react-three/drei';
import MainCampusPage from './pages/MainCampusPage';
import TeamsBuildingPage from './pages/TeamsBuildingPage';
import ContactUsPage from './pages/ContactUsPage';
import EventGalleryPage from './pages/EventGalleryPage';
import AboutACSESPage from './pages/AboutACSESPage';
import './App.css';

// --- Global Asset Preloader ---
// An array of all model paths that need to be preloaded.
const modelUrls = [
  '/models/main-campus.glb',
  '/models/towerss.glb',
  '/models/contactUs.glb',
  '/models/event-gallery.glb',
  '/models/about-acses.glb',
];

// Preload all the models. This will start downloading them in the background.
// Note: This assumes your Draco decoder is configured globally for useGLTF.
// If not, you might need to pass the decoder instance, but typically this is configured once.
useGLTF.preload(modelUrls);

/**
 * Custom Cyberpunk Loader Component
 */
function CustomLoader() {
  const { progress, active } = useProgress();

  return (
    <div className={`loader-container ${!active ? 'finished' : ''}`}>
      <div className="loader-content">
        <div className="loader-rings">
          <div className="ring ring-outer"></div>
          <div className="ring ring-inner"></div>
        </div>
        <div className="loader-text">
          <h2 className="loader-title">ACSES</h2>
          <span className="loader-percentage">{progress.toFixed(0)}%</span>
          <div className="loader-bar-container">
            <div
              className="loader-bar-progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App Component with Routing and Global Preloader
 */
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainCampusPage />} />
        <Route path="/teams" element={<TeamsBuildingPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/events" element={<EventGalleryPage />} />
        <Route path="/about" element={<AboutACSESPage />} />
      </Routes>

      <CustomLoader />
    </>
  );
}

export default App;
