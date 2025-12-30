import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useDracoLoader } from '../hooks/useDracoLoader'
import { useMobileDetection } from '../hooks/useMobileDetection'


export default function EventGallery() {
    const groupRef = useRef()
    const { camera, raycaster, gl } = useThree()

    // Use Draco loader for compressed model loading
    const { scene, loading, error } = useDracoLoader('/models/event-gallery.glb')
    const acsesTexture = useTexture('/images/ACSES_Image.jpg')
    const isMobile = useMobileDetection()

    const [hoveredFrame, setHoveredFrame] = useState(null)
    const [animationPhase, setAnimationPhase] = useState('blackout')

    const mouse = useRef(new THREE.Vector2())
    const emissiveMeshes = useRef([])
    const imagePlaneMeshes = useRef([])  // Separate ref for image planes
    const animationStartTime = useRef(0)

    // Memoize cloned scene to prevent re-cloning on every render
    const clonedScene = useMemo(() => {
        if (!scene) return null
        return scene.clone()
    }, [scene])

    // Setup: Find emissive meshes and make frames interactive
    useEffect(() => {
        if (!clonedScene) return

        const emissiveMeshesList = []
        let platformFound = false

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !isMobile
                child.receiveShadow = !isMobile

                // Platform with cyan glow
                if (child.name === 'Platform' || child.name === 'platform' || child.name === 'Base_Platform') {
                    platformFound = true

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#00e5ff')
                        child.material.emissiveIntensity = 2.5
                        child.material.color = new THREE.Color('#00ffff')
                        child.material.toneMapped = false
                        child.material.transparent = true
                        child.material.opacity = 0.9
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: 'Platform',
                            originalIntensity: 2.5,
                            originalEmissive: new THREE.Color('#00e5ff'),
                            originalToneMapped: false
                        })
                    }
                }
                // Neon lights on walls
                else if (child.name.includes('Light') || child.name.includes('Neon') || child.name.includes('Strip')) {
                    if (child.material) {
                        child.material = child.material.clone()

                        // Check if it's pink/purple or cyan
                        const materialColor = child.material.color || child.material.emissive
                        const isWarm = materialColor && (materialColor.r > materialColor.b)

                        if (isWarm) {
                            // Pink/Purple neon
                            child.material.emissive = new THREE.Color('#ff00ff')
                            child.material.emissiveIntensity = 3.5
                            child.material.color = new THREE.Color('#ff00ff')
                        } else {
                            // Cyan neon
                            child.material.emissive = new THREE.Color('#00e5ff')
                            child.material.emissiveIntensity = 2.0
                            child.material.color = new THREE.Color('#00ffff')
                        }

                        child.material.toneMapped = false
                        child.material.transparent = true
                        child.material.opacity = 0.95
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: isWarm ? 3.5 : 2.0,
                            originalEmissive: child.material.emissive.clone(),
                            originalToneMapped: false
                        })
                    }
                }
                // Image Cases - Purple/Magenta glow for frames - INCREASED FOR BLOOM
                else if (child.name.match(/^Image_Case_[1-8]$/)) {
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ff00ff')
                        child.material.emissiveIntensity = 1.0  // Increased from 1.5 for better bloom
                        child.material.color = new THREE.Color('#ff00ff')  // Brighter color
                        child.material.toneMapped = false  // Important for bloom
                        child.material.metalness = 0.1
                        child.material.roughness = 1
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 4.0,  // Increased from 1.5
                            originalEmissive: new THREE.Color('#ff00ff'),
                            originalToneMapped: false
                        })
                    }
                }
                // Image Planes - ACSES texture (handled in main animation)
                else if (child.name.match(/^Image_Plane_[1-8]$/)) {
                    if (child.material) {
                        child.material = child.material.clone()

                        // Apply ACSES texture with rotation
                        const rotatedTexture = acsesTexture.clone()
                        rotatedTexture.center.set(0.5, 0.5)
                        rotatedTexture.rotation = -Math.PI * 2
                        rotatedTexture.repeat.set(-1, 1)
                        rotatedTexture.needsUpdate = true

                        child.material.map = rotatedTexture
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 0
                        child.material.emissiveMap = rotatedTexture.clone()
                        child.material.toneMapped = false
                        child.material.color = new THREE.Color('#ffffff')
                        child.material.needsUpdate = true

                        // Make clickable
                        child.userData.clickable = true
                        child.userData.frameName = child.name
                        child.userData.originalEmissive = new THREE.Color('#00ffff')
                        child.userData.originalIntensity = 0.6

                        imagePlaneMeshes.current.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 0.6,
                            originalEmissive: new THREE.Color('#00ffff')
                        })
                    }
                }
                // Photo frames - make them interactive (but skip Image_Plane meshes)
                else if (!child.name.match(/^Image_Plane_[1-8]$/) &&
                    (child.name.includes('Frame') || child.name.includes('Photo') || child.name.includes('Picture'))) {
                    child.userData.clickable = true
                    child.userData.frameName = child.name
                    child.userData.originalEmissive = child.material?.emissive?.clone()
                    child.userData.originalIntensity = child.material?.emissiveIntensity || 0

                    // Add subtle glow to frames
                    if (child.material) {
                        child.material = child.material.clone()
                        if (!child.material.emissive) {
                            child.material.emissive = new THREE.Color('#ffffff')
                        }
                        child.material.emissiveIntensity = 0.1
                        child.material.needsUpdate = true
                    }
                }
                // Handle other emissive materials
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
                        child.material.emissiveIntensity = 3.5
                        child.material.toneMapped = false
                        child.material.needsUpdate = true

                        emissiveMeshesList.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 3.5,
                            originalEmissive: child.material.emissive.clone(),
                            originalToneMapped: false
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
            console.warn('⚠️ Platform not found in Gallery model!')
        }

        console.log(`✅ Gallery setup complete: ${emissiveMeshesList.length} emissive meshes found`)
    }, [clonedScene, isMobile, acsesTexture])

    // Radial Expand animation
    useFrame((state) => {
        if (!animationStartTime.current) {
            animationStartTime.current = state.clock.elapsedTime
        }

        const elapsed = state.clock.elapsedTime - animationStartTime.current

        if (animationPhase === 'blackout') {
            if (elapsed > 0.5) {
                setAnimationPhase('radial-expand')
            }
        }
        else if (animationPhase === 'radial-expand') {
            const duration = 2.5
            const progress = Math.min((elapsed - 0.5) / duration, 1)

            const expandRadius = progress * 30 // Max distance from center (adjust based on your scene size)

            emissiveMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material) {
                    const worldPos = new THREE.Vector3()
                    mesh.getWorldPosition(worldPos)

                    // Distance from scene center (0, 0, 0) - adjust if your platform is at different position
                    const distanceFromCenter = new THREE.Vector2(worldPos.x, worldPos.z).length()

                    let intensity = 0
                    if (distanceFromCenter < expandRadius) {
                        // Smooth wave effect - lights turn on as wave passes
                        const waveWidth = 5 // Width of the activation wave
                        const distanceFromWaveFront = expandRadius - distanceFromCenter

                        if (distanceFromWaveFront < waveWidth) {
                            // In the wave - fade in
                            intensity = 1 - (distanceFromWaveFront / waveWidth)
                        } else {
                            // Already passed - stay on
                            intensity = 1
                        }
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

            // Set image planes to their original intensity
            imagePlaneMeshes.current.forEach(({ mesh, originalIntensity, originalEmissive }) => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = originalIntensity
                    mesh.material.emissive.copy(originalEmissive)
                    mesh.material.needsUpdate = true
                }
            })

            setAnimationPhase('done')
        }

        // Maintain image plane intensity when done
        if (animationPhase === 'done') {
            imagePlaneMeshes.current.forEach(({ mesh, originalIntensity }) => {
                if (mesh.material && !hoveredFrame) {
                    mesh.material.emissiveIntensity = originalIntensity
                }
            })
        }

        // Hover glow effect for frames (desktop only)
        if (hoveredFrame && animationPhase === 'done' && !isMobile) {
            if (hoveredFrame.material) {
                const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.5
                hoveredFrame.material.emissiveIntensity = pulseIntensity
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
        if (hoveredFrame && hoveredFrame.material) {
            hoveredFrame.material.emissiveIntensity = hoveredFrame.userData.originalIntensity || 0.1
        }

        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object

            let clickableObject = firstIntersect
            while (clickableObject && !clickableObject.userData.clickable) {
                clickableObject = clickableObject.parent
            }

            if (clickableObject && clickableObject.userData.clickable) {
                setHoveredFrame(clickableObject)
                gl.domElement.style.cursor = 'pointer'
                return
            }
        }

        setHoveredFrame(null)
        gl.domElement.style.cursor = 'default'
    }, [animationPhase, isMobile, clonedScene, gl, raycaster, camera, hoveredFrame])

    // Click handler for frames
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
                const { frameName } = clickableObject.userData
                console.log(`📸 Clicked on frame: ${frameName}`)
                // TODO: Open modal or lightbox with full image
            }
        }
    }, [animationPhase, clonedScene, gl, raycaster, camera])

    // Show loading state
    if (loading || !clonedScene) {
        return null
    }

    // Show error state
    if (error) {
        console.error('Failed to load EventGallery model:', error)
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
