import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
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
import SEO from '../components/seo/SEO';


export default function ContactUsPage() {
    const [cameraPos, setCameraPos] = useState({ x: '0.00', y: '5.00', z: '15.00' })
    const [distance, setDistance] = useState('10.00')
    const [showContactModal, setShowContactModal] = useState(false)
    const isMobile = useMobileDetection()
    const navigate = useNavigate()

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos)
        setDistance(dist)
    }, [])

    const handleBackClick = useCallback(() => {
        navigate('/')
    }, [navigate])

    const handleContactClick = useCallback(() => {
        setShowContactModal(true)
    }, [])

    const handleModalClose = useCallback(() => {
        setShowContactModal(false)
    }, [])

    return (
        <main style={{ width: '100vw', height: '100vh' }}>
            <SEO
                title="Contact ACSES KITCoEK"
                description="Get in touch with the Association of Computer Science and Engineering Students (ACSES) at K. I. T. College of Engineering, Kolhapur."
                canonicalUrl="/contact"
                keywords="contact ACSES, get in touch, student association, KITCoEK"
            />
            <Canvas
                camera={{
                    // Adjust based on your ContactUs model size and position
                    position: isMobile ? [-6.69, 1.50, 0.27] : [-4.22, 1.05, 0.30],
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

                <Suspense fallback={null}>
                    <ContactUs onContactClick={handleContactClick} />
                </Suspense>

                <OrbitControls
                    target={[0, 1.2, 0.26]}
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={true}
                    enableDamping={true}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 6}
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
            {/* SEO Shadow Content */}
            <div style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0
            }}>
                <h2>Contact ACSES KITCoEK</h2>
                <p>Address: K. I. T. College of Engineering (Autonomous), Kolhapur. Gokul Shirgaon, Kolhapur - 416234, Maharashtra, India.</p>
                <p>Department: Computer Science and Engineering</p>
                <p>Association: Association of Computer Science and Engineering Students (ACSES)</p>
                <p>Get in touch with us for collaborations, technical events, workshops, and seminars.</p>
            </div>
        </main>
    )
}
