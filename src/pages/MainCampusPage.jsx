import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import MainCampus from './MainCampus'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import MainCampusLighting from '../components/scene/MainCampusLighting'
import UIOverlay from '../components/ui/UIOverlay'
import HODModal from '../components/ui/HODModal'
import { useMobileDetection } from '../hooks/useMobileDetection'


export default function MainCampusPage() {
    const [currentScene, setCurrentScene] = useState('main-campus')
    const [cameraPos, setCameraPos] = useState({ x: '16.02', y: '9.71', z: '18.25' })
    const [distance, setDistance] = useState('27.74')
    const [showHODModal, setShowHODModal] = useState(false)
    const isMobile = useMobileDetection()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBuildingClick = useCallback((building) => {
        setCurrentScene(building)
    }, [])

    const handleHODClick = useCallback(() => {
        setShowHODModal(true)
    }, [])

    const handleBackClick = useCallback(() => {
        setCurrentScene('main-campus')
    }, [])

    const handleModalClose = useCallback(() => {
        setShowHODModal(false)
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{
                    position: [14.71, 8.68, 18.02],
                    fov: 50,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: true,
                    toneMapping: 0,
                    toneMappingExposure: 1,
                    outputColorSpace: THREE.SRGBColorSpace,
                    alpha: false
                }}
            >
                <SolidPurpleBackground />
                <fog attach="fog" args={['#0a0514', 40, 80]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <MainCampusLighting isMobile={isMobile} />

                <MainCampus
                    onBuildingClick={handleBuildingClick}
                    onHODClick={handleHODClick}
                />

                <OrbitControls
                    target={[1.2, 4, 0]}
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={false}
                    enableDamping={false}
                />

                {/* Post-processing for Enhanced Neon Glow - MOBILE BLOOM ENABLED */}
                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 0.35 : 0.3}
                        luminanceThreshold={isMobile ? 0.6 : 0.95}
                        luminanceSmoothing={0.5}
                        radius={isMobile ? 0.6 : 0.5}
                    />
                </EffectComposer>
            </Canvas>

            <UIOverlay
                title="ACSES"
                subtitle="Association of Computer Science & Engineering Students"
                showBackButton={currentScene !== 'main-campus'}
                onBackClick={handleBackClick}
            />

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}

            {showHODModal && (
                <HODModal onClose={handleModalClose} />
            )}
        </div>
    )
}
