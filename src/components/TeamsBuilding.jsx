import React, { useRef, useEffect, useState } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TeamsBuilding() {
    const groupRef = useRef()
    const [lightPositions, setLightPositions] = useState([])
    const [animationPhase, setAnimationPhase] = useState('boot') // boot, random-init, sync, complete, done
    const animationStartTime = useRef(0)
    const lightRefs = useRef([])
    const emissiveMeshes = useRef([])
    const screenMeshes = useRef([])
    const activationSchedule = useRef([])

    const { scene } = useGLTF('/models/towerss.glb')
    const acsesTexture = useTexture('/images/ACSES_Image.jpg')

    const clonedScene = React.useMemo(() => scene.clone(), [scene])

    // Setup: Configure materials and emissive lighting
    useEffect(() => {
        console.log('🚀 Setting up Teams Building scene...')

        let lightsFound = 0
        let screensFound = 0
        let baseFound = false
        let mainStructureFixed = false
        const positions = []
        const emissiveList = []
        const screenList = []

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true

                const meshNameLower = child.name.toLowerCase()

                // Ceiling lights - pattern: Light_11, Light_12, Light_21, etc.
                if (child.name.startsWith('Light_')) {
                    lightsFound++

                    const worldPos = new THREE.Vector3()
                    child.getWorldPosition(worldPos)
                    positions.push({
                        position: worldPos.clone(),
                        name: child.name,
                        lightIndex: lightsFound - 1  // Store the index for matching with pointLight
                    })

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#eeccff')
                        child.material.emissiveIntensity = 1.2
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        // Store for animation
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1,
                            currentIntensity: 0,
                            type: 'ceiling-light',
                            lightIndex: lightsFound - 1
                        })

                        // Set to 0 initially
                        child.material.emissiveIntensity = 0
                    }
                }

                // Screens with ACSES texture
                const screenPatterns = ['screen', 'monitor', 'display', 'panel']

                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++

                    if (child.material) {
                        child.material = child.material.clone()

                        // Clone the texture and apply rotation/mirror
                        const rotatedTexture = acsesTexture.clone()
                        rotatedTexture.center.set(0.5, 0.5)
                        rotatedTexture.rotation = Math.PI / 2
                        rotatedTexture.repeat.set(-1, 1)
                        rotatedTexture.needsUpdate = true

                        child.material.map = rotatedTexture
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 10
                        child.material.emissiveMap = rotatedTexture.clone()
                        child.material.toneMapped = false
                        child.material.color = new THREE.Color('#000000')
                        child.material.needsUpdate = true

                        // Store for animation
                        screenList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 10
                        })

                        // Set to 0 initially
                        child.material.emissiveIntensity = 0
                    }
                }

                // Middle Cyan Base platform
                if (child.name === 'Middle_Cyan_Base' || meshNameLower.includes('middle_cyan_base')) {
                    baseFound = true

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 2
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        // Store for animation
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 2,
                            currentIntensity: 0,
                            type: 'base'
                        })

                        // Set to 0 initially
                        child.material.emissiveIntensity = 0
                    }
                }

                // Upper Black Base - subtle white glow
                if (child.name === 'Upper_Black_Base') {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ffffff')
                        child.material.emissiveIntensity = 0.003
                        child.material.toneMapped = false
                        child.material.needsUpdate = true
                    }
                }

                // Main Structure material - dark and moody
                if (child.material && child.material.name === 'Material.001') {
                    if (!mainStructureFixed) {
                        console.log(`✅ Main Structure material found`)
                        mainStructureFixed = true
                    }

                    child.material = child.material.clone()
                    child.material.metalness = 0.1
                    child.material.roughness = 0.6
                    child.material.color = new THREE.Color('#2a2a2a')
                    child.material.emissive = new THREE.Color('#0a0a0a')
                    child.material.emissiveIntensity = 0.15
                    child.material.needsUpdate = true
                }

                // Boost existing cyan emissive materials
                if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex()

                    if (emissiveHex === 0x00ffff) {
                        child.material = child.material.clone()
                        child.material.emissiveIntensity = 1.25
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        // Store for animation
                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.25,
                            currentIntensity: 0,
                            type: 'cyan-emissive'
                        })

                        // Set to 0 initially
                        child.material.emissiveIntensity = 0
                    }
                }
            }
        })

        setLightPositions(positions)
        emissiveMeshes.current = emissiveList
        screenMeshes.current = screenList

        // Create random activation schedule for lights (2-3 lights at random intervals)
        const schedule = []
        const lightIndices = emissiveList
            .map((item, index) => ({ index, type: item.type, lightIndex: item.lightIndex }))
            .filter(item => item.type === 'ceiling-light')

        // Shuffle and create activation times
        const shuffled = [...lightIndices].sort(() => Math.random() - 0.5)
        shuffled.forEach((item, i) => {
            schedule.push({
                index: item.index,
                lightIndex: item.lightIndex,
                activationTime: 0.2 + (i * 0.15) // Stagger by 0.15s each
            })
        })

        activationSchedule.current = schedule

        console.log(`✅ Teams Building setup complete`)
        console.log(`   - Ceiling lights: ${lightsFound}`)
        console.log(`   - Screens: ${screensFound}`)
        console.log(`   - Base platform: ${baseFound}`)
        console.log(`   - Animation schedule created: ${schedule.length} lights`)
    }, [clonedScene, acsesTexture])

    // System Initialize Animation
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime
        }

        const elapsed = state.clock.elapsedTime - animationStartTime.current

        if (animationPhase === 'boot') {
            // Phase 1: Brief blackout (0.3s)
            if (elapsed > 0.3) {
                console.log('💡 Starting random initialization...')
                setAnimationPhase('random-init')
            }
        }
        else if (animationPhase === 'random-init') {
            // Phase 2: Random lights turn on (0.3s - 2.0s)
            const initPhaseTime = elapsed - 0.3

            // Activate lights according to schedule
            activationSchedule.current.forEach(({ index, lightIndex, activationTime }) => {
                if (initPhaseTime >= activationTime) {
                    const light = emissiveMeshes.current[index]
                    if (light && light.mesh.material) {
                        // Quick flicker effect
                        const timeSinceActivation = initPhaseTime - activationTime
                        if (timeSinceActivation < 0.1) {
                            // Flicker
                            const flickerValue = Math.random() > 0.5 ? 1 : 0
                            light.mesh.material.emissiveIntensity = light.originalIntensity * flickerValue

                            // Sync pointLight with mesh flicker
                            if (lightRefs.current[lightIndex]) {
                                lightRefs.current[lightIndex].intensity = 100 * flickerValue
                            }
                        } else {
                            // Stay on
                            light.mesh.material.emissiveIntensity = light.originalIntensity

                            // PointLight stays on
                            if (lightRefs.current[lightIndex]) {
                                lightRefs.current[lightIndex].intensity = 60
                            }
                        }
                    }
                } else {
                    // Not activated yet - ensure it's off
                    if (lightRefs.current[lightIndex]) {
                        lightRefs.current[lightIndex].intensity = 0
                    }
                }
            })

            // Activate screens randomly during this phase
            if (initPhaseTime > 0.8 && initPhaseTime < 1.5) {
                screenMeshes.current.forEach((screen, index) => {
                    const activationTime = 0.8 + (index * 0.1)
                    if (initPhaseTime >= activationTime && initPhaseTime < activationTime + 0.05) {
                        // Quick flash
                        screen.mesh.material.emissiveIntensity = screen.originalIntensity
                    } else if (initPhaseTime >= activationTime + 0.05) {
                        screen.mesh.material.emissiveIntensity = screen.originalIntensity
                    } else {
                        screen.mesh.material.emissiveIntensity = 0
                    }
                })
            }

            if (initPhaseTime > 2.0) {
                console.log('🔄 Synchronizing all systems...')
                setAnimationPhase('sync')
            }
        }
        else if (animationPhase === 'sync') {
            // Phase 3: Everything pulses together once (2.0s - 2.5s)
            const syncTime = elapsed - 2.3
            const pulseDuration = 0.5

            if (syncTime < pulseDuration) {
                // Unified pulse: dim → bright → stable
                const pulseIntensity = Math.sin((syncTime / pulseDuration) * Math.PI) * 0.3 + 0.7

                // Apply to all emissive meshes
                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * pulseIntensity
                    }
                })

                // Apply to all point lights
                lightRefs.current.forEach((light) => {
                    if (light) {
                        light.intensity = 100 * pulseIntensity
                    }
                })

                // Apply to screens
                screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * pulseIntensity
                    }
                })
            } else {
                console.log('✨ Sync complete, finalizing...')
                setAnimationPhase('complete')
            }
        }
        else if (animationPhase === 'complete') {
            // Phase 4: Restore exact values
            console.log('🔧 Restoring exact values...')

            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.needsUpdate = true
                }
            })

            lightRefs.current.forEach((light) => {
                if (light) {
                    light.intensity = 100
                }
            })

            screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.needsUpdate = true
                }
            })

            console.log('🎉 System initialization complete!')
            setAnimationPhase('done')
        }
    })

    return (
        <>
            {/* Ceiling point lights - NOW ANIMATED WITH MESHES */}
            {lightPositions.map((light, index) => (
                <pointLight
                    key={`ceiling-light-${index}`}
                    ref={(el) => lightRefs.current[index] = el}
                    position={[
                        light.position.x,
                        light.position.y - 0.8,
                        light.position.z
                    ]}
                    intensity={0}  // Start at 0, animated in useFrame
                    color="#eeccff"
                    distance={30}
                    decay={1.8}
                    castShadow
                />
            ))}

            {/* Subtle ambient light */}
            <ambientLight intensity={0.15} color="#0a0a1a" />

            {/* Top fill light */}
            <pointLight
                position={[0, 50, 0]}
                intensity={15}
                color="#eeccff"
                distance={10}
                decay={2}
            />

            {/* The 3D Model */}
            <primitive
                ref={groupRef}
                object={clonedScene}
            />
        </>
    )
}

useGLTF.preload('/models/towerss.glb')
useTexture.preload('/images/ACSES_Image.jpg')