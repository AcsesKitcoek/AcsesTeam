import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDracoLoader } from '../hooks/useDracoLoader'
import { useMobileDetection } from '../hooks/useMobileDetection'
import ContactUsIndicator from '../components/scene/ContactUsIndicator'

export default function ContactUs({ onContactClick }) {
    const groupRef = useRef()
    const topLightRef = useRef()
    const emissiveMeshes = useRef([])
    const screenMeshes = useRef([])
    const animationStartTime = useRef(0)
    const [animationPhase, setAnimationPhase] = useState('blackout')
    const [flickerCount, setFlickerCount] = useState(0)
    const [laptopPositions, setLaptopPositions] = useState([])

    // Use Draco loader for compressed model loading
    const { scene, loading, error } = useDracoLoader('/models/contactUs.glb')
    const isMobile = useMobileDetection()

    // Memoize cloned scene to prevent re-cloning on every render
    const clonedScene = useMemo(() => {
        if (!scene) return null
        return scene.clone()
    }, [scene])

    // Setup: Configure materials and emissive lighting
    useEffect(() => {
        if (!clonedScene) return

        let topLightFound = false
        let screensFound = 0
        const emissiveList = []
        const screenList = []
        const laptopPosList = []

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !isMobile
                child.receiveShadow = !isMobile

                const meshNameLower = child.name.toLowerCase()

                // Detect Laptop meshes (Laptop1, Laptop2)
                if (child.name === 'Laptop1' || child.name === 'Laptop2' || meshNameLower.includes('laptop')) {
                    const worldPos = new THREE.Vector3()
                    child.getWorldPosition(worldPos)
                    laptopPosList.push({
                        name: child.name,
                        position: worldPos.clone()
                    })
                    console.log(`📍 Found laptop: ${child.name} at`, worldPos)
                }

                // Light_Top - Main ceiling light (flickering light source)
                if (child.name === 'Light_Top' || meshNameLower.includes('light_top')) {
                    topLightFound = true

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ffffff')
                        child.material.emissiveIntensity = 2.5
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 2.5,
                            currentIntensity: 0,
                            type: 'ceiling-light'
                        })

                        // Start with zero intensity for animation
                        child.material.emissiveIntensity = 0
                    }
                }

                // PC Screens/Monitors - cyan glow
                const screenPatterns = ['screen', 'monitor', 'display', 'pc']
                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#00e5ff')
                        child.material.emissiveIntensity = 1.8
                        child.material.toneMapped = false
                        child.material.color = new THREE.Color('#001a1f')
                        child.material.needsUpdate = true

                        screenList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.8
                        })

                        // Start with zero intensity for animation
                        child.material.emissiveIntensity = 0
                    }
                }

                // Tables - subtle purple-gray material
                if (meshNameLower.includes('table')) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.metalness = 0.4
                        child.material.roughness = 0.6
                        child.material.color = new THREE.Color('#3a3545')
                        child.material.needsUpdate = true
                    }
                }

                // Chairs - dark material
                if (meshNameLower.includes('chair')) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.metalness = 0.3
                        child.material.roughness = 0.7
                        child.material.color = new THREE.Color('#2a2535')
                        child.material.needsUpdate = true
                    }
                }

                // Walls - purple-gray theme
                if (meshNameLower.includes('wall')) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.color = new THREE.Color('#2a2040')
                        child.material.emissive = new THREE.Color('#1a1030')
                        child.material.emissiveIntensity = 0.2
                        child.material.needsUpdate = true
                    }
                }

                // Floor - dark base
                if (meshNameLower.includes('floor') || meshNameLower.includes('ground')) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.color = new THREE.Color('#1a1825')
                        child.material.metalness = 0.2
                        child.material.roughness = 0.8
                        child.material.needsUpdate = true
                    }
                }

                // Boost existing cyan emissive materials
                if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex()

                    if (emissiveHex === 0x00ffff || emissiveHex === 0x00e5ff) {
                        child.material = child.material.clone()
                        child.material.emissiveIntensity = 1.5
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        emissiveList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.5,
                            currentIntensity: 0,
                            type: 'cyan-emissive'
                        })

                        child.material.emissiveIntensity = 0
                    }
                }
            }
        })

        emissiveMeshes.current = emissiveList
        screenMeshes.current = screenList
        setLaptopPositions(laptopPosList)

        if (!topLightFound) {
            console.warn('⚠️ Light_Top not found in ContactUs model!')
        }

        console.log(`✅ ContactUs Setup: Found ${emissiveList.length} emissive meshes, ${screensFound} screens, ${laptopPosList.length} laptops`)
    }, [clonedScene, isMobile])

    // Smooth office-style power-on animation (professional and welcoming)
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime
        }

        const elapsed = state.clock.elapsedTime - animationStartTime.current

        if (animationPhase === 'blackout') {
            // Brief initial pause
            if (elapsed > 0.3) {
                setAnimationPhase('flickering')
            }
        }
        else if (animationPhase === 'flickering') {
            // Phase 1: Ceiling light powers on smoothly (0.3s - 1.2s)
            const phase1Start = 0.3
            const phase1Duration = 0.9
            const phase1Time = elapsed - phase1Start

            if (phase1Time >= 0 && phase1Time < phase1Duration) {
                // Smooth fade-in for ceiling light with slight warm-up effect
                const progress = phase1Time / phase1Duration
                const warmUpCurve = Math.pow(progress, 0.7) // Slightly faster at start

                // Ceiling light mesh
                emissiveMeshes.current.forEach(({ mesh, originalIntensity, type }) => {
                    if (type === 'ceiling-light' && mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * warmUpCurve
                    }
                })

                // Ceiling point light
                if (topLightRef.current) {
                    const targetIntensity = isMobile ? 40 : 50
                    topLightRef.current.intensity = targetIntensity * warmUpCurve
                }
            }

            // Phase 2: Screens boot up sequentially (1.2s - 2.5s)
            const phase2Start = 1.2
            const phase2Duration = 1.3
            const phase2Time = elapsed - phase2Start

            if (phase2Time >= 0) {
                screenMeshes.current.forEach(({ mesh, originalIntensity }, index) => {
                    if (mesh.material) {
                        // Stagger screen activation
                        const screenDelay = index * 0.15
                        const screenBootTime = phase2Time - screenDelay
                        const screenBootDuration = 0.4

                        if (screenBootTime >= 0 && screenBootTime < screenBootDuration) {
                            // Quick boot-up with slight flicker
                            const bootProgress = screenBootTime / screenBootDuration
                            const flicker = Math.random() > 0.7 ? 0.9 : 1.0 // Occasional flicker
                            mesh.material.emissiveIntensity = originalIntensity * bootProgress * flicker
                        } else if (screenBootTime >= screenBootDuration) {
                            // Fully on
                            mesh.material.emissiveIntensity = originalIntensity
                        }
                    }
                })
            }

            // Phase 3: Other emissive elements fade in (1.0s - 2.0s)
            const phase3Start = 1.0
            const phase3Duration = 1.0
            const phase3Time = elapsed - phase3Start

            if (phase3Time >= 0 && phase3Time < phase3Duration) {
                const fadeProgress = phase3Time / phase3Duration

                emissiveMeshes.current.forEach(({ mesh, originalIntensity, type }) => {
                    if (type === 'cyan-emissive' && mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * fadeProgress
                    }
                })
            }

            // Move to complete phase after all animations
            if (elapsed > 2.5) {
                setAnimationPhase('stabilizing')
            }
        }
        else if (animationPhase === 'stabilizing') {
            // Final stabilization (2.5s - 2.8s)
            const stabilizeTime = elapsed - 2.5
            const stabilizeDuration = 0.3

            if (stabilizeTime < stabilizeDuration) {
                // Ensure everything is at full brightness
                const finalProgress = Math.min(1, stabilizeTime / stabilizeDuration)

                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * finalProgress
                    }
                })

                if (topLightRef.current) {
                    const targetIntensity = isMobile ? 40 : 50
                    topLightRef.current.intensity = targetIntensity * finalProgress
                }

                screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * finalProgress
                    }
                })
            } else {
                setAnimationPhase('complete')
            }
        }
        else if (animationPhase === 'complete') {
            // Set final values
            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.needsUpdate = true
                }
            })

            if (topLightRef.current) {
                const targetIntensity = isMobile ? 40 : 50
                topLightRef.current.intensity = targetIntensity
            }

            screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.needsUpdate = true
                }
            })

            setAnimationPhase('done')
        }
        else if (animationPhase === 'done') {
            // Very subtle ambient flicker for the ceiling light (like real fluorescent/LED)
            const ambientFlicker = Math.sin(state.clock.elapsedTime * 8) * 0.02 + 0.98

            if (topLightRef.current) {
                const targetIntensity = isMobile ? 40 : 50
                topLightRef.current.intensity = targetIntensity * ambientFlicker
            }

            // Screens have stable glow (no flicker - they're digital)
            screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                }
            })
        }
    })

    // Show loading state
    if (loading || !clonedScene) {
        return null
    }

    // Show error state
    if (error) {
        console.error('Failed to load ContactUs model:', error)
        return null
    }

    return (
        <>
            {/* Main ceiling point light from Light_Top position */}
            <pointLight
                ref={topLightRef}
                position={[0, 8, 0]}  // Adjust based on actual Light_Top position
                intensity={isMobile ? 40 : 50}
                color="#ffffff"
                distance={25}
                decay={1.5}
                castShadow={!isMobile}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Ambient light - purple theme */}
            <ambientLight intensity={isMobile ? 0.25 : 0.2} color="#5540a0" />

            {/* Hemisphere light for subtle environmental lighting */}
            <hemisphereLight
                skyColor="#4060ff"
                groundColor="#2a1a3e"
                intensity={isMobile ? 0.3 : 0.25}
            />

            {/* Accent lights for cyan screens */}
            <pointLight
                position={[-3, 3, 2]}
                intensity={isMobile ? 4 : 6}
                color="#00e5ff"
                distance={8}
                decay={2}
            />
            <pointLight
                position={[3, 3, 2]}
                intensity={isMobile ? 4 : 6}
                color="#00e5ff"
                distance={8}
                decay={2}
            />

            {/* The 3D Model */}
            <primitive
                ref={groupRef}
                object={clonedScene}
            />

            {/* Contact Us Indicator above laptops */}
            {laptopPositions.length > 0 && (() => {
                // Calculate center position between laptops
                const centerPos = laptopPositions.reduce((acc, laptop) => {
                    acc.x += laptop.position.x
                    acc.y += laptop.position.y
                    acc.z += laptop.position.z
                    return acc
                }, { x: 0, y: 0, z: 0 })

                centerPos.x /= laptopPositions.length
                centerPos.y /= laptopPositions.length
                centerPos.z /= laptopPositions.length

                // Position indicator above the laptops
                const indicatorPosition = [
                    centerPos.x,
                    centerPos.y + 1.25,  // Hover 1.2 units above
                    centerPos.z + 0.15
                ]

                return (
                    <ContactUsIndicator
                        position={indicatorPosition}
                        onClick={onContactClick}
                        scale={6}
                    />
                )
            })()}
        </>
    )
}
