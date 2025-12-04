import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import TeamsBuilding from './TeamsBuilding'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import TeamsBuildingLighting from '../components/scene/TeamsBuildingLighting'
import BackButton from '../components/ui/BackButton'
import { useMobileDetection } from '../hooks/useMobileDetection'


export default function TeamsBuildingPage() {
    const [cameraPos, setCameraPos] = useState({ x: '62.78', y: '54.16', z: '36.34' })
    const [distance, setDistance] = useState('10.00')
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
                    // Mobile: Farther back for better view
                    position: isMobile ? [80, 40, 50] : [67.63, 33.55, 42.28],
                    fov: isMobile ? 60 : 50,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: !isMobile,
                    toneMapping: 0,
                    toneMappingExposure: 1,
                    outputColorSpace: THREE.SRGBColorSpace,
                    alpha: false,
                    powerPreference: isMobile ? 'low-power' : 'high-performance'
                }}
            >
                <SolidPurpleBackground />
                <fog attach="fog" args={['#0a0a1a', isMobile ? 60 : 50, isMobile ? 140 : 120]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <TeamsBuildingLighting isMobile={isMobile} />

                <TeamsBuilding />

                <OrbitControls
                    target={[0, 17, -31]}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={isMobile ? 100 : 94}
                    maxDistance={isMobile ? 110 : 96}
                    maxPolarAngle={Math.PI / 2.3}
                    minPolarAngle={Math.PI / 3.5}
                    panSpeed={isMobile ? 0.3 : 0.2}
                    rotateSpeed={isMobile ? 0.35 : 0.25}
                    zoomSpeed={isMobile ? 0.4 : 0.3}
                    enableDamping={true}
                    dampingFactor={0.1}
                />

                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 1.5 : 2}
                        luminanceThreshold={0.9}
                        luminanceSmoothing={0.7}
                        radius={isMobile ? 0.6 : 0.8}
                    />
                </EffectComposer>
            </Canvas>

            <div className="ui-overlay">
                <h1>TEAMS</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Meet Our Amazing Teams</p>

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
