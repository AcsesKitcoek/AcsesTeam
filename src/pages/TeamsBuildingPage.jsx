import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import TeamsBuilding from './TeamsBuilding'
import SolidPurpleBackground from '../components/scene/SolidPurpleBackground'
import CameraTracker from '../components/scene/CameraTracker'
import TeamsBuildingLighting from '../components/scene/TeamsBuildingLighting'
import BackButton from '../components/ui/BackButton';
import TeamDebugOverlay from '../components/ui/TeamDebugOverlay';
import Tooltip from '../components/ui/Tooltip'; // Import the new Tooltip
import { useMobileDetection } from '../hooks/useMobileDetection';


export default function TeamsBuildingPage() {
    const [cameraPos, setCameraPos] = useState({ x: '62.78', y: '54.16', z: '36.34' });
    const [distance, setDistance] = useState('10.00');
    const [debugBox, setDebugBox] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
    const isMobile = useMobileDetection();
    const navigate = useNavigate();

    const handleCameraUpdate = useCallback((pos, dist) => {
        setCameraPos(pos);
        setDistance(dist);
    }, []);

    const handleBackClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const handleTeamClick = useCallback((teamName, box) => {
        console.log(`Clicked on ${teamName}`);
        setDebugBox(box);
    }, []);

    const handleZoneHover = useCallback((isHovering, teamName, event) => {
        if (isHovering) {
            setTooltip({
                visible: true,
                text: `View ${teamName} Details`,
                x: event.clientX,
                y: event.clientY,
            });
            document.body.style.cursor = 'pointer';
        } else {
            setTooltip({ visible: false, text: '', x: 0, y: 0 });
            document.body.style.cursor = 'default';
        }
    }, []);

    const handleZoneMove = useCallback((event) => {
        setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{
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

                <Suspense fallback={null}>
                    <TeamsBuilding
                        onTeamClick={handleTeamClick}
                        onZoneHover={handleZoneHover}
                        onZoneMove={handleZoneMove}
                    />
                </Suspense>

                <OrbitControls
                    target={[0, 17, -31]}
                    enablePan={false}
                    enableZoom={false}
                    enableDamping={false}
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

            <Tooltip text={tooltip.text} visible={tooltip.visible} x={tooltip.x} y={tooltip.y} />

            <div className="ui-overlay" style={{ marginTop: isMobile ? '80px' : '0' }}>
                <h1>TEAMS</h1>
                <p className="subtitle" style={{ padding: '10px' }}>Meet Our Amazing Teams</p>

                <BackButton
                    onClick={handleBackClick}
                    isMobile={isMobile}
                    label="← Back to Campus"
                />
            </div>

            {/* <TeamDebugOverlay box={debugBox} /> */}
        </div>
    )
}
