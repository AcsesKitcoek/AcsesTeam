import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { ModelWrapper } from '../components/scene/ModelWrapper';

export default function AboutACSES() {
    const groupRef = useRef();
    const { camera, raycaster, gl } = useThree();
    const isMobile = useMobileDetection();

    // Changed from tracking single screen to tracking a group name
    const [hoveredGroup, setHoveredGroup] = useState(null);

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
                else if (child.name === 'Case_About' || child.name === 'Case_Video' || child.name === 'Case_Vision') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ff00ff');
                        child.material.emissiveIntensity = 2.0;
                        child.material.toneMapped = false;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 4.0, originalEmissive: new THREE.Color('#ff00ff'), originalToneMapped: false });
                    }
                }
                else if (child.name === 'Plane_About' || child.name === 'Plane_Video' || child.name === 'Plane_Vision') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#000000');
                        child.userData.clickable = true;
                        child.userData.screenName = child.name;

                        // Assign Groups
                        if (child.name === 'Plane_About') child.userData.groupName = 'about';
                        else if (child.name === 'Plane_Vision') child.userData.groupName = 'vision';
                        else if (child.name === 'Plane_Video') child.userData.groupName = 'video';

                        child.userData.originalEmissive = new THREE.Color('#000000');
                        child.userData.originalIntensity = 0;
                        screenPlaneMeshes.current.push({ mesh: child, name: child.name, originalIntensity: 0, originalEmissive: new THREE.Color('#000000') });
                    }
                }
                else if (child.name === 'About_svg' || child.name === 'Vision_svg') {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color = new THREE.Color('#00ffff');
                        child.material.emissive = new THREE.Color('#00e5ff');
                        child.material.emissiveIntensity = 2.0;
                        child.material.toneMapped = false;

                        // Add to emissive meshes for startup animation
                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.0,
                            originalEmissive: new THREE.Color('#00e5ff'),
                            originalToneMapped: false
                        });

                        // Make interactive for hover glow
                        child.userData.clickable = true;
                        child.userData.screenName = child.name;

                        // Assign Groups
                        if (child.name === 'About_svg') child.userData.groupName = 'about';
                        else if (child.name === 'Vision_svg') child.userData.groupName = 'vision';

                        child.userData.originalEmissive = new THREE.Color('#00e5ff');
                        child.userData.originalIntensity = 1.0;

                        // Add to screenPlaneMeshes so the hover logic picks it up
                        screenPlaneMeshes.current.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.0,
                            originalEmissive: new THREE.Color('#00e5ff')
                        });
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
        } else {
            console.log('AboutACSES: Model setup complete. Clickable objects:', screenPlaneMeshes.current.length);
        }
    }, [groupRef.current, isMobile]);

    // Animation and interaction logic
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
            console.log('AboutACSES: Animation phase DONE');
            setAnimationPhase('done');
        }

        if (animationPhase === 'done') {
            const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.5;

            screenPlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    // Check if mesh belongs to the currently hovered group
                    const isHoveredGroup = hoveredGroup && mesh.userData.groupName === hoveredGroup;

                    if (isHoveredGroup && !isMobile) {
                        // Apply pulse animation to all meshes in the hovered group
                        // Use originalIntensity as base, but ensure a minimum visibility for the pulse
                        const baseIntensity = originalIntensity > 0 ? originalIntensity : 1.0;
                        // Use a higher multiplier for SVGs (originalIntensity 2.0) vs Planes (0)
                        // This formula ensures both light up significantly
                        mesh.material.emissiveIntensity = baseIntensity * (pulseIntensity + 0.8);
                    } else {
                        mesh.material.emissiveIntensity = originalIntensity;
                    }
                }
            });
        }
    });

    const handlePointerMove = useCallback((event) => {
        if (animationPhase !== 'done') return;
        if (isMobile || !groupRef.current) return;

        const rect = gl.domElement.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse.current, camera);

        // Use true for recursive search
        const intersects = raycaster.intersectObject(groupRef.current, true);

        let foundClickable = false;
        if (intersects.length > 0) {
            // Check the first few intersections, not just the very first one, 
            // in case there's an invisible helper mesh in front
            for (let i = 0; i < Math.min(intersects.length, 3); i++) {
                let clickableObject = intersects[i].object;

                // Traverse up to find clickable parent if the specific mesh isn't clickable
                while (clickableObject && !clickableObject.userData.clickable && clickableObject.parent) {
                    clickableObject = clickableObject.parent;
                }

                if (clickableObject && clickableObject.userData.clickable) {
                    if (hoveredGroup !== clickableObject.userData.groupName) {
                        console.log('Hovered Group:', clickableObject.userData.groupName);
                        setHoveredGroup(clickableObject.userData.groupName);
                        gl.domElement.style.cursor = 'pointer';
                    }
                    foundClickable = true;
                    break; // Stop after finding the first clickable object
                }
            }
        }

        if (!foundClickable && hoveredGroup !== null) {
            console.log('Hover cleared');
            setHoveredGroup(null);
            gl.domElement.style.cursor = 'default';
        }
    }, [animationPhase, isMobile, gl, raycaster, camera, hoveredGroup]);

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