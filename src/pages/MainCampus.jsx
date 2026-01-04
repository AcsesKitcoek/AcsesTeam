import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useMobileDetection } from '../hooks/useMobileDetection';
import ClickableZone from '../components/scene/ClickableZone';
import { ModelWrapper } from '../components/scene/ModelWrapper'; // Updated import

export default function MainCampus({ onBuildingClick, onHODClick }) {
  const groupRef = useRef(); // This ref will point to the model's scene from ModelWrapper
  const billboardLightRef = useRef();
  const hodZoneRef = useRef();
  const fcZoneRef = useRef();
  const { camera, raycaster, gl } = useThree();
  const navigate = useNavigate();

  // The custom useDracoLoader hook is no longer needed.
  // const { scene, loading, error } = useDracoLoader('/models/main-campus.glb');
  const isMobile = useMobileDetection();

  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [billboardPosition, setBillboardPosition] = useState(null);
  const [hodCabinPosition, setHodCabinPosition] = useState(null);
  const [fcPosition, setFcPosition] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('blackout');
  const [flickerCount, setFlickerCount] = useState(0);

  const mouse = useRef(new THREE.Vector2());
  const touch = useRef(new THREE.Vector2());
  const emissiveMeshes = useRef([]);
  const animationStartTime = useRef(0);

  // The clonedScene memo is no longer needed; we will use the ref directly.
  // const clonedScene = useMemo(() => { ... });

  const labelConfig = useMemo(() => ({
    'Teams_plane': { text: 'TEAMS', route: '/teams' },
    'Teams_Building': { text: 'TEAMS', route: '/teams' },
    'About_Acses_plane': { text: 'ABOUT US', route: '/about' },
    'About_Acses_Building': { text: 'ABOUT US', route: '/about' },
    'Event_gallary_plane': { text: 'EVENTS', route: '/events' },
    'Event_gallary_name': { text: 'EVENTS', route: '/events' },
    'Event_gallary_building': { text: 'EVENTS', route: '/events' },
    'Contact_us_plane': { text: 'CONTACT', route: '/contact' },
    'ContactUs_Building': { text: 'CONTACT', route: '/contact' },
    'HOD_cabin': { text: 'HOD CABIN', route: 'modal', action: 'hod' },
    'hod_cabin': { text: 'HOD CABIN', route: 'modal', action: 'hod' }
  }), []);

  // Setup: This effect now depends on the ref to the model's scene.
  useEffect(() => {
    const modelScene = groupRef.current;
    if (!modelScene) return;

    let billboardFound = false;
    const emissiveMeshesList = [];
    let hodArmatureFound = false;
    let fcArmatureFound = false;
    const hodPositions = [];
    const fcPositions = [];

    // The traversal logic is preserved but operates on the ref's current value
    modelScene.traverse((child) => {
      // NOTE: The basic castShadow, receiveShadow, and material.needsUpdate
      // are already handled by ModelWrapper. We keep the specific material logic here.

      if (child.isMesh) {
        // Billboard plane - EXACT values preserved
        if (child.name === 'Billboard_plane') {
          billboardFound = true;

          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          setBillboardPosition(worldPos);

          if (child.material) {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color('#aa00ff');
            child.material.emissiveIntensity = 5.8;
            child.material.color = new THREE.Color('#ff00ff');
            child.material.toneMapped = false;
            child.material.transparent = true;
            child.material.opacity = 0.95;
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;

            emissiveMeshesList.push({
              mesh: child,
              name: 'Billboard_plane',
              originalIntensity: 5.8,
              originalEmissive: new THREE.Color('#aa00ff'),
              originalToneMapped: false
            });
          }
        }
        // Other emissive materials - EXACT values preserved
        else if (child.material && child.material.emissive) {
          const emissiveHex = child.material.emissive.getHex();

          if (emissiveHex === 0x00e5ff || emissiveHex === 0x00ffff) {
            child.material = child.material.clone();
            child.material.emissiveIntensity = 1.7;
            child.material.toneMapped = false;
            child.material.needsUpdate = true;

            emissiveMeshesList.push({
              mesh: child,
              name: child.name,
              originalIntensity: 1.7,
              originalEmissive: child.material.emissive.clone(),
              originalToneMapped: false
            });
          }
          else if (emissiveHex === 0xaa00ff || emissiveHex === 0xff00ff) {
            child.material = child.material.clone();
            child.material.emissiveIntensity = 5;
            child.material.toneMapped = true;
            child.material.needsUpdate = true;

            emissiveMeshesList.push({
              mesh: child,
              name: child.name,
              originalIntensity: 5,
              originalEmissive: child.material.emissive.clone(),
              originalToneMapped: true
            });
          }
        }

        Object.keys(labelConfig).forEach((meshName) => {
          if (child.name === meshName || child.name.toLowerCase().includes(meshName.toLowerCase())) {
            const config = labelConfig[meshName];
            child.userData.clickable = true;
            child.userData.route = config.route;
            child.userData.action = config.action;
            child.userData.buildingName = meshName;
            child.userData.originalEmissive = child.material?.emissive?.clone();
            child.userData.originalIntensity = child.material?.emissiveIntensity || 0;
          }
        });

        if (child.name && child.name.startsWith('HOD_')) {
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          hodPositions.push(worldPos);
        }
      }

      if (child.isSkinnedMesh) {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.needsUpdate = true;
              mat.side = THREE.FrontSide;
            });
          } else {
            child.material.needsUpdate = true;
            child.material.side = THREE.FrontSide;
          }
        }

        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        const parentName = child.parent?.name || '';

        if (parentName.includes('man_in_suit001') || parentName.includes('HOD')) {
          child.userData.clickable = true;
          child.userData.route = 'modal';
          child.userData.action = 'hod';
          child.userData.buildingName = 'HOD_character';
          hodPositions.push(worldPos);
          hodArmatureFound = true;
        } else if (parentName.includes('FC')) {
          child.userData.clickable = true;
          child.userData.route = 'modal';
          child.userData.action = 'hod';
          child.userData.buildingName = 'FC_character';
          fcPositions.push(worldPos);
          fcArmatureFound = true;
        }
      }

      if ((child.type === 'Object3D' || child.type === 'Group' || child.type === 'Bone') &&
        (child.name === 'HOD' || child.name === 'FC' || child.name.includes('FC') || child.name.includes('man_in_suit001'))) {

        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);

        if (child.name === 'HOD' || child.name.includes('man_in_suit001')) {
          hodPositions.push(worldPos);
          hodArmatureFound = true;
        } else if (child.name === 'FC' || child.name.includes('FC')) {
          fcPositions.push(worldPos);
          fcArmatureFound = true;
        }
      }
    });

    if (hodPositions.length > 0) {
      const avgPos = hodPositions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3(0, 0, 0));
      avgPos.divideScalar(hodPositions.length);
      setHodCabinPosition(avgPos);
    }

    if (fcPositions.length > 0) {
      const avgPos = fcPositions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3(0, 0, 0));
      avgPos.divideScalar(fcPositions.length);
      setFcPosition(avgPos);
    }

    emissiveMeshes.current = emissiveMeshesList;

    emissiveMeshesList.forEach(({ mesh }) => {
      if (mesh.material) {
        mesh.material.emissiveIntensity = 0;
      }
    });

    if (!billboardFound) console.warn('⚠️ Billboard_plane not found!');
    if (!hodArmatureFound) console.warn('⚠️ No HOD armature found!');
    if (!fcArmatureFound) console.warn('⚠️ No FC armature found!');

  }, [groupRef.current, isMobile, labelConfig]); // Depend on the ref's current value

  // ... (useFrame animation logic remains unchanged)
  useFrame((state) => {
    if (!animationStartTime.current) {
      animationStartTime.current = state.clock.elapsedTime
    }

    const elapsed = state.clock.elapsedTime - animationStartTime.current

    if (animationPhase === 'blackout') {
      if (elapsed > 0.8) {
        setAnimationPhase('flickering')
        setFlickerCount(0)
      }
    }
    else if (animationPhase === 'flickering') {
      const flickerDuration = 0.6
      const flickerPhase = (elapsed - 0.8) % flickerDuration
      const currentFlicker = Math.floor((elapsed - 0.8) / flickerDuration)
      const maxFlickers = 1

      if (currentFlicker < maxFlickers) {
        let intensity = 0
        if (flickerPhase < 0.15) {
          intensity = 1
        } else if (flickerPhase < 0.45) {
          intensity = 0
        } else if (flickerPhase < 0.5) {
          intensity = 1
        } else {
          intensity = 0
        }

        emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
          if (mesh.material) {
            mesh.material.emissiveIntensity = originalIntensity * intensity
          }
        })

        if (billboardLightRef.current) {
          billboardLightRef.current.intensity = 25 * intensity
        }

        if (currentFlicker !== flickerCount) {
          setFlickerCount(currentFlicker)
        }
      } else {
        setAnimationPhase('complete')
      }
    }
    else if (animationPhase === 'complete') {
      emissiveMeshes.current.forEach(({ mesh, originalIntensity, originalEmissive, originalToneMapped }) => {
        if (mesh.material) {
          mesh.material.emissiveIntensity = originalIntensity
          mesh.material.emissive.copy(originalEmissive)
          mesh.material.toneMapped = originalToneMapped
          mesh.material.needsUpdate = true
        }
      })

      if (billboardLightRef.current) {
        billboardLightRef.current.intensity = 25
      }

      setAnimationPhase('done')
    }

    if (hoveredBuilding && animationPhase === 'done' && !isMobile) {
      if (hoveredBuilding.material) {
        const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 1.5
        hoveredBuilding.material.emissiveIntensity = (hoveredBuilding.userData.originalIntensity || 1) * pulseIntensity
      }
    }
  });


  // ... (handlePointerMove and handleClick logic remains largely unchanged, but references groupRef.current)
  const handlePointerMove = useCallback((event) => {
    const modelScene = groupRef.current;
    if (animationPhase !== 'done' || isMobile || !modelScene) return;

    const rect = gl.domElement.getBoundingClientRect();
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse.current, camera);

    const sceneIntersects = raycaster.intersectObject(modelScene, true);
    const hodZoneIntersects = hodZoneRef.current ? raycaster.intersectObject(hodZoneRef.current) : [];
    const fcZoneIntersects = fcZoneRef.current ? raycaster.intersectObject(fcZoneRef.current) : [];
    const allIntersects = [...hodZoneIntersects, ...fcZoneIntersects, ...sceneIntersects];

    if (hoveredBuilding && hoveredBuilding.material) {
      hoveredBuilding.material.emissiveIntensity = hoveredBuilding.userData.originalIntensity || 1;
    }

    if (allIntersects.length > 0) {
      const firstIntersect = allIntersects[0].object;
      if (firstIntersect === hodZoneRef.current || firstIntersect === fcZoneRef.current) {
        setHoveredBuilding(firstIntersect);
        gl.domElement.style.cursor = 'pointer';
        return;
      }

      let clickableObject = firstIntersect;
      while (clickableObject && !clickableObject.userData.clickable) {
        clickableObject = clickableObject.parent;
      }
      if (clickableObject && clickableObject.userData.clickable) {
        setHoveredBuilding(clickableObject);
        gl.domElement.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredBuilding(null);
    gl.domElement.style.cursor = 'default';
  }, [animationPhase, isMobile, gl, raycaster, camera, hoveredBuilding]);

  const handleClick = useCallback((event) => {
    const modelScene = groupRef.current;
    if (animationPhase !== 'done' || !modelScene) return;

    const rect = gl.domElement.getBoundingClientRect();
    let clientX, clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    touch.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    touch.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(touch.current, camera);

    const sceneIntersects = raycaster.intersectObject(modelScene, true);
    const hodZoneIntersects = hodZoneRef.current ? raycaster.intersectObject(hodZoneRef.current) : [];
    const fcZoneIntersects = fcZoneRef.current ? raycaster.intersectObject(fcZoneRef.current) : [];
    const allIntersects = [...hodZoneIntersects, ...fcZoneIntersects, ...sceneIntersects];

    if (allIntersects.length > 0) {
      const firstIntersect = allIntersects[0].object;
      if (firstIntersect === hodZoneRef.current || firstIntersect === fcZoneRef.current) {
        if (onHODClick) onHODClick();
        return;
      }

      let clickableObject = firstIntersect;
      while (clickableObject && !clickableObject.userData.clickable) {
        clickableObject = clickableObject.parent;
      }
      if (clickableObject && clickableObject.userData.clickable) {
        const { route, action } = clickableObject.userData;
        if (action === 'hod') {
          if (onHODClick) onHODClick();
        } else if (route && route !== 'modal') {
          navigate(route);
if (onBuildingClick) onBuildingClick(route);
        }
      }
    }
  }, [animationPhase, gl, raycaster, camera, onHODClick, onBuildingClick, navigate]);

  // This effect is no longer needed as the ref handles the scene object
  // useEffect(() => { ... });

  // Loading and error states are now handled by Suspense in App.jsx
  // if (loading || !clonedScene) { ... }
  // if (error) { ... }

  return (
    <>
      {billboardPosition && (
        <pointLight
          ref={billboardLightRef}
          position={[
            billboardPosition.x + 2,
            billboardPosition.y + 3,
            billboardPosition.z + 2
          ]}
          intensity={25}
          color="#aa00ff"
          distance={30}
          decay={0.3}
          castShadow={true}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}

      {/* Use the ModelWrapper to load the model and attach the ref and event handlers */}
      <ModelWrapper
        ref={groupRef}
        url="/models/main-campus.glb"
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        onPointerUp={isMobile ? handleClick : undefined}
        onTouchEnd={isMobile ? (e) => { e.preventDefault(); handleClick(e); } : undefined}
      />

      {hodCabinPosition && (
        <ClickableZone
          ref={hodZoneRef}
          position={[hodCabinPosition.x - 0.2, hodCabinPosition.y + 0.4, hodCabinPosition.z]}
          size={isMobile ? [4, 3, 4] : [3.25, 2.3, 3.1]}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
          onPointerUp={isMobile ? handleClick : undefined}
        />
      )}

      {fcPosition && (
        <ClickableZone
          ref={fcZoneRef}
          position={[fcPosition.x, fcPosition.y + 1, fcPosition.z]}
          size={isMobile ? [2.5, 3.5, 2.5] : [2, 3, 2]}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
          onPointerUp={isMobile ? handleClick : undefined}
        />
      )}
    </>
  );
}
