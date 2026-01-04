import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import ContactUsIndicator from '../components/scene/ContactUsIndicator';
import { ModelWrapper } from '../components/scene/ModelWrapper';

export default function ContactUs({ onContactClick }) {
    const groupRef = useRef();
    const topLightRef = useRef();
    const emissiveMeshes = useRef([]);
    const screenMeshes = useRef([]);
    const animationStartTime = useRef(0);
    const [animationPhase, setAnimationPhase] = useState('blackout');
    const [laptopPositions, setLaptopPositions] = useState([]);
    const isMobile = useMobileDetection();

    // Setup: Configure materials and emissive lighting
    useEffect(() => {
        const modelScene = groupRef.current;
        if (!modelScene) return;

        let topLightFound = false;
        let screensFound = 0;
        const emissiveList = [];
        const screenList = [];
        const laptopPosList = [];

        modelScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !isMobile;
                child.receiveShadow = !isMobile;

                const meshNameLower = child.name.toLowerCase();

                if (child.name === 'Laptop1' || child.name === 'Laptop2' || meshNameLower.includes('laptop')) {
                    const worldPos = new THREE.Vector3();
                    child.getWorldPosition(worldPos);
                    laptopPosList.push({ name: child.name, position: worldPos.clone() });
                }

                if (child.name === 'Light_Top' || meshNameLower.includes('light_top')) {
                    topLightFound = true;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ffffff');
                        child.material.emissiveIntensity = 2.5;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({ mesh: child, name: child.name, originalIntensity: 2.5, type: 'ceiling-light' });
                        child.material.emissiveIntensity = 0;
                    }
                }

                const screenPatterns = ['screen', 'monitor', 'display', 'pc'];
                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#00e5ff');
                        child.material.emissiveIntensity = 1.8;
                        child.material.toneMapped = false;
                        child.material.color = new THREE.Color('#001a1f');
                        child.material.needsUpdate = true;
                        screenList.push({ mesh: child, name: child.name, originalIntensity: 1.8 });
                        child.material.emissiveIntensity = 0;
                    }
                }

                if (meshNameLower.includes('table')) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.metalness = 0.4;
                        child.material.roughness = 0.6;
                        child.material.color = new THREE.Color('#3a3545');
                        child.material.needsUpdate = true;
                    }
                }

                if (meshNameLower.includes('chair')) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.metalness = 0.3;
                        child.material.roughness = 0.7;
                        child.material.color = new THREE.Color('#2a2535');
                        child.material.needsUpdate = true;
                    }
                }
                
                if (meshNameLower.includes('wall')) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#2a2040');
                        child.material.emissive = new THREE.Color('#1a1030');
                        child.material.emissiveIntensity = 0.2;
                        child.material.needsUpdate = true;
                    }
                }

                if (meshNameLower.includes('floor') || meshNameLower.includes('ground')) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#1a1825');
                        child.material.metalness = 0.2;
                        child.material.roughness = 0.8;
                        child.material.needsUpdate = true;
                    }
                }

                if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex();
                    if (emissiveHex === 0x00ffff || emissiveHex === 0x00e5ff) {
                        child.material = child.material.clone();
                        child.material.emissiveIntensity = 1.5;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({ mesh: child, name: child.name, originalIntensity: 1.5, type: 'cyan-emissive' });
                        child.material.emissiveIntensity = 0;
                    }
                }
            }
        });

        emissiveMeshes.current = emissiveList;
        screenMeshes.current = screenList;
        setLaptopPositions(laptopPosList);

        if (!topLightFound) {
            console.warn('⚠️ Light_Top not found in ContactUs model!');
        }
    }, [groupRef.current, isMobile]);

    // Animation logic (remains the same)
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime;
        }
        const elapsed = state.clock.elapsedTime - animationStartTime.current;

        if (animationPhase === 'blackout') {
            if (elapsed > 0.3) setAnimationPhase('flickering');
        } else if (animationPhase === 'flickering') {
            const phase1Time = elapsed - 0.3;
            if (phase1Time >= 0 && phase1Time < 0.9) {
                const progress = phase1Time / 0.9;
                const warmUpCurve = Math.pow(progress, 0.7);
                emissiveMeshes.current.forEach(({ mesh, originalIntensity, type }) => {
                    if (type === 'ceiling-light' && mesh.material) mesh.material.emissiveIntensity = originalIntensity * warmUpCurve;
                });
                if (topLightRef.current) topLightRef.current.intensity = (isMobile ? 40 : 50) * warmUpCurve;
            }

            const phase2Time = elapsed - 1.2;
            if (phase2Time >= 0) {
                screenMeshes.current.forEach(({ mesh, originalIntensity }, index) => {
                    if (mesh.material) {
                        const screenDelay = index * 0.15;
                        const screenBootTime = phase2Time - screenDelay;
                        if (screenBootTime >= 0 && screenBootTime < 0.4) {
                            const bootProgress = screenBootTime / 0.4;
                            const flicker = Math.random() > 0.7 ? 0.9 : 1.0;
                            mesh.material.emissiveIntensity = originalIntensity * bootProgress * flicker;
                        } else if (screenBootTime >= 0.4) {
                            mesh.material.emissiveIntensity = originalIntensity;
                        }
                    }
                });
            }

            const phase3Time = elapsed - 1.0;
            if (phase3Time >= 0 && phase3Time < 1.0) {
                const fadeProgress = phase3Time / 1.0;
                emissiveMeshes.current.forEach(({ mesh, originalIntensity, type }) => {
                    if (type === 'cyan-emissive' && mesh.material) mesh.material.emissiveIntensity = originalIntensity * fadeProgress;
                });
            }

            if (elapsed > 2.5) setAnimationPhase('stabilizing');
        } else if (animationPhase === 'stabilizing') {
            const stabilizeTime = elapsed - 2.5;
            if (stabilizeTime < 0.3) {
                const finalProgress = Math.min(1, stabilizeTime / 0.3);
                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) mesh.material.emissiveIntensity = originalIntensity * finalProgress;
                });
                if (topLightRef.current) topLightRef.current.intensity = (isMobile ? 40 : 50) * finalProgress;
                screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) mesh.material.emissiveIntensity = originalIntensity * finalProgress;
                });
            } else {
                setAnimationPhase('complete');
            }
        } else if (animationPhase === 'complete') {
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            if (topLightRef.current) topLightRef.current.intensity = isMobile ? 40 : 50;
            screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            setAnimationPhase('done');
        } else if (animationPhase === 'done') {
            const ambientFlicker = Math.sin(state.clock.elapsedTime * 8) * 0.02 + 0.98;
            if (topLightRef.current) topLightRef.current.intensity = (isMobile ? 40 : 50) * ambientFlicker;
        }
    });

    return (
        <>
            <pointLight ref={topLightRef} position={[0, 8, 0]} intensity={isMobile ? 40 : 50} color="#ffffff" distance={25} decay={1.5} castShadow={!isMobile} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <ambientLight intensity={isMobile ? 0.25 : 0.2} color="#5540a0" />
            <hemisphereLight skyColor="#4060ff" groundColor="#2a1a3e" intensity={isMobile ? 0.3 : 0.25} />
            <pointLight position={[-3, 3, 2]} intensity={isMobile ? 4 : 6} color="#00e5ff" distance={8} decay={2} />
            <pointLight position={[3, 3, 2]} intensity={isMobile ? 4 : 6} color="#00e5ff" distance={8} decay={2} />

            <ModelWrapper ref={groupRef} url="/models/contactUs.glb" />

            {laptopPositions.length > 0 && (() => {
                const centerPos = laptopPositions.reduce((acc, laptop) => {
                    acc.x += laptop.position.x;
                    acc.y += laptop.position.y;
                    acc.z += laptop.position.z;
                    return acc;
                }, { x: 0, y: 0, z: 0 });
                centerPos.x /= laptopPositions.length;
                centerPos.y /= laptopPositions.length;
                centerPos.z /= laptopPositions.length;
                const indicatorPosition = [centerPos.x, centerPos.y + 1.25, centerPos.z + 0.15];
                return <ContactUsIndicator position={indicatorPosition} onClick={onContactClick} scale={6} />;
            })()}
        </>
    );
}
