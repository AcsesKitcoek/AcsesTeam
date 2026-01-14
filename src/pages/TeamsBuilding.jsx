import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import CeilingLights from '../components/scene/CeilingLights';
import { ModelWrapper } from '../components/scene/ModelWrapper';
import ClickableZone from '../components/scene/ClickableZone';

export default function TeamsBuilding({ onTeamClick, onZoneHover, onZoneMove }) {
    const groupRef = useRef();
    const [lightPositions, setLightPositions] = useState([]);
    const [animationPhase, setAnimationPhase] = useState('boot');

    // State for all 8 team zones
    const [teamZones, setTeamZones] = useState({
        Management: null,
        Technical: null,
        Design: null,
        Registration: null,
        Media: null,
        Publicity: null,
        Documentation: null,
        Logistics: null,
    });

    const animationStartTime = useRef(0);
    const lightRefs = useRef([]);
    const emissiveMeshes = useRef([]);
    const screenMeshes = useRef([]);
    const activationSchedule = useRef([]);
    const [acsesTexture] = useTexture(['/images/ACSES_Image.jpg']);

    // Load specific textures for each team
    const teamTextures = useTexture({
        Management: '/images/teams/Management.png',
        Technical: '/images/teams/Technical.png',
        Design: '/images/teams/Design.png',
        Registration: '/images/teams/Registration.png',
        Media: '/images/teams/Media.png',
        Publicity: '/images/teams/Publicity.png',
        Documentation: '/images/teams/Documentation.png',
        Logistics: '/images/teams/Logistics.png',
    });

    const isMobile = useMobileDetection();

    useEffect(() => {
        const modelScene = groupRef.current;
        if (!modelScene) return;

        // Apply base material to SVG meshes
        modelScene.traverse((child) => {
            if (child.isMesh && child.name.endsWith('_svg')) {
                child.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color('#ff00ff'), // Magenta color
                    emissive: new THREE.Color('#aa00ff'), // Emissive part for glow
                    emissiveIntensity: 1.0, // Small intensity to make it visible
                    toneMapped: false,
                });
            }
        });

        // --- Standard scene setup (animations, materials, etc.) ---
        let lightsFound = 0;
        let screensFound = 0;
        let baseFound = false;
        let mainStructureFixed = false;
        const positions = [];
        const emissiveList = [];
        const screenList = [];

        modelScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const meshNameLower = child.name.toLowerCase();

                if (child.name.startsWith('Light_')) {
                    lightsFound++;
                    const worldPos = new THREE.Vector3();
                    child.getWorldPosition(worldPos);
                    positions.push({ position: worldPos.clone(), name: child.name, lightIndex: lightsFound - 1 });
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#eeccff');
                        child.material.emissiveIntensity = 1.2;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({ mesh: child, name: child.name, originalIntensity: 1.2, currentIntensity: 0, type: 'ceiling-light', lightIndex: lightsFound - 1 });
                        child.material.emissiveIntensity = 0;
                    }
                }

                const screenPatterns = ['screen', 'monitor', 'display', 'panel'];
                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++;
                    if (child.material) {
                        child.material = child.material.clone();

                        // Determine which texture to use based on the mesh name
                        let textureToUse = acsesTexture;
                        const teams = ['Management', 'Technical', 'Design', 'Registration', 'Media', 'Publicity', 'Documentation', 'Logistics', 'Logistic']; // Added 'Logistic' for typo safety

                        // If the mesh name contains any team name, use the corresponding texture
                        // for (const team of teams) {
                        //     if (child.name.includes(team)) {
                        //         // Handle the 'Logistic' vs 'Logistics' naming potential mismatch
                        //         const key = team === 'Logistic' ? 'Logistics' : team;
                        //         if (teamTextures[key]) {
                        //             textureToUse = teamTextures[key];
                        //         }
                        //         break;
                        //     }
                        // }

                        const rotatedTexture = textureToUse.clone();
                        rotatedTexture.center.set(0.5, 0.5);
                        rotatedTexture.rotation = Math.PI / 2;
                        rotatedTexture.repeat.set(-1, 1);
                        rotatedTexture.needsUpdate = true;

                        child.material.map = rotatedTexture;
                        child.material.emissive = new THREE.Color('#ffffff');
                        child.material.emissiveIntensity = 1;
                        child.material.emissiveMap = rotatedTexture.clone();
                        child.material.toneMapped = false;
                        child.material.color = new THREE.Color('#000000');
                        child.material.needsUpdate = true;
                        screenList.push({ mesh: child, name: child.name, originalIntensity: 1 });
                        child.material.emissiveIntensity = 0;
                    }
                }

                if (child.name === 'Middle_Cyan_Base' || meshNameLower.includes('middle_cyan_base')) {
                    baseFound = true;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#00ffff');
                        child.material.emissiveIntensity = 2;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({ mesh: child, name: child.name, originalIntensity: 2, currentIntensity: 0, type: 'base' });
                        child.material.emissiveIntensity = 0;
                    }
                }

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
                        child.material.emissiveIntensity = 1.25;
                        child.material.toneMapped = false;
                        child.material.needsUpdate = true;
                        emissiveList.push({ mesh: child, name: child.name, originalIntensity: 1.25, currentIntensity: 0, type: 'cyan-emissive' });
                        child.material.emissiveIntensity = 0;
                    }
                }
            }
        });

        setLightPositions(positions);
        emissiveMeshes.current = emissiveList;
        screenMeshes.current = screenList;

        const schedule = [];
        const lightIndices = emissiveList.map((item, index) => ({ index, type: item.type, lightIndex: item.lightIndex })).filter(item => item.type === 'ceiling-light');
        const shuffled = [...lightIndices].sort(() => Math.random() - 0.5);
        shuffled.forEach((item, i) => {
            schedule.push({ index: item.index, lightIndex: item.lightIndex, activationTime: 0.2 + (i * 0.15) });
        });
        activationSchedule.current = schedule;

        // --- Calculate Clickable Zones for All Teams ---
        const teamMeshGroups = {
            Management: ['Chair_Management', 'Table_Management', 'Computer_Management', 'Screen_Management', 'NamePlane_Management'],
            Technical: ['Chair_Technical', 'Table_Technical', 'Human_Technical', 'Computer_Technical', 'Computer_Technical_1', 'Computer_Technical_2', 'Screen_Technical', 'NamePlane_Technical'],
            Design: ['Chair_Design', 'Table_Design', 'Computer_Design', 'Screen_Design', 'NamePlane_Design'],
            Registration: ['Chair_Registration', 'Table_Registration', 'Human_Registration', 'Computer_Registration', 'Screen_Registration', 'NamePlane_Registration'],
            Media: ['Chair_Media', 'Table_Media', 'Computer_Media', 'Screen_Media', 'NamePlane_Media'],
            Publicity: ['Chair_Publicity', 'Table_Publicity', 'Computer_Publicity', 'Screen_Publicity', 'NamePlane_Publicity'],
            Documentation: ['Chair_Documentation', 'Table_Documentation', 'Human_Documentaion', 'Computer_Documentation', 'Screen_Documentation', 'NamePlane_Documentation'],
            Logistics: ['Chair_Logistic', 'Table_Logistic', 'Computer_Logistic', 'Screen_Logistic', 'NamePlane_Logistics'],
        };

        // Set hardcoded positions based on user's manual adjustment and logs
        setTeamZones({
            Management: new THREE.Vector3(18, 39, 0.22), // User's value
            Technical: new THREE.Vector3(30.68, 39, -11.7),
            Design: new THREE.Vector3(18, 28.2, 0.22),
            Registration: new THREE.Vector3(30.68, 28.3, -11.7),
            Media: new THREE.Vector3(18, 17.5, 0.22),
            Publicity: new THREE.Vector3(30.68, 17.5, -11.7),
            Documentation: new THREE.Vector3(18, 6.63, 0.22),
            Logistics: new THREE.Vector3(30.68, 6.63, -11.7),
        });

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

    const teamZoneConfig = {
        size: [12, 10, 12],
        colors: {
            Management: 'red',
            Technical: 'blue',
            Design: 'green',
            Registration: 'yellow',
            Media: 'purple',
            Publicity: 'orange',
            Documentation: 'cyan',
            Logistics: 'white',
        }
    };

    return (
        <>
            <CeilingLights lightPositions={lightPositions} lightRefs={lightRefs} isMobile={isMobile} />
            <ambientLight intensity={isMobile ? 0.2 : 0.15} color="#5540a0" />
            <pointLight position={[0, 50, 0]} intensity={isMobile ? 12 : 20} color="#ddbbff" distance={isMobile ? 20 : 25} decay={1.5} />

            <ModelWrapper ref={groupRef} url="/models/towerss.glb" />

            {Object.entries(teamZones).map(([team, zone]) => zone && (
                <ClickableZone
                    key={team}
                    position={zone.toArray()}
                    size={teamZoneConfig.size}
                    onClick={(e) => { onTeamClick(team, { position: zone, size: teamZoneConfig.size }); e.stopPropagation() }}
                    onPointerEnter={(e) => { onZoneHover(true, team, e); e.stopPropagation() }}
                    onPointerLeave={(e) => { onZoneHover(false, team, e); e.stopPropagation() }}
                    onPointerMove={(e) => onZoneMove(e)}
                    debug
                    color={teamZoneConfig.colors[team]}
                />
            ))}
        </>
    );
}
