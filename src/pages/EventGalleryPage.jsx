import React, { useState, useCallback, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
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
import EventSidePanel from '../components/ui/EventSidePanel'
import { eventsData } from '../assets/eventInfo'
import SEO from '../components/seo/SEO';


export default function EventGalleryPage() {
    const [cameraPos, setCameraPos] = useState({ x: '0.00', y: '0.00', z: '0.00' })
    const [distance, setDistance] = useState('0.00')
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
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

    const handleFrameSelect = useCallback((frameName) => {
        console.log('EventGalleryPage: Frame selected ->', frameName)
        const event = eventsData[frameName]
        if (event) {
            setSelectedEvent(event)
            setIsPanelOpen(true)
        } else {
            console.warn(`No event data found for frame: ${frameName}`)
        }
    }, [])

    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false)
        // delayed clear of selection to allow close animation to finish
        setTimeout(() => setSelectedEvent(null), 500)
    }, [])

    return (
        <main style={{ width: '100vw', height: '100vh' }}>
            <SEO
                title="Event Gallery - ACSES KITCoEK"
                description="Explore past events and memorable moments from the Association of Computer Science and Engineering Students (ACSES) at K. I. T. College of Engineering, Kolhapur."
                canonicalUrl="/gallery"
                keywords="event gallery, ACSES events, past events, KITCoEK events"
            />
            <Canvas
                camera={{
                    position: isMobile ? [34.69, 48.77, 41.51] : [23.45, 36.43, 28.35],
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
                <fog attach="fog" args={['#0a0a1a', isMobile ? 150 : 100, isMobile ? 250 : 100]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                {/* Lighting */}
                <GalleryLighting isMobile={isMobile} platformLightRef={platformLightRef} />

                <Suspense fallback={null}>
                    <EventGallery onFrameSelect={handleFrameSelect} />
                </Suspense>

                <OrbitControls
                    target={[-5, 12, 0]}
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={false}
                    enableDamping={false}
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

            <div className="ui-overlay" style={{ marginTop: isMobile ? '80px' : '0' }}>
                <h1>EVENT GALLERY</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Explore Our Memorable Moments</p>

                <BackButton
                    onClick={handleBackClick}
                    isMobile={isMobile}
                    label="← Back to Campus"
                />
            </div>

            <EventSidePanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                eventData={selectedEvent}
            />

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}
        </main>
    )
}
