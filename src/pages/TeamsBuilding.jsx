import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import CeilingLights from '../components/scene/CeilingLights';
import { ModelWrapper } from '../components/scene/ModelWrapper';

export default function TeamsBuilding() {
    const groupRef = useRef();
    const [lightPositions, setLightPositions] = useState([]);
    const [animationPhase, setAnimationPhase] = useState('boot');
    const animationStartTime = useRef(0);
    const lightRefs = useRef([]);
    const emissiveMeshes = useRef([]);
    const screenMeshes = useRef([]);
    const activationSchedule = useRef([]);

    // Use modern, suspense-based hooks. These pull from the preloaded cache.
    const [acsesTexture] = useTexture(['/images/ACSES_Image.jpg']);
    const isMobile = useMobileDetection();

    // Setup: Configure materials and emissive lighting
    useEffect(() => {
        const modelScene = groupRef.current;
        if (!modelScene) return;

        let lightsFound = 0;
        let screensFound = 0;
        let baseFound = false;
        let mainStructureFixed = false;
        const positions = [];
        const emissiveList = [];
        const screenList = [];

        modelScene.traverse((child) => {
            if (child.isMesh) {
                // Base shadow properties are handled by ModelWrapper, but we can keep them here for specificity
                child.castShadow = true;
                child.receiveShadow = true;

                const meshNameLower = child.name.toLowerCase();

                // Ceiling lights
                if (child.name.startsWith('Light_')) {
                    lightsFound++;
                    const worldPos = new THREE.Vector3();
                    child.getWorldPosition(worldPos);
                    positions.push({
                        position: worldPos.clone(),
                        name: child.name,
                        lightIndex: lightsFound - 1
                    });
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#eeccff');
                        child.material.emissiveIntensity = 1.2;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.2,
                            currentIntensity: 0,
                            type: 'ceiling-light',
                            lightIndex: lightsFound - 1
                        });
                        child.material.emissiveIntensity = 0;
                    }
                }

                // Screens with ACSES texture
                const screenPatterns = ['screen', 'monitor', 'display', 'panel'];
                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++;
                    if (child.material) {
                        child.material = child.material.clone();
                        const rotatedTexture = acsesTexture.clone();
                        rotatedTexture.center.set(0.5, 0.5);
                        rotatedTexture.rotation = Math.PI / 2;
                        rotatedTexture.repeat.set(-1, 1);
                        rotatedTexture.needsUpdate = true;
                        child.material.map = rotatedTexture;
                        child.material.emissive = new THREE.Color('#00ffff');
                        child.material.emissiveIntensity = 10;
                        child.material.emissiveMap = rotatedTexture.clone();
                        child.material.toneMapped = false;
                        child.material.color = new THREE.Color('#000000');
                        child.material.needsUpdate = true;
                        screenList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 10
                        });
                        child.material.emissiveIntensity = 0;
                    }
                }

                // Middle Cyan Base platform
                if (child.name === 'Middle_Cyan_Base' || meshNameLower.includes('middle_cyan_base')) {
                    baseFound = true;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#00ffff');
                        child.material.emissiveIntensity = 2;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 2,
                            currentIntensity: 0,
                            type: 'base'
                        });
                        child.material.emissiveIntensity = 0;
                    }
                }

                // Other specific material adjustments from original file...
                if (child.name === 'Upper_Black_Base') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ffffff');
                        child.material.emissiveIntensity = 0.003;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                    }
                }
                if (child.material && child.material.name === 'Material.001') {
                    if (!mainStructureFixed) {
                        mainStructureFixed = true;
                        child.material = child.material.clone();
                        child.material.metalness = 0.3;
                        child.material.roughness = 0.4;
                        child.material.color = new THREE.Color('#3a2050');
                        child.material.emissive = new THREE.Color('#1a0a30');
                        child.material.emissiveIntensity = 0.25;
                        child.material.needsUpdate = true;
                    }
                }
                if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex();
                    if (emissiveHex === 0x00ffff) {
                        child.material = child.material.clone();
                        child.material.emissiveIntensity = 1.25;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.25,
                            currentIntensity: 0,
                            type: 'cyan-emissive'
                        });
                        child.material.emissiveIntensity = 0;
                    }
                }
            }
        });

        setLightPositions(positions);
        emissiveMeshes.current = emissiveList;
        screenMeshes.current = screenList;

        const schedule = [];
        const lightIndices = emissiveList
            .map((item, index) => ({ index, type: item.type, lightIndex: item.lightIndex }))
            .filter(item => item.type === 'ceiling-light');
        const shuffled = [...lightIndices].sort(() => Math.random() - 0.5);
        shuffled.forEach((item, i) => {
            schedule.push({
                index: item.index,
                lightIndex: item.lightIndex,
                activationTime: 0.2 + (i * 0.15)
            });
        });
        activationSchedule.current = schedule;
    }, [groupRef.current, acsesTexture, isMobile]);

    // System Initialize Animation (remains the same)
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime;
        }
        const elapsed = state.clock.elapsedTime - animationStartTime.current;

        if (animationPhase === 'boot') {
            if (elapsed > 0.3) setAnimationPhase('random-init');
        } else if (animationPhase === 'random-init') {
            const initPhaseTime = elapsed - 0.3;
            activationSchedule.current.forEach(({ index, lightIndex, activationTime }) => {
                if (initPhaseTime >= activationTime) {
                    const light = emissiveMeshes.current[index];
                    if (light && light.mesh.material) {
                        const timeSinceActivation = initPhaseTime - activationTime;
                        if (timeSinceActivation < 0.1) {
                            const flickerValue = Math.random() > 0.5 ? 1 : 0;
                            light.mesh.material.emissiveIntensity = light.originalIntensity * flickerValue;
                            if (lightRefs.current[lightIndex]) {
                                lightRefs.current[lightIndex].intensity = (isMobile ? 80 : 120) * flickerValue;
                            }
                        } else {
                            light.mesh.material.emissiveIntensity = light.originalIntensity;
                            if (lightRefs.current[lightIndex]) {
                                lightRefs.current[lightIndex].intensity = isMobile ? 80 : 120;
                            }
                        }
                    }
                } else {
                    if (lightRefs.current[lightIndex]) lightRefs.current[lightIndex].intensity = 0;
                }
            });
            if (initPhaseTime > 0.8 && initPhaseTime < 1.5) {
                screenMeshes.current.forEach((screen, index) => {
                    const activationTime = 0.8 + (index * 0.1);
                    if (initPhaseTime >= activationTime) {
                        screen.mesh.material.emissiveIntensity = screen.originalIntensity;
                    } else {
                        screen.mesh.material.emissiveIntensity = 0;
                    }
                });
            }
            if (initPhaseTime > 2.0) setAnimationPhase('sync');
        } else if (animationPhase === 'sync') {
            const syncTime = elapsed - 2.3;
            const pulseDuration = 0.5;
            if (syncTime < pulseDuration) {
                const pulseIntensity = Math.sin((syncTime / pulseDuration) * Math.PI) * 0.3 + 0.7;
                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) mesh.material.emissiveIntensity = originalIntensity * pulseIntensity;
                });
                lightRefs.current.forEach((light) => {
                    if (light) light.intensity = (isMobile ? 80 : 120) * pulseIntensity;
                });
                screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) mesh.material.emissiveIntensity = originalIntensity * pulseIntensity;
                });
            } else {
                setAnimationPhase('complete');
            }
        } else if (animationPhase === 'complete') {
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            lightRefs.current.forEach((light) => {
                if (light) light.intensity = isMobile ? 80 : 120;
            });
            screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            setAnimationPhase('done');
        }
    });

    return (
        <>
            <CeilingLights lightPositions={lightPositions} lightRefs={lightRefs} isMobile={isMobile} />
            <ambientLight intensity={isMobile ? 0.2 : 0.15} color="#5540a0" />
            <pointLight position={[0, 50, 0]} intensity={isMobile ? 12 : 20} color="#ddbbff" distance={isMobile ? 20 : 25} decay={1.5} />
            
            {/* The 3D Model is now loaded via the modern ModelWrapper */}
            <ModelWrapper ref={groupRef} url="/models/towerss.glb" />
        </>
    );
}
