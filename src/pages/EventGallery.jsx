import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { ModelWrapper } from '../components/scene/ModelWrapper';
import { eventsData } from '../assets/eventInfo';

const textureUrls = {};
Object.keys(eventsData).forEach(key => {
    if (eventsData[key].panelImage) {
        textureUrls[key] = eventsData[key].panelImage;
    }
});

export default function EventGallery({ onFrameSelect }) {
    const groupRef = useRef();
    const { camera, raycaster, gl } = useThree();
    const [acsesTexture] = useTexture(['/images/ACSES_Image.jpg']);
    const eventTextures = useTexture(textureUrls);
    const isMobile = useMobileDetection();
    const [hoveredFrame, setHoveredFrame] = useState(null);
    const [animationPhase, setAnimationPhase] = useState('blackout');
    const mouse = useRef(new THREE.Vector2());
    const emissiveMeshes = useRef([]);
    const imagePlaneMeshes = useRef([]);
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

                if (child.name === 'Platform' || child.name === 'platform' || child.name === 'Base_Platform') {
                    platformFound = true;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#00e5ff');
                        child.material.emissiveIntensity = 2.5;
                        child.material.color = new THREE.Color('#00ffff');
                        child.material.toneMapped = false;
                        child.material.transparent = true;
                        child.material.opacity = 0.9;
                        child.material.needsUpdate = true;
                        emissiveMeshesList.push({ mesh: child, name: 'Platform', originalIntensity: 2.5, originalEmissive: new THREE.Color('#00e5ff'), originalToneMapped: false });
                    }
                }
                else if (child.name.includes('Light') || child.name.includes('Neon') || child.name.includes('Strip')) {
                    if (child.material) {
                        child.material = child.material.clone();
                        const materialColor = child.material.color || child.material.emissive;
                        const isWarm = materialColor && (materialColor.r > materialColor.b);
                        if (isWarm) {
                            child.material.emissive = new THREE.Color('#ff00ff');
                            child.material.emissiveIntensity = 3.5;
                            child.material.color = new THREE.Color('#ff00ff');
                        } else {
                            child.material.emissive = new THREE.Color('#00e5ff');
                            child.material.emissiveIntensity = 2.0;
                            child.material.color = new THREE.Color('#00ffff');
                        }
                        child.material.toneMapped = false;
                        child.material.transparent = true;
                        child.material.opacity = 0.95;
                        child.material.needsUpdate = true;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: isWarm ? 3.5 : 2.0, originalEmissive: child.material.emissive.clone(), originalToneMapped: false });
                    }
                }
                else if (child.name.match(/^Image_Case_([1-8]|event)$/)) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color('#ff00ff');
                        child.material.emissiveIntensity = 1.0;
                        child.material.color = new THREE.Color('#ff00ff');
                        child.material.toneMapped = false;
                        child.material.metalness = 0.1;
                        child.material.roughness = 1;
                        child.material.needsUpdate = true;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 4.0, originalEmissive: new THREE.Color('#ff00ff'), originalToneMapped: false });
                    }
                }
                else if (child.name.match(/^Image_Plane_([1-8]|event)$/)) {
                    if (child.material) {
                        child.material = child.material.clone();
                        
                        const texture = eventTextures[child.name] || acsesTexture;
                        const rotatedTexture = texture.clone();
                        
                        rotatedTexture.center.set(0.5, 0.5);
                        rotatedTexture.rotation = -Math.PI * 2;
                        rotatedTexture.repeat.set(-1, 1);
                        rotatedTexture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space
                        rotatedTexture.needsUpdate = true;
                        
                        child.material.map = rotatedTexture;
                        child.material.emissive = new THREE.Color('#ffffff');
                        child.material.emissiveIntensity = 0;
                        child.material.emissiveMap = rotatedTexture.clone();
                        child.material.toneMapped = false;
                        child.material.color = new THREE.Color('#ffffff');
                        child.material.needsUpdate = true;
                        child.userData.clickable = true;
                        child.userData.frameName = child.name;
                        child.userData.originalEmissive = new THREE.Color('#ffffff');
                        child.userData.originalIntensity = 0.6;
                        imagePlaneMeshes.current.push({ mesh: child, name: child.name, originalIntensity: 0.6, originalEmissive: new THREE.Color('#ffffff') });
                    }
                }
                else if (!child.name.match(/^Image_Plane_[1-8]$/) && (child.name.includes('Frame') || child.name.includes('Photo') || child.name.includes('Picture'))) {
                    child.userData.clickable = true;
                    child.userData.frameName = child.name;
                    child.userData.originalEmissive = child.material?.emissive?.clone();
                    child.userData.originalIntensity = child.material?.emissiveIntensity || 0;
                    if (child.material) {
                        child.material = child.material.clone();
                        if (!child.material.emissive) {
                            child.material.emissive = new THREE.Color('#ffffff');
                        }
                        child.material.emissiveIntensity = 0.1;
                        child.material.needsUpdate = true;
                    }
                }
                else if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex();
                    if (emissiveHex === 0x00e5ff || emissiveHex === 0x00ffff) {
                        child.material.emissiveIntensity = 1.7;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 1.7, originalEmissive: child.material.emissive.clone(), originalToneMapped: false });
                    } else if (emissiveHex === 0xaa00ff || emissiveHex === 0xff00ff) {
                        child.material.emissiveIntensity = 3.5;
                        emissiveMeshesList.push({ mesh: child, name: child.name, originalIntensity: 3.5, originalEmissive: child.material.emissive.clone(), originalToneMapped: false });
                    }
                }
            }
        });

        emissiveMeshes.current = emissiveMeshesList;
        emissiveMeshesList.forEach(({ mesh }) => {
            if (mesh.material) mesh.material.emissiveIntensity = 0;
        });

        if (!platformFound) {
            console.warn('⚠️ Platform not found in Gallery model!');
        }
    }, [groupRef.current, isMobile, acsesTexture]);

    // Animation and interaction logic (useFrame, handlePointerMove, etc.) remains the same...
    useFrame((state) => {
        if (!animationStartTime.current) animationStartTime.current = state.clock.elapsedTime;
        const elapsed = state.clock.elapsedTime - animationStartTime.current;

        if (animationPhase === 'blackout') {
            if (elapsed > 0.5) setAnimationPhase('radial-expand');
        } else if (animationPhase === 'radial-expand') {
            const progress = Math.min((elapsed - 0.5) / 2.5, 1);
            const expandRadius = progress * 30;
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    const worldPos = new THREE.Vector3();
                    mesh.getWorldPosition(worldPos);
                    const distanceFromCenter = new THREE.Vector2(worldPos.x, worldPos.z).length();
                    let intensity = 0;
                    if (distanceFromCenter < expandRadius) {
                        const distanceFromWaveFront = expandRadius - distanceFromCenter;
                        intensity = (distanceFromWaveFront < 5) ? 1 - (distanceFromWaveFront / 5) : 1;
                    }
                    mesh.material.emissiveIntensity = originalIntensity * intensity;
                }
            });
            if (progress >= 1) setAnimationPhase('complete');
        } else if (animationPhase === 'complete') {
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            imagePlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) mesh.material.emissiveIntensity = originalIntensity;
            });
            setAnimationPhase('done');
        }

        if (animationPhase === 'done') {
            imagePlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material && !hoveredFrame) mesh.material.emissiveIntensity = originalIntensity;
            });
            if (hoveredFrame && hoveredFrame.material && !isMobile) {
                hoveredFrame.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.5;
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
        if (hoveredFrame && hoveredFrame.material) {
            hoveredFrame.material.emissiveIntensity = hoveredFrame.userData.originalIntensity || 0.1;
        }
        let foundClickable = false;
        if (intersects.length > 0) {
            let clickableObject = intersects[0].object;
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent;
            }
            if (clickableObject) {
                setHoveredFrame(clickableObject);
                gl.domElement.style.cursor = 'pointer';
                foundClickable = true;
            }
        }
        if (!foundClickable) {
            setHoveredFrame(null);
            gl.domElement.style.cursor = 'default';
        }
    }, [animationPhase, isMobile, gl, raycaster, camera, hoveredFrame]);

    const handleClick = useCallback((event) => {
        if (animationPhase !== 'done' || !groupRef.current) return;

        const rect = gl.domElement.getBoundingClientRect();
        const x = isMobile && event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
        const y = isMobile && event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

        mouse.current.x = ((x - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((y - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse.current, camera);
        const intersects = raycaster.intersectObject(groupRef.current, true);

        if (intersects.length > 0) {
            let clickableObject = intersects[0].object;
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent;
            }
            if (clickableObject) {
                const frameName = clickableObject.userData.frameName || clickableObject.name;
                console.log('Selected Frame:', frameName);
                if (onFrameSelect) onFrameSelect(frameName);
            }
        }
    }, [animationPhase, gl, raycaster, camera, isMobile, onFrameSelect]);

    return (
        <ModelWrapper
            ref={groupRef}
            url="/models/event-gallery.glb"
            onPointerMove={handlePointerMove}
            onClick={handleClick}
            onPointerUp={isMobile ? handleClick : undefined}
            onTouchEnd={isMobile ? (e) => { e.preventDefault(); handleClick(e); } : undefined}
        />
    );
}
