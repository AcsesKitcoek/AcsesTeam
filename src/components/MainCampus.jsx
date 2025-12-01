import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function MainCampus({ onBuildingClick }) {
  const groupRef = useRef()
  const billboardLightRef = useRef()
  const { camera, raycaster, gl } = useThree()

  const { scene } = useGLTF('/models/main-campus.glb')

  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [billboardPosition, setBillboardPosition] = useState(null)
  const mouse = useRef(new THREE.Vector2())

  const clonedScene = React.useMemo(() => scene.clone(), [scene])

  // Setup: Find Billboard and give it unique material
  useEffect(() => {
    console.log('Setting up Main Campus scene...')

    let billboardFound = false

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Check if THIS is the Billboard_plane
        if (child.name === 'Billboard_plane') {
          console.log('✅ Billboard_plane found!')
          billboardFound = true

          // Get world position for point light
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          setBillboardPosition(worldPos)

          // IMPORTANT: Clone the material so it's unique to billboard
          if (child.material) {
            child.material = child.material.clone()

            // Now modify ONLY the billboard's material
            child.material.emissive = new THREE.Color('#aa00ff')
            child.material.emissiveIntensity = 2.5  // Reduced for better balance with new lighting
            child.material.toneMapped = false
            child.material.needsUpdate = true
            console.log('✅ Billboard material cloned and boosted')
          }
        }
        // For ALL other purple/cyan screens - adjust emissive for new lighting
        else if (child.material && child.material.emissive) {
          const emissiveHex = child.material.emissive.getHex()

          // If it's purple/magenta or cyan
          if (emissiveHex === 0xaa00ff || emissiveHex === 0xff00ff || emissiveHex === 0x00ffff) {
            // Clone material for this mesh too (so changes don't affect others)
            child.material = child.material.clone()
            child.material.emissiveIntensity = 0.8  // Increased for better visibility
            child.material.toneMapped = true
            console.log(`Adjusted ${child.name} emissive to 0.8`)
          }
        }

        // Make buildings clickable - using exact Blender collection names
        const buildingNames = [
          'Event_gallery',
          'About_acses',
          'Teams',
          'ContactUs'
        ]

        buildingNames.forEach(name => {
          if (child.name.toLowerCase().includes(name.toLowerCase())) {
            child.userData.clickable = true
            child.userData.buildingType = name.toLowerCase().replace('_', '-')
            console.log(`✅ Made ${child.name} clickable as ${child.userData.buildingType}`)
          }
        })
      }
    })

    if (!billboardFound) {
      console.warn('⚠️ Billboard_plane not found! Check object name in Blender.')
      // Log all mesh names for debugging
      console.log('Available mesh names:')
      clonedScene.traverse((child) => {
        if (child.isMesh) console.log(`  - ${child.name}`)
      })
    }

    console.log('✅ Main Campus setup complete')
  }, [clonedScene])

  // Mouse handling
  const handlePointerMove = (event) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse.current, camera)
    const intersects = raycaster.intersectObject(clonedScene, true)

    if (intersects.length > 0) {
      let clickableObject = intersects[0].object

      while (clickableObject && !clickableObject.userData.clickable) {
        clickableObject = clickableObject.parent
      }

      if (clickableObject && clickableObject.userData.clickable) {
        setHoveredBuilding(clickableObject)
        gl.domElement.style.cursor = 'pointer'
        return
      }
    }

    setHoveredBuilding(null)
    gl.domElement.style.cursor = 'default'
  }

  const handleClick = (event) => {
    if (hoveredBuilding && hoveredBuilding.userData.buildingType) {
      console.log('Building clicked:', hoveredBuilding.userData.buildingType)

      const buildingMap = {
        'event-gallery': 'event-gallery',
        'about-acses': 'about-acses',
        'teams': 'teams-building',
        'contactus': 'contact-us',
        'contact': 'contact-us'
      }

      const sceneId = buildingMap[hoveredBuilding.userData.buildingType]
      if (sceneId) {
        onBuildingClick(sceneId)
      }
    }
  }

  // Animations
  useFrame((state) => {
    // Hover animation
    // if (hoveredBuilding) {
    //   const originalY = hoveredBuilding.userData.originalY || 0
    //   hoveredBuilding.position.y = originalY + Math.sin(state.clock.elapsedTime * 3) * 0.15
    // }

    // Pulsing billboard light
    if (billboardLightRef.current) {
      // const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.3 + 0.7  // 0.4 to 1.0
      // billboardLightRef.current.intensity = 25 * pulse  // Reduced from 55
    }
  })

  // Store original positions
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.userData.clickable && child.userData.originalY === undefined) {
        child.userData.originalY = child.position.y
      }
    })
  }, [clonedScene])

  return (
    <>
      {/* Billboard Purple Point Light - Adjusted for new global lighting */}
      {billboardPosition && (
        <pointLight
          ref={billboardLightRef}
          position={[
            billboardPosition.x + 2,
            billboardPosition.y + 3,
            billboardPosition.z + 2
          ]}
          intensity={15}  // Further reduced to balance with enhanced ambient lighting
          color="#aa00ff"
          distance={25}
          decay={0.2}
        />
      )}

      {/* The 3D Model */}
      <primitive
        ref={groupRef}
        object={clonedScene}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      />
    </>
  )
}

useGLTF.preload('/models/main-campus.glb')
