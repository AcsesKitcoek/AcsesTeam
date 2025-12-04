import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLBCache } from '../hooks/useGLBCache'
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

    // Use GLB cache hook for optimized loading
    const { scene, loading, error } = useGLBCache('/models/contactUs.glb', '1.0.0')
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

    // Dramatic flicker animation (similar to MainCampus)
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime
        }

        const elapsed = state.clock.elapsedTime - animationStartTime.current

        if (animationPhase === 'blackout') {
            // Initial blackout phase
            if (elapsed > 0.8) {
                setAnimationPhase('flickering')
                setFlickerCount(0)
            }
        }
        else if (animationPhase === 'flickering') {
            // Flickering phase - similar to MainCampus
            const flickerDuration = 0.6
            const flickerPhase = (elapsed - 0.8) % flickerDuration
            const currentFlicker = Math.floor((elapsed - 0.8) / flickerDuration)
            const maxFlickers = 2  // Two flickers before stabilizing

            if (currentFlicker < maxFlickers) {
                let intensity = 0

                // Flicker pattern: on -> off -> quick on -> off
                if (flickerPhase < 0.15) {
                    intensity = 1
                } else if (flickerPhase < 0.45) {
                    intensity = 0
                } else if (flickerPhase < 0.5) {
                    intensity = 1
                } else {
                    intensity = 0
                }

                // Apply to all emissive meshes
                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * intensity
                    }
                })

                // Apply to top light
                if (topLightRef.current) {
                    const targetIntensity = isMobile ? 40 : 60
                    topLightRef.current.intensity = targetIntensity * intensity
                }

                // Screens flicker slightly delayed
                if (flickerPhase > 0.1) {
                    screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                        if (mesh.material) {
                            mesh.material.emissiveIntensity = originalIntensity * intensity
                        }
                    })
                }

                if (currentFlicker !== flickerCount) {
                    setFlickerCount(currentFlicker)
                }
            } else {
                setAnimationPhase('stabilizing')
            }
        }
        else if (animationPhase === 'stabilizing') {
            // Smooth transition to full brightness
            const stabilizeTime = elapsed - (0.8 + 0.6 * 2)
            const stabilizeDuration = 0.4

            if (stabilizeTime < stabilizeDuration) {
                const smoothIntensity = Math.min(1, stabilizeTime / stabilizeDuration)

                emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * smoothIntensity
                    }
                })

                if (topLightRef.current) {
                    const targetIntensity = isMobile ? 40 : 60
                    topLightRef.current.intensity = targetIntensity * smoothIntensity
                }

                screenMeshes.current.forEach(({ mesh, originalIntensity }) => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = originalIntensity * smoothIntensity
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
            // Subtle continuous flicker for realism (very subtle)
            const flickerNoise = Math.sin(state.clock.elapsedTime * 10) * 0.03 + 0.97

            if (topLightRef.current) {
                const targetIntensity = isMobile ? 40 : 50
                topLightRef.current.intensity = targetIntensity * flickerNoise
            }
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
