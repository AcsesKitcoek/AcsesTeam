import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import ContactUs from './ContactUs'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import BackButton from '../components/ui/BackButton'
import ContactUsModal from '../components/ui/ContactUsModal'
import { useMobileDetection } from '../hooks/useMobileDetection'
import CameraDebugOverlay from '../components/ui/CameraDebugOverlay'


export default function ContactUsPage() {
    const [cameraPos, setCameraPos] = useState({ x: '0.00', y: '5.00', z: '15.00' })
    const [distance, setDistance] = useState('10.00')
    const [showContactModal, setShowContactModal] = useState(false)
    const isMobile = useMobileDetection()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBackClick = useCallback(() => {
        window.location.href = '/'
    }, [])

    const handleContactClick = useCallback(() => {
        setShowContactModal(true)
    }, [])

    const handleModalClose = useCallback(() => {
        setShowContactModal(false)
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{
                    // Adjust based on your ContactUs model size and position
                    position: isMobile ? [-4.22, 1.05, 0.30] : [-4.22, 1.05, 0.30],
                    fov: isMobile ? 60 : 50,
                    near: 0.1,
                    far: 20
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
                <fog attach="fog" args={['#0a0a1a', isMobile ? 30 : 25, isMobile ? 60 : 50]} />
                <CameraTracker onUpdate={handleCameraUpdate} />

                <ContactUs onContactClick={handleContactClick} />

                <OrbitControls
                    target={[0, 1.2, 0.26]}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={isMobile ? 7 : 2}
                    maxDistance={isMobile ? 7.2 : 20}
                    maxPolarAngle={isMobile ? Math.PI / 2 : Math.PI}
                    minPolarAngle={isMobile ? Math.PI / 6 : 0}
                    enableDamping={true}
                    dampingFactor={0.1}
                    panSpeed={isMobile ? 0.4 : 0.3}
                    rotateSpeed={isMobile ? 0.4 : 0.3}
                    zoomSpeed={isMobile ? 0.5 : 0.4}
                />

                <EffectComposer>
                    <Bloom
                        intensity={isMobile ? 1.2 : 1.5}
                        luminanceThreshold={0.9}
                        luminanceSmoothing={0.7}
                        radius={isMobile ? 0.5 : 0.7}
                    />
                </EffectComposer>
            </Canvas>

            <div className="ui-overlay" style={{ marginTop: isMobile ? '80px' : '0' }}>
                <h1>CONTACT US</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Get In Touch With ACSES</p>

                <BackButton
                    onClick={handleBackClick}
                    isMobile={isMobile}
                    label="← Back to Campus"
                />
            </div>

            {/* Camera Debug Panel - Hidden for production */}
            {/* <CameraDebugOverlay cameraPosition={cameraPos} distance={distance} /> */}

            {/* Contact Us Modal */}
            {showContactModal && (
                <ContactUsModal onClose={handleModalClose} />
            )}
        </div>
    )
}
