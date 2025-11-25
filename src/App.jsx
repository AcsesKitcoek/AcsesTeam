import React, { useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import MainCampus from './components/MainCampus'
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
        <div>X: {cameraPosition.x} <span style={{ color: '#666', fontSize: '11px' }}>(Target: 13.96)</span></div>
        <div>Y: {cameraPosition.y} <span style={{ color: '#666', fontSize: '11px' }}>(Target: 9.72)</span></div>
        <div>Z: {cameraPosition.z} <span style={{ color: '#666', fontSize: '11px' }}>(Target: 6.14)</span></div>
      </div>
      
      <div style={{ marginTop: '10px', marginBottom: '5px' }}>
        <strong>Distance:</strong> <span style={{ color: '#88ffff' }}>{distance}</span>
        <span style={{ color: '#666', fontSize: '11px', marginLeft: '5px' }}>(Blender: 18.09)</span>
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


// Set Initial Blender Camera
function SetBlenderCamera() {
  const { camera } = useThree()
  
  React.useEffect(() => {
    // Set exact Blender viewport position
    camera.position.set(14.14, 13.09, 19.96)
    camera.lookAt(1.2, 4, 0)
    camera.updateProjectionMatrix()
    console.log('✓ Camera set to Blender position: [14.02, 8.43, 14.80]')
  }, [camera])
  
  return null
}


function App() {
  const [currentScene, setCurrentScene] = useState('main-campus')
  const [cameraPos, setCameraPos] = useState({ x: '15.96', y: '8.76', z: '15.45' })
  const [distance, setDistance] = useState('27.74')


  const handleCameraUpdate = (pos, dist) => {
    setCameraPos(pos)
    setDistance(dist)
  }


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ 
          position: [16.02, 9.71, 18.25],  // Exact Blender viewport position
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
        {/* Set camera to exact Blender position */}
        <SetBlenderCamera />


        {/* Track camera position for debug overlay */}
        <CameraTracker onUpdate={handleCameraUpdate} />


        {/* Lighting Setup */}
        <ambientLight intensity={15} color="#404060" />
        
        <hemisphereLight 
          skyColor="#87ceeb" 
          groundColor="#2a2a3e" 
          intensity={0.6} 
        />
        
        <directionalLight 
          position={[15, 20, 10]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />


        {/* Accent lighting for neon glow */}
        {/* <pointLight position={[0, 10, 0]} intensity={40} color="#00ffff" /> */}
        {/* <pointLight position={[-10, 8, 10]} intensity={10.8} color="#aa00ff" /> */}


        {/* Scene */}
        {currentScene === 'main-campus' && (
          <MainCampus onBuildingClick={(building) => {
            console.log('Building clicked:', building)
            setCurrentScene(building)
          }} />
        )}


        {/* OrbitControls */}
        <OrbitControls 
          target={[1.2, 4, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={12}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
        />


        {/* Post-processing for Neon Glow */}
        <EffectComposer>
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.7} 
            luminanceSmoothing={0.6}
            radius={0.6}
          />
        </EffectComposer>
      </Canvas>


      {/* UI Overlays - OUTSIDE Canvas */}
      <div className="ui-overlay">
        {/* <h1>ACSES - Association of Computer Science & Engineering Students</h1> */}
        
        {currentScene !== 'main-campus' && (
          <button 
            className="back-button"
            onClick={() => setCurrentScene('main-campus')}
          >
            ← Back to Campus
          </button>
        )}
      </div>


      {/* Camera Debug Panel - OUTSIDE Canvas */}
      <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} />
    </div>
  )
}


export default App