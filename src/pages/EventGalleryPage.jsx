import React, { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import EventGallery from './EventGallery'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import GalleryLighting from '../components/scene/GalleryLighting'
import BackButton from '../components/ui/BackButton'
import { useMobileDetection } from '../hooks/useMobileDetection'
import CameraDebugOverlay from '../components/ui/CameraDebugOverlay'


export default function EventGalleryPage() {
    const [cameraPos, setCameraPos] = useState({ x: '0.00', y: '0.00', z: '0.00' })
    const [distance, setDistance] = useState('0.00')
    const platformLightRef = useRef()
    const isMobile = useMobileDetection()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBackClick = useCallback(() => {
        window.location.href = '/'
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{
                    position: isMobile ? [0, 5, 15] : [28.45, 18.92, 35.21],
                    fov: isMobile ? 65 : 40,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: !isMobile,
                    toneMapping: THREE.NoToneMapping,
                    toneMappingExposure: 1,
                    outputColorSpace: THREE.SRGBColorSpace,
                    alpha: false,
                    powerPreference: isMobile ? 'low-power' : 'high-performance'
                }}
            >
                <SolidPurpleBackground />
                <fog attach="fog" args={['#0a0a1a', isMobile ? 25 : 100, isMobile ? 50 : 100]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <GalleryLighting isMobile={isMobile} platformLightRef={platformLightRef} />

                <EventGallery />

                <OrbitControls
                    target={[-5, 7, 0]}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={isMobile ? 12 : 30}
                    maxDistance={isMobile ? 20 : 50}
                    maxPolarAngle={Math.PI / 2.2}
                    minPolarAngle={Math.PI / 4}
                    minAzimuthAngle={-Math.PI / 3}
                    maxAzimuthAngle={Math.PI / 3}
                    panSpeed={isMobile ? 0.4 : 0.3}
                    rotateSpeed={isMobile ? 0.4 : 0.3}
                    zoomSpeed={isMobile ? 0.5 : 0.4}
                    enableDamping={true}
                    dampingFactor={0.1}
                />

                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 0.35 : 0.3}
                        luminanceThreshold={isMobile ? 0.6 : 0.95}
                        luminanceSmoothing={0.5}
                        radius={isMobile ? 0.6 : 0.5}
                    />
                </EffectComposer>
            </Canvas>

            <div className="ui-overlay">
                <h1>EVENT GALLERY</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Explore Our Memorable Moments</p>

                <BackButton
                    onClick={handleBackClick}
                    isMobile={isMobile}
                    label="← Back to Campus"
                />
            </div>

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}
        </div>
    )
}
