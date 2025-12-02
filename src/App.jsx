import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import MainCampus from './components/MainCampus'
import TeamsBuilding from './components/TeamsBuilding'
import './App.css'


// Camera Debug Component - OUTSIDE Canvas (HTML overlay)
function CameraDebugOverlay({ cameraPosition, distance }) {
  const [copied, setCopied] = useState(false)


  const copyToClipboard = () => {
    const code = `position: [${cameraPosition.x}, ${cameraPosition.y}, ${cameraPosition.z}]`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ffff',
      padding: '15px 20px',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '13px',
      border: '2px solid #00ffff',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
      minWidth: '250px',
      zIndex: 1000
    }}>
      <div style={{
        borderBottom: '1px solid #00ffff',
        paddingBottom: '8px',
        marginBottom: '10px',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        📷 Camera Debug
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Current Position:</strong>
      </div>
      <div style={{ paddingLeft: '10px', color: '#88ffff' }}>
        <div>X: {cameraPosition.x}</div>
        <div>Y: {cameraPosition.y}</div>
        <div>Z: {cameraPosition.z}</div>
      </div>

      <div style={{ marginTop: '10px', marginBottom: '5px' }}>
        <strong>Distance:</strong> <span style={{ color: '#88ffff' }}>{distance}</span>
      </div>


      <button
        onClick={copyToClipboard}
        style={{
          marginTop: '12px',
          padding: '8px 15px',
          background: copied ? '#00ff00' : '#00ffff',
          border: 'none',
          color: '#000',
          cursor: 'pointer',
          borderRadius: '5px',
          fontWeight: 'bold',
          fontSize: '12px',
          width: '100%',
          transition: 'all 0.2s'
        }}
      >
        {copied ? '✓ Copied!' : '📋 Copy Position'}
      </button>


      <div style={{
        marginTop: '12px',
        fontSize: '10px',
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        borderTop: '1px solid #333',
        paddingTop: '8px'
      }}>
        Remove this component in production
      </div>
    </div>
  )
}


// Camera tracker component - INSIDE Canvas (updates state)
function CameraTracker({ onUpdate }) {
  const { camera } = useThree()


  useFrame(() => {
    onUpdate({
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2)
    }, camera.position.length().toFixed(2))
  })


  return null
}


// Main Campus Page Component
function MainCampusPage() {
  const [currentScene, setCurrentScene] = useState('main-campus')
  const [cameraPos, setCameraPos] = useState({ x: '16.02', y: '9.71', z: '18.25' })
  const [distance, setDistance] = useState('27.74')

  const handleCameraUpdate = (pos, dist) => {
    setCameraPos(pos)
    setDistance(dist)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          // position: [15.08, 15.07, 18.26],
          position: [14.71, 8.68, 18.02],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          toneMapping: 0,
          toneMappingExposure: 1
        }}
      >
        {/* Track camera position for debug overlay */}
        <CameraTracker onUpdate={handleCameraUpdate} />

        {/* Lighting Setup - Enhanced for better visibility and shadows */}
        <ambientLight intensity={1.2} color="#6080a0" />

        <hemisphereLight
          skyColor="#4060ff"
          groundColor="#2a1a3e"
          intensity={0.8}
        />

        {/* Main directional light with enhanced shadow quality */}
        <directionalLight
          position={[15, 25, 15]}
          intensity={2.0}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-camera-near={0.5}
          shadow-camera-far={100}
          shadow-bias={-0.0001}
        />

        {/* Fill lights for better overall illumination */}
        <pointLight
          position={[-15, 15, 10]}
          intensity={8}
          color="#4080ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight
          position={[15, 12, -10]}
          intensity={6}
          color="#8060ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Scene */}
        <MainCampus onBuildingClick={(building) => {
          // console.log('Building clicked:', building)
          setCurrentScene(building)
        }} />

        {/* OrbitControls - Minimal movement, no azimuth constraints to prevent camera shift */}
        <OrbitControls
          target={[1.2, 4, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          // Distance locked around current 23.82 - very minimal zoom allowed
          minDistance={23}
          maxDistance={24.5}
          // Tight vertical angle limits
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 3.5}
          // No azimuth constraints - they cause camera repositioning
          // User can rotate horizontally but with slow speed
          // Very slow movement speeds for fine control
          panSpeed={0.2}
          rotateSpeed={0.25}
          zoomSpeed={0.3}
          // Smooth damping
          enableDamping={true}
          dampingFactor={0.1}
        />

        {/* Post-processing for Enhanced Neon Glow */}
        <EffectComposer>
          <Bloom
            intensity={2}  // Increased for stronger glow
            luminanceThreshold={0.9}  // Lower threshold to catch more glow
            luminanceSmoothing={0.7}
            radius={0.8}  // Larger radius for softer, more beautiful glow
          />
        </EffectComposer>
      </Canvas>

      {/* UI Overlays - OUTSIDE Canvas */}
      <div className="ui-overlay">
        <h1>ACSES</h1>
        <p className="subtitle">Association of Computer Science & Engineering Students</p>

        {currentScene !== 'main-campus' && (
          <button
            className="back-button"
            onClick={() => setCurrentScene('main-campus')}
          >
            ← Back to Campus
          </button>
        )}
      </div>

      {/* Camera Debug Panel - Hidden for production */}
      {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}
    </div>
  )
}


// Teams Building Page Component
// Teams Building Page Component
function TeamsBuildingPage() {
  const [cameraPos, setCameraPos] = useState({ x: '62.78', y: '54.16', z: '36.34' })
  const [distance, setDistance] = useState('10.00')

  const handleCameraUpdate = (pos, dist) => {
    setCameraPos(pos)
    setDistance(dist)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          position: [67.63, 33.55, 42.28],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          toneMapping: 0,
          toneMappingExposure: 1
        }}
      >
        {/* Track camera position for debug overlay */}
        <CameraTracker onUpdate={handleCameraUpdate} />

        {/* Minimal ambient - let ceiling lights do the work */}
        <ambientLight intensity={0.1} color="#0a0a1a" />

        {/* Very subtle fill light */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.3}
          color="#ffffff"
        />

        {/* Scene */}
        <TeamsBuilding />

        {/* OrbitControls */}
        <OrbitControls
          target={[0, 17, -31]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={100}
          // Smooth controls like Main Campus
          enableDamping={true}
          dampingFactor={0.1}
          panSpeed={0.3}
          rotateSpeed={0.3}
          zoomSpeed={0.4}
        />

        {/* Post-processing for Neon Glow - MATCHED to Main Campus */}
        <EffectComposer>
          <Bloom
            intensity={2}              // Match Main Campus
            luminanceThreshold={0.9}   // Match Main Campus
            luminanceSmoothing={0.7}   // Match Main Campus
            radius={0.8}               // Match Main Campus
          />
        </EffectComposer>
      </Canvas>

      {/* UI Overlays - MATCHED to Main Campus style */}
      <div className="ui-overlay">
        <h1>TEAMS</h1>
        <p className="subtitle" style={{ padding: '10px' }}>Meet Our Amazing Teams</p>

        {/* Back button - Small, left-aligned */}
        <button
          className="back-button"
          onClick={() => window.location.href = '/'}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',  // Changed from right to left
            padding: '8px 16px',  // Smaller padding
            background: 'rgba(255, 0, 255, 0.2)',
            border: '2px solid #ff00ff',
            color: '#ff00ff',
            fontSize: '12px',  // Smaller font
            fontWeight: '600',
            borderRadius: '6px',  // Slightly smaller radius
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            letterSpacing: '1px',
            textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
            pointerEvents: 'auto',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 0, 255, 0.4)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 0, 255, 0.2)'
            e.target.style.transform = 'scale(1)'
          }}
        >
          ← Back to Campus
        </button>

      </div>

      {/* Camera Debug Panel - DISABLED for production */}
      {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}
    </div>
  )
}



// Main App Component with Routing
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainCampusPage />} />
      <Route path="/teams" element={<TeamsBuildingPage />} />
    </Routes>
  )
}


export default App