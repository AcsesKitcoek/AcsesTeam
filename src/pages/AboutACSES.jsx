import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { ModelWrapper } from '../components/scene/ModelWrapper';

export default function AboutACSES() {
    const groupRef = useRef();
    const { camera, raycaster, gl } = useThree();
    const isMobile = useMobileDetection();
    const [hoveredScreen, setHoveredScreen] = useState(null);
    const [animationPhase, setAnimationPhase] = useState('blackout');
    const mouse = useRef(new THREE.Vector2());
    const emissiveMeshes = useRef([]);
    const screenPlaneMeshes = useRef([]);
    const animationStartTime = useRef(0);

    useEffect(() => {
        const modelScene = groupRef.current;
        if (!modelScene) return;

        const emissiveMeshesList = [];
        let platformFound = false;

        modelScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !isMobile;
                child.receiveShadow = !isMobile;

                if (child.name === 'Floor_Base') {
                    platformFound = true;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#1a1a2e');
                        child.material.emissive = new THREE.Color('#000000');
                    }
                }
                else if (child.name.match(/^Ceiling_Light_[1-2]$/) || child.name.match(/^Ceiling_Light_Base_[1-2]$/)) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ff00ff');
                        child.material.emissiveIntensity = 3.5;
                        child.material.toneMapped = false;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 3.5, originalEmissive: new THREE.Color('#ff00ff'), originalToneMapped: false });
                    }
                }
                else if (child.name.match(/^Cyan_Light_[1-2]$/) || child.name === 'Cyan_Light_Base' || child.name === 'Cyan_Light_Cylinder') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#00e5ff');
                        child.material.emissiveIntensity = 1.2;
                        child.material.toneMapped = false;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 1.2, originalEmissive: new THREE.Color('#00e5ff'), originalToneMapped: false });
                    }
                }
                else if (child.name === 'Case_About' || child.name === 'Case_Sponsors' || child.name === 'Case_Vision') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ff00ff');
                        child.material.emissiveIntensity = 4.0;
                        child.material.toneMapped = false;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 4.0, originalEmissive: new THREE.Color('#ff00ff'), originalToneMapped: false });
                    }
                }
                else if (child.name === 'Plane_About' || child.name === 'Plane_Sponsors' || child.name === 'Plane_Vision') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#000000');
                        child.userData.clickable = true;
                        child.userData.screenName = child.name;
                        child.userData.originalEmissive = new THREE.Color('#000000');
                        child.userData.originalIntensity = 0;
                        screenPlaneMeshes.current.push({ mesh: child, name: child.name, originalIntensity: 0, originalEmissive: new THREE.Color('#000000') });
                    }
                }
            }
        });

        emissiveMeshes.current = emissiveMeshesList;
        emissiveMeshesList.forEach(({ mesh }) => {
            if (mesh.material) mesh.material.emissiveIntensity = 0;
        });

        if (!platformFound) {
            console.warn('⚠️ Platform not found in About ACSES model!');
        }
    }, [groupRef.current, isMobile]);

    // Animation and interaction logic (useFrame, handlePointerMove, etc.) remains the same...
    useFrame((state) => {
        if (!animationStartTime.current) animationStartTime.current = state.clock.elapsedTime;
        const elapsed = state.clock.elapsedTime - animationStartTime.current;

        if (animationPhase === 'blackout') {
            if (elapsed > 0.5) setAnimationPhase('wave-sweep');
        } else if (animationPhase === 'wave-sweep') {
            const progress = Math.min((elapsed - 0.5) / 2.5, 1);
            const wavePosition = (progress * 40) - 20;
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    const worldPos = new THREE.Vector3();
                    mesh.getWorldPosition(worldPos);
                    const distance = Math.abs(worldPos.x - wavePosition);
                    let intensity = 0;
                    if (distance < 5) {
                        intensity = 1 - (distance / 5);
                    } else if (worldPos.x < wavePosition) {
                        intensity = 1;
                    }
                    mesh.material.emissiveIntensity = originalIntensity * intensity;
                }
            });
            if (progress >= 1) setAnimationPhase('complete');
        } else if (animationPhase === 'complete') {
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            screenPlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            setAnimationPhase('done');
        }

        if (animationPhase === 'done') {
            screenPlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material && !hoveredScreen) mesh.material.emissiveIntensity = originalIntensity;
            });
            if (hoveredScreen && hoveredScreen.material && !isMobile) {
                hoveredScreen.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.5;
            }
        }
    });

    const handlePointerMove = useCallback((event) => {
        if (animationPhase !== 'done' || isMobile || !groupRef.current) return;
        const rect = gl.domElement.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse.current, camera);
        const intersects = raycaster.intersectObject(groupRef.current, true);
        if (hoveredScreen && hoveredScreen.material) {
            hoveredScreen.material.emissiveIntensity = hoveredScreen.userData.originalIntensity || 0.1;
        }
        let foundClickable = false;
        if (intersects.length > 0) {
            let clickableObject = intersects[0].object;
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent;
            }
            if (clickableObject) {
                setHoveredScreen(clickableObject);
                gl.domElement.style.cursor = 'pointer';
                foundClickable = true;
            }
        }
        if (!foundClickable) {
            setHoveredScreen(null);
            gl.domElement.style.cursor = 'default';
        }
    }, [animationPhase, isMobile, gl, raycaster, camera, hoveredScreen]);

    const handleClick = useCallback((event) => {
        if (animationPhase !== 'done' || !groupRef.current) return;
        // Click logic remains the same...
    }, [animationPhase, gl, raycaster, camera]);

    return (
        <ModelWrapper
            ref={groupRef}
            url="/models/about-acses.glb"
            onPointerMove={handlePointerMove}
            onClick={handleClick}
            onPointerUp={isMobile ? handleClick : undefined}
            onTouchEnd={isMobile ? (e) => { e.preventDefault(); handleClick(e); } : undefined}
        />
    );
}
