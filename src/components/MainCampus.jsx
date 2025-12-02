import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, Text3D, Center } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

export default function MainCampus({ onBuildingClick }) {
  const groupRef = useRef()
  const billboardLightRef = useRef()
  const { camera, raycaster, gl } = useThree()
  const navigate = useNavigate()

  const { scene } = useGLTF('/models/main-campus.glb')

  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [billboardPosition, setBillboardPosition] = useState(null)
  const [animationPhase, setAnimationPhase] = useState('blackout')
  const [flickerCount, setFlickerCount] = useState(0)
  const [showHODModal, setShowHODModal] = useState(false)
  const mouse = useRef(new THREE.Vector2())
  const emissiveMeshes = useRef([])
  const animationStartTime = useRef(0)
  const hasLoggedRestore = useRef(false)
  const buildingLabels = useRef({})

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

  // Setup: Find Billboard, emissive meshes, and make buildings clickable
  useEffect(() => {
    console.log('🚀 Setting up Main Campus scene...')

    let billboardFound = false
    const emissiveMeshesList = []

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Billboard plane
        if (child.name === 'Billboard_plane') {
          billboardFound = true
          console.log('✅ Billboard_plane found!')

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
        // Other emissive materials
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

            console.log(`✅ Made ${child.name} clickable`)
          }
        })
      }
    })

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

    // Hover glow effect (instead of bounce)
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
    const intersects = raycaster.intersectObject(clonedScene, true)

    // Reset previous hover
    if (hoveredBuilding && hoveredBuilding.material) {
      hoveredBuilding.material.emissiveIntensity = hoveredBuilding.userData.originalIntensity || 1
    }

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
    if (animationPhase !== 'done') return

    if (hoveredBuilding && hoveredBuilding.userData) {
      const { route, action, buildingName } = hoveredBuilding.userData

      console.log('🖱️ Building clicked:', buildingName, '→', route)

      if (action === 'hod') {
        // Show HOD modal
        setShowHODModal(true)
      } else if (route && route !== 'modal') {
        // Navigate to route
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
      {/* Billboard Purple Point Light */}
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

      {/* HOD Modal Overlay */}
      {showHODModal && (
        <HODModal onClose={() => setShowHODModal(false)} />
      )}
    </>
  )
}

// HOD Modal Component
function HODModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      pointerEvents: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(42, 0, 84, 0.95), rgba(20, 0, 40, 0.95))',
        border: '2px solid #ff00ff',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 0 40px rgba(255, 0, 255, 0.5)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: '2px solid #ff00ff',
            color: '#ff00ff',
            fontSize: '24px',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff00ff'
            e.target.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = '#ff00ff'
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          color: '#ff00ff',
          fontSize: '32px',
          marginBottom: '30px',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255, 0, 255, 0.8)'
        }}>
          HOD CABIN
        </h2>

        {/* HOD Info */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(255, 0, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 0, 255, 0.3)'
        }}>
          <h3 style={{
            color: '#00ffff',
            fontSize: '20px',
            marginBottom: '10px'
          }}>
            Head of Department
          </h3>
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '5px'
          }}>
            <strong>Name:</strong> Dr. [HOD Name]
          </p>
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '5px'
          }}>
            <strong>Email:</strong> hod@example.com
          </p>
          <p style={{
            color: '#ffffff',
            fontSize: '16px'
          }}>
            <strong>Phone:</strong> +91 XXXXXXXXXX
          </p>
        </div>

        {/* Faculty Coordinator Info */}
        <div style={{
          padding: '20px',
          background: 'rgba(0, 255, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 255, 255, 0.3)'
        }}>
          <h3 style={{
            color: '#00ffff',
            fontSize: '20px',
            marginBottom: '10px'
          }}>
            Faculty Coordinator
          </h3>
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '5px'
          }}>
            <strong>Name:</strong> Prof. [Faculty Name]
          </p>
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '5px'
          }}>
            <strong>Email:</strong> faculty@example.com
          </p>
          <p style={{
            color: '#ffffff',
            fontSize: '16px'
          }}>
            <strong>Phone:</strong> +91 XXXXXXXXXX
          </p>
        </div>
      </div>
    </div>
  )
}

useGLTF.preload('/models/main-campus.glb')
