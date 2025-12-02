import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, Text3D, Center } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

export default function MainCampus({ onBuildingClick, onHODClick }) {
  const groupRef = useRef()
  const billboardLightRef = useRef()
  const hodZoneRef = useRef()
  const fcZoneRef = useRef()
  const { camera, raycaster, gl } = useThree()
  const navigate = useNavigate()

  const { scene } = useGLTF('/models/main-campus.glb')

  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [billboardPosition, setBillboardPosition] = useState(null)
  const [hodCabinPosition, setHodCabinPosition] = useState(null)
  const [fcPosition, setFcPosition] = useState(null)
  const [animationPhase, setAnimationPhase] = useState('blackout')
  const [flickerCount, setFlickerCount] = useState(0)
  const mouse = useRef(new THREE.Vector2())
  const emissiveMeshes = useRef([])
  const animationStartTime = useRef(0)
  const hasLoggedRestore = useRef(false)

  const clonedScene = React.useMemo(() => scene.clone(), [scene])

  // Building label configuration
  const labelConfig = {
    'Teams_plane': { text: 'TEAMS', route: '/teams' },
    'Teams_Building': { text: 'TEAMS', route: '/teams' },
    'About_Acses_plane': { text: 'ABOUT US', route: '/about' },
    'About_Acses_Building': { text: 'ABOUT US', route: '/about' },
    'Event_gallery_plane': { text: 'EVENTS', route: '/events' },
    'Event_gallery_name': { text: 'EVENTS', route: '/events' },
    'Event_gallery_building': { text: 'EVENTS', route: '/events' },
    'Contact_us_plane': { text: 'CONTACT', route: '/contact' },
    'ContactUs_Building': { text: 'CONTACT', route: '/contact' },
    'HOD_cabin': { text: 'HOD CABIN', route: 'modal', action: 'hod' },
    'hod_cabin': { text: 'HOD CABIN', route: 'modal', action: 'hod' }
  }

  // Setup: Find Billboard, emissive meshes, armatures, and make buildings clickable
  useEffect(() => {
    console.log('🚀 Setting up Main Campus scene...')

    let billboardFound = false
    const emissiveMeshesList = []
    let hodArmatureFound = false
    let fcArmatureFound = false
    const hodPositions = []
    const fcPositions = []

    clonedScene.traverse((child) => {
      // Handle regular MESHES
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Billboard plane - EXACT values preserved
        if (child.name === 'Billboard_plane') {
          billboardFound = true

          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          setBillboardPosition(worldPos)

          if (child.material) {
            child.material = child.material.clone()
            child.material.emissive = new THREE.Color('#aa00ff')
            child.material.emissiveIntensity = 5.8
            child.material.color = new THREE.Color('#ff00ff')
            child.material.toneMapped = false
            child.material.transparent = true
            child.material.opacity = 0.95
            child.material.side = THREE.DoubleSide
            child.material.needsUpdate = true

            emissiveMeshesList.push({
              mesh: child,
              name: 'Billboard_plane',
              originalIntensity: 5.8,
              originalEmissive: new THREE.Color('#aa00ff'),
              originalToneMapped: false
            })
          }
        }
        // Other emissive materials - EXACT values preserved
        else if (child.material && child.material.emissive) {
          const emissiveHex = child.material.emissive.getHex()

          if (emissiveHex === 0x00e5ff || emissiveHex === 0x00ffff) {
            child.material = child.material.clone()
            child.material.emissiveIntensity = 1.7
            child.material.toneMapped = false
            child.material.needsUpdate = true

            emissiveMeshesList.push({
              mesh: child,
              name: child.name,
              originalIntensity: 1.7,
              originalEmissive: child.material.emissive.clone(),
              originalToneMapped: false
            })
          }
          else if (emissiveHex === 0xaa00ff || emissiveHex === 0xff00ff) {
            child.material = child.material.clone()
            child.material.emissiveIntensity = 5
            child.material.toneMapped = true
            child.material.needsUpdate = true

            emissiveMeshesList.push({
              mesh: child,
              name: child.name,
              originalIntensity: 5,
              originalEmissive: child.material.emissive.clone(),
              originalToneMapped: true
            })
          }
        }

        // Make buildings and labels clickable
        Object.keys(labelConfig).forEach((meshName) => {
          if (child.name === meshName || child.name.toLowerCase().includes(meshName.toLowerCase())) {
            const config = labelConfig[meshName]
            child.userData.clickable = true
            child.userData.route = config.route
            child.userData.action = config.action
            child.userData.buildingName = meshName
            child.userData.originalEmissive = child.material?.emissive?.clone()
            child.userData.originalIntensity = child.material?.emissiveIntensity || 0
          }
        })

        // Collect HOD cabin positions to calculate center
        if (child.name && child.name.startsWith('HOD_')) {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          hodPositions.push(worldPos)
        }
      }

      // Handle SKINNED MESHES (armature characters)
      if (child.isSkinnedMesh) {
        console.log(`👤 Found skinned mesh: ${child.name} (parent: ${child.parent?.name})`)
        child.castShadow = true
        child.receiveShadow = true

        // Force proper material rendering
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.needsUpdate = true
              mat.side = THREE.FrontSide
            })
          } else {
            child.material.needsUpdate = true
            child.material.side = THREE.FrontSide
          }
        }

        const worldPos = new THREE.Vector3()
        child.getWorldPosition(worldPos)

        // Check parent armature name to determine if it's HOD or FC
        const parentName = child.parent?.name || ''

        if (parentName.includes('man_in_suit001') || parentName.includes('HOD')) {
          // HOD character
          child.userData.clickable = true
          child.userData.route = 'modal'
          child.userData.action = 'hod'
          child.userData.buildingName = 'HOD_character'
          hodPositions.push(worldPos)
          hodArmatureFound = true
          console.log(`✅ Made HOD skinned mesh ${child.name} clickable`)
        } else if (parentName.includes('FC')) {
          // FC character
          child.userData.clickable = true
          child.userData.route = 'modal'
          child.userData.action = 'hod'
          child.userData.buildingName = 'FC_character'
          fcPositions.push(worldPos)
          fcArmatureFound = true
          console.log(`✅ Made FC skinned mesh ${child.name} clickable`)
        }
      }

      // Handle ARMATURE objects directly (Group/Object3D with name HOD or FC)
      if ((child.type === 'Object3D' || child.type === 'Group' || child.type === 'Bone') &&
        (child.name === 'HOD' || child.name === 'FC' || child.name.includes('FC') || child.name.includes('man_in_suit001'))) {

        const worldPos = new THREE.Vector3()
        child.getWorldPosition(worldPos)

        if (child.name === 'HOD' || child.name.includes('man_in_suit001')) {
          hodPositions.push(worldPos)
          hodArmatureFound = true
          console.log(`🎯 Found HOD armature at`, worldPos)
        } else if (child.name === 'FC' || child.name.includes('FC')) {
          fcPositions.push(worldPos)
          fcArmatureFound = true
          console.log(`🎯 Found FC armature at`, worldPos)
        }
      }
    })

    // Calculate average position for HOD clickable zone
    if (hodPositions.length > 0) {
      const avgPos = hodPositions.reduce((acc, pos) => {
        acc.x += pos.x
        acc.y += pos.y
        acc.z += pos.z
        return acc
      }, new THREE.Vector3(0, 0, 0))

      avgPos.divideScalar(hodPositions.length)
      setHodCabinPosition(avgPos)
      console.log('🎯 HOD zone center position:', avgPos)
    }

    // Calculate average position for FC clickable zone
    if (fcPositions.length > 0) {
      const avgPos = fcPositions.reduce((acc, pos) => {
        acc.x += pos.x
        acc.y += pos.y
        acc.z += pos.z
        return acc
      }, new THREE.Vector3(0, 0, 0))

      avgPos.divideScalar(fcPositions.length)
      setFcPosition(avgPos)
      console.log('🎯 FC zone center position:', avgPos)
    }

    emissiveMeshes.current = emissiveMeshesList

    // Set all lights to zero initially
    emissiveMeshesList.forEach(({ mesh }) => {
      if (mesh.material) {
        mesh.material.emissiveIntensity = 0
      }
    })

    if (!billboardFound) {
      console.warn('⚠️ Billboard_plane not found!')
    }
    if (!hodArmatureFound) {
      console.warn('⚠️ No HOD armature found!')
    }
    if (!fcArmatureFound) {
      console.warn('⚠️ No FC armature found!')
    }

    console.log('✅ Main Campus setup complete')
  }, [clonedScene])

  // Dramatic flicker animation
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

    // Hover glow effect for buildings
    if (hoveredBuilding && animationPhase === 'done') {
      if (hoveredBuilding.material) {
        const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 1.5
        hoveredBuilding.material.emissiveIntensity = (hoveredBuilding.userData.originalIntensity || 1) * pulseIntensity
      }
    }
  })

  // Mouse handling
  const handlePointerMove = (event) => {
    if (animationPhase !== 'done') return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse.current, camera)

    // Check scene, HOD zone, and FC zone
    const sceneIntersects = raycaster.intersectObject(clonedScene, true)
    const hodZoneIntersects = hodZoneRef.current ? raycaster.intersectObject(hodZoneRef.current) : []
    const fcZoneIntersects = fcZoneRef.current ? raycaster.intersectObject(fcZoneRef.current) : []
    const allIntersects = [...hodZoneIntersects, ...fcZoneIntersects, ...sceneIntersects]

    // Reset previous hover
    if (hoveredBuilding && hoveredBuilding.material) {
      hoveredBuilding.material.emissiveIntensity = hoveredBuilding.userData.originalIntensity || 1
    }

    if (allIntersects.length > 0) {
      const firstIntersect = allIntersects[0].object

      // Check if it's the HOD or FC zone
      if (firstIntersect === hodZoneRef.current || firstIntersect === fcZoneRef.current) {
        setHoveredBuilding(firstIntersect)
        gl.domElement.style.cursor = 'pointer'
        return
      }

      // Otherwise check for clickable buildings
      let clickableObject = firstIntersect

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
    if (animationPhase !== 'done') {
      return
    }

    // Check if HOD or FC zone was clicked
    if (hoveredBuilding === hodZoneRef.current || hoveredBuilding === fcZoneRef.current) {
      console.log('🚀 Character zone clicked! Calling onHODClick')
      if (onHODClick) {
        onHODClick()
      }
      return
    }

    if (hoveredBuilding && hoveredBuilding.userData) {
      const { route, action, buildingName } = hoveredBuilding.userData

      if (action === 'hod') {
        if (onHODClick) {
          onHODClick()
        }
      } else if (route && route !== 'modal') {
        navigate(route)

        if (onBuildingClick) {
          onBuildingClick(route)
        }
      }
    }
  }

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
      {/* Billboard Purple Point Light - EXACT VALUES PRESERVED */}
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
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}

      {/* The 3D Model */}
      <primitive
        ref={groupRef}
        object={clonedScene}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      />

      {/* HOD Clickable Zone - FULLY INVISIBLE */}
      {hodCabinPosition && (
        <mesh
          ref={hodZoneRef}
          position={[hodCabinPosition.x - 0.2, hodCabinPosition.y + 0.4, hodCabinPosition.z]}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
        >
          <boxGeometry args={[3.25, 2.3, 3.1]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      )}

      {/* FC Clickable Zone - FULLY INVISIBLE */}
      {fcPosition && (
        <mesh
          ref={fcZoneRef}
          position={[fcPosition.x, fcPosition.y + 1, fcPosition.z]}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
        >
          <boxGeometry args={[2, 3, 2]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      )}
    </>
  )
}

useGLTF.preload('/models/main-campus.glb')
