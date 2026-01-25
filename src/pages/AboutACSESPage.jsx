import React, { useState, useCallback, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import AboutACSES from './AboutACSES'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import AboutLighting from '../components/scene/AboutLighting'
import BackButton from '../components/ui/BackButton'
import AboutSidePanel, { contentData } from '../components/ui/AboutSidePanel'
import TeamPhotoModal from '../components/ui/TeamPhotoModal'
import { useMobileDetection } from '../hooks/useMobileDetection'
import SEO from '../components/seo/SEO';
import CameraDebugOverlay from '../components/ui/CameraDebugOverlay'

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

export default function AboutACSESPage() {
    const [cameraPos, setCameraPos] = useState({ x: '0.00', y: '0.00', z: '0.00' })
    const [distance, setDistance] = useState('0.00')
    const [selectedSection, setSelectedSection] = useState(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
    const platformLightRef = useRef()
    const isMobile = useMobileDetection()
    const navigate = useNavigate()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBackClick = useCallback(() => {
        navigate('/')
    }, [navigate])

    const handleSectionSelect = useCallback((section) => {
        if (section === 'about' || section === 'vision') {
            setSelectedSection(section);
            setIsPanelOpen(true);
        } else if (section === 'video') {
            setIsPhotoModalOpen(true);
        }
    }, []);

    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedSection(null), 500); // Wait for transition
    }, []);

    const handleClosePhotoModal = useCallback(() => {
        setIsPhotoModalOpen(false);
    }, []);

    return (
        <main style={{ width: '100vw', height: '100vh' }}>
            <SEO
                title="About ACSES KITCoEK"
                description="Learn about the vision and mission of the Association of Computer Science and Engineering Students (ACSES) at K. I. T. College of Engineering, Kolhapur."
                canonicalUrl="/about"
                keywords="about ACSES, vision, mission, student association, KITCoEK"
            />
            <Canvas
                camera={{
                    position: isMobile ? [48.21, 18.39, 59.71] : [31.72, 14.12, 33.19],
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
                <fog attach="fog" args={['#0a0a1a', isMobile ? 125 : 100, isMobile ? 250 : 100]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <AboutLighting isMobile={isMobile} platformLightRef={platformLightRef} />

                <Suspense fallback={null}>
                    <AboutACSES onSectionSelect={handleSectionSelect} />
                </Suspense>

                <OrbitControls
                    target={[-3.8, 7, 0]}
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={false}
                    enableDamping={false}
                />

                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 0.5 : 0.5}
                        luminanceThreshold={isMobile ? 0.5 : 0.7}
                        luminanceSmoothing={0.4}
                        radius={isMobile ? 0.7 : 0.6}
                    />
                </EffectComposer>
            </Canvas>

            <div className="ui-overlay" style={{ marginTop: isMobile ? '80px' : '0' }}>
                <h1>ABOUT ACSES</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Discover Our Vision & Mission</p>

                <BackButton
                    onClick={handleBackClick}
                    isMobile={isMobile}
                    label="← Back to Campus"
                />
            </div>

            <AboutSidePanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                section={selectedSection}
            />

            <TeamPhotoModal
                isOpen={isPhotoModalOpen}
                onClose={handleClosePhotoModal}
            />

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}

            {/* SEO Shadow Content */}
            <div style={hiddenStyle}>
                {Object.values(contentData).map(section => (
                    <article key={section.title}>
                        <h2>{section.title}</h2>
                        <p>{section.text}</p>
                    </article>
                ))}
            </div>
        </main>
    )
}
