import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import MainCampus from './MainCampus'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import MainCampusLighting from '../components/scene/MainCampusLighting'
import UIOverlay from '../components/ui/UIOverlay'
import HODModal, { FACULTY_DATA } from '../components/ui/HODModal'
import SEO from '../components/seo/SEO';
import { useMobileDetection } from '../hooks/useMobileDetection'

const hiddenStyle = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
};

export default function MainCampusPage() {
    const [currentScene, setCurrentScene] = useState('main-campus')

    const [cameraPos, setCameraPos] = useState({ x: '16.02', y: '9.71', z: '18.25' })
    const [distance, setDistance] = useState('27.74')
    const [showHODModal, setShowHODModal] = useState(false)
    const [modalOpenTime, setModalOpenTime] = useState(0)
    const isMobile = useMobileDetection()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBuildingClick = useCallback((building) => {
        setCurrentScene(building)
    }, [])

    const handleHODClick = useCallback(() => {
        setModalOpenTime(Date.now());
        setShowHODModal(true)
    }, [])

    const handleBackClick = useCallback(() => {
        setCurrentScene('main-campus')
    }, [])

    const handleModalClose = useCallback(() => {
        setShowHODModal(false)
    }, [])

    return (
        <main style={{ width: '100vw', height: '100vh' }}>
            <SEO
                title="Main Campus - KIT Kolhapur"
                description="Explore the 3D main campus of KIT's College of Engineering (Autonomous), Kolhapur, created by the Association of Computer Science and Engineering Students (ACSES)."
                canonicalUrl="/"
                keywords="3D campus, KITCoEK, ACSES, virtual tour, KIT Kolhapur, CSE department"
            />
            <Canvas
                camera={{
                    position: isMobile ? [28, 18, 34] : [14.71, 8.68, 18.02],
                    fov: isMobile ? 60 : 50,
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
                <fog attach="fog" args={['#0a0514', isMobile ? 50 : 40, isMobile ? 100 : 80]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <MainCampusLighting isMobile={isMobile} />

                <Suspense fallback={null}>
                    <MainCampus
                        onBuildingClick={handleBuildingClick}
                        onHODClick={handleHODClick}
                    />
                </Suspense>

                <OrbitControls
                    target={[1.2, 5.1, 0]}
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={true}
                    enableDamping={true}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 6}
                />

                {/* Post-processing for Enhanced Neon Glow - MOBILE BLOOM ENABLED */}
                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 0.35 : 1}
                        luminanceThreshold={isMobile ? 0.6 : 0.95}
                        luminanceSmoothing={0.5}
                        radius={isMobile ? 0.6 : 0.5}
                    />
                </EffectComposer>
            </Canvas>

            <UIOverlay
                title="ACSES"
                subtitle="Association of Computer Science & Engineering Students"
                additionalSubtitle="Department of Computer Science and Engineering, KITCoEK"
                showBackButton={currentScene !== 'main-campus'}
                onBackClick={handleBackClick}
            />

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}

            {showHODModal && (
                <HODModal onClose={handleModalClose} openTime={modalOpenTime} />
            )}

            {/* SEO Shadow Content */}
            <div style={hiddenStyle}>
                {FACULTY_DATA.map(person => (
                    <article key={person.name}>
                        <h2>{person.role} - {person.name}</h2>
                    </article>
                ))}
            </div>
        </main>
    )
}
