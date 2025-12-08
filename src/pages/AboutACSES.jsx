import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useGLBCache } from '../hooks/useGLBCache'
import { useMobileDetection } from '../hooks/useMobileDetection'


export default function AboutACSES() {
    const groupRef = useRef()
    const { camera, raycaster, gl } = useThree()

    // Use GLB cache hook for optimized loading
    const { scene, loading, error } = useGLBCache('/models/about-acses.glb', '1.0.0')
    const isMobile = useMobileDetection()

    const [hoveredScreen, setHoveredScreen] = useState(null)
    const [animationPhase, setAnimationPhase] = useState('blackout')

    const mouse = useRef(new THREE.Vector2())
    const emissiveMeshes = useRef([])
    const screenPlaneMeshes = useRef([])  // Separate ref for screen planes
    const animationStartTime = useRef(0)

    // Memoize cloned scene to prevent re-cloning on every render
    const clonedScene = useMemo(() => {
        if (!scene) return null
        return scene.clone()
    }, [scene])

    // Setup: Find emissive meshes and make screens interactive
    useEffect(() => {
        if (!clonedScene) return

        const emissiveMeshesList = []
        let platformFound = false

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !isMobile
                child.receiveShadow = !isMobile

                // Floor platform - Dark base (no glow)
                if (child.name === 'Floor_Base') {
                    platformFound = true

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.color = new THREE.Color('#1a1a2e')
                        child.material.emissive = new THREE.Color('#000000')
                        child.material.emissiveIntensity = 0
                        child.material.toneMapped = true
                        child.material.metalness = 0.3
                        child.material.roughness = 0.7
                        child.material.needsUpdate = true
                    }
                }
                // Ceiling lights - Purple/Magenta
                else if (child.name.match(/^Ceiling_Light_[1-2]$/) || child.name.match(/^Ceiling_Light_Base_[1-2]$/)) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ff00ff')
                        child.material.emissiveIntensity = 3.5
                        child.material.color = new THREE.Color('#ff00ff')
                        child.material.toneMapped = false
                        child.material.transparent = true
                        child.material.opacity = 0.95
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 3.5,
                            originalEmissive: new THREE.Color('#ff00ff'),
                            originalToneMapped: false
                        })
                    }
                }
                // Cyan lights on platform - REDUCED FOR LESS BLOOM
                else if (child.name.match(/^Cyan_Light_[1-2]$/) || child.name === 'Cyan_Light_Base' || child.name === 'Cyan_Light_Cylinder') {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#00e5ff')
                        child.material.emissiveIntensity = 1.2
                        child.material.color = new THREE.Color('#00ffff')
                        child.material.toneMapped = false
                        child.material.transparent = true
                        child.material.opacity = 0.95
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 1.2,
                            originalEmissive: new THREE.Color('#00e5ff'),
                            originalToneMapped: false
                        })
                    }
                }
                // Screen Cases/Frames - Purple/Magenta glow for bloom - Case_About, Case_Sponsors, Case_Vision
                else if (child.name === 'Case_About' || child.name === 'Case_Sponsors' || child.name === 'Case_Vision') {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ff00ff')
                        child.material.emissiveIntensity = 4.0
                        child.material.color = new THREE.Color('#ff00ff')
                        child.material.toneMapped = false
                        child.material.metalness = 0.1
                        child.material.roughness = 1
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 4.0,
                            originalEmissive: new THREE.Color('#ff00ff'),
                            originalToneMapped: false
                        })
                    }
                }
                // Screen Planes - Black background for text display - Plane_About, Plane_Sponsors, Plane_Vision
                else if (child.name === 'Plane_About' || child.name === 'Plane_Sponsors' || child.name === 'Plane_Vision') {
                    if (child.material) {
                        child.material = child.material.clone()

                        // Set up material for black background with no emissive
                        child.material.color = new THREE.Color('#000000')
                        child.material.emissive = new THREE.Color('#000000')
                        child.material.emissiveIntensity = 0
                        child.material.toneMapped = true
                        child.material.metalness = 0
                        child.material.roughness = 1
                        child.material.needsUpdate = true

                        // Make clickable
                        child.userData.clickable = true
                        child.userData.screenName = child.name
                        child.userData.originalEmissive = new THREE.Color('#000000')
                        child.userData.originalIntensity = 0

                        screenPlaneMeshes.current.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 0,
                            originalEmissive: new THREE.Color('#000000')
                        })
                    }
                }
            }
        })

        emissiveMeshes.current = emissiveMeshesList

        // Set all lights to zero initially
        emissiveMeshesList.forEach(({ mesh }) => {
            if (mesh.material) {
                mesh.material.emissiveIntensity = 0
            }
        })

        if (!platformFound) {
            console.warn('⚠️ Platform not found in About ACSES model!')
        }

        console.log(`✅ About ACSES setup complete: ${emissiveMeshesList.length} emissive meshes, ${screenPlaneMeshes.current.length} screen planes found`)
    }, [clonedScene, isMobile])

    // Wave Sweep animation
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime
        }

        const elapsed = state.clock.elapsedTime - animationStartTime.current

        if (animationPhase === 'blackout') {
            if (elapsed > 0.5) {
                setAnimationPhase('wave-sweep')
            }
        }
        else if (animationPhase === 'wave-sweep') {
            const duration = 2.5
            const progress = Math.min((elapsed - 0.5) / duration, 1)

            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    // Get mesh world position
                    const worldPos = new THREE.Vector3()
                    mesh.getWorldPosition(worldPos)

                    // Wave travels along X axis from left to right
                    const wavePosition = (progress * 40) - 20 // Adjust range based on your scene size
                    const distance = Math.abs(worldPos.x - wavePosition)

                    // Lights turn on when wave reaches them
                    let intensity = 0
                    if (distance < 5) {
                        // Smooth fade-in within wave radius
                        intensity = 1 - (distance / 5)
                    } else if (worldPos.x < wavePosition) {
                        // Already passed - stay on
                        intensity = 1
                    }

                    mesh.material.emissiveIntensity = originalIntensity * intensity
                }
            })

            if (progress >= 1) {
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

            // Set screen planes to their original intensity
            screenPlaneMeshes.current.forEach(({ mesh, originalIntensity, originalEmissive }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.emissive.copy(originalEmissive)
                    mesh.material.needsUpdate = true
                }
            })

            setAnimationPhase('done')
        }

        // Maintain screen plane intensity when done
        if (animationPhase === 'done') {
            screenPlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material && !hoveredScreen) {
                    mesh.material.emissiveIntensity = originalIntensity
                }
            })
        }

        // Hover glow effect for screens (desktop only)
        if (hoveredScreen && animationPhase === 'done' && !isMobile) {
            if (hoveredScreen.material) {
                const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.5
                hoveredScreen.material.emissiveIntensity = pulseIntensity
            }
        }
    })

    // Pointer move handler for hover effects
    const handlePointerMove = useCallback((event) => {
        if (animationPhase !== 'done') return
        if (isMobile) return  // Disable hover on mobile
        if (!clonedScene) return

        const rect = gl.domElement.getBoundingClientRect()

        let clientX, clientY
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
        } else {
            clientX = event.clientX
            clientY = event.clientY
        }

        mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse.current, camera)
        const intersects = raycaster.intersectObject(clonedScene, true)

        // Reset previous hover
        if (hoveredScreen && hoveredScreen.material) {
            hoveredScreen.material.emissiveIntensity = hoveredScreen.userData.originalIntensity || 0.1
        }

        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object

            let clickableObject = firstIntersect
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent
            }

            if (clickableObject && clickableObject.userData.clickable) {
                setHoveredScreen(clickableObject)
                gl.domElement.style.cursor = 'pointer'
                return
            }
        }

        setHoveredScreen(null)
        gl.domElement.style.cursor = 'default'
    }, [animationPhase, isMobile, clonedScene, gl, raycaster, camera, hoveredScreen])

    // Click handler for screens
    const handleClick = useCallback((event) => {
        if (animationPhase !== 'done') return
        if (!clonedScene) return

        const rect = gl.domElement.getBoundingClientRect()

        let clientX, clientY
        if (event.changedTouches && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX
            clientY = event.changedTouches[0].clientY
        } else if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
        } else {
            clientX = event.clientX
            clientY = event.clientY
        }

        mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse.current, camera)
        const intersects = raycaster.intersectObject(clonedScene, true)

        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object

            let clickableObject = firstIntersect
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent
            }

            if (clickableObject && clickableObject.userData.clickable) {
                const { screenName } = clickableObject.userData
                console.log(`🖥️ Clicked on screen: ${screenName}`)
                // TODO: Open modal with screen content
            }
        }
    }, [animationPhase, clonedScene, gl, raycaster, camera])

    // Show loading state
    if (loading || !clonedScene) {
        return null
    }

    // Show error state
    if (error) {
        console.error('Failed to load About ACSES model:', error)
        return null
    }

    return (
        <>
            {/* The 3D Model - Touch and mouse events */}
            <primitive
                ref={groupRef}
                object={clonedScene}
                onPointerMove={handlePointerMove}
                onClick={handleClick}
                onPointerUp={isMobile ? handleClick : undefined}
                onTouchEnd={isMobile ? (e) => {
                    e.preventDefault()
                    handleClick(e)
                } : undefined}
            />
        </>
    )
}
