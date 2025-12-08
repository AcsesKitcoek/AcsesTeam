import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GalleryImagePlanes Component
 * Handles all Image_Plane meshes with ACSES texture and unique hover effects
 */
const GalleryImagePlanes = React.memo(({
    clonedScene,
    acsesTexture,
    hoveredFrame,
    animationPhase,
    isMobile
}) => {
    const imagePlaneRefs = useRef([])

    // Apply unique hover effects per frame
    useFrame((state) => {
        imagePlaneRefs.current.forEach((planeData, index) => {
            if (!planeData || !planeData.mesh) return

            const isHovered = hoveredFrame === planeData.mesh
            const time = state.clock.elapsedTime

            // Always ensure emissive intensity is set (fixes blank screen issue)
            if (animationPhase === 'done') {
                if (isHovered && !isMobile) {
                    // Unique hover effect based on index
                    switch (index % 4) {
                        case 0: // Pulsing glow
                            const pulse = Math.sin(time * 6) * 0.5 + 1.5
                            planeData.mesh.material.emissiveIntensity = pulse
                            break

                        case 1: // Color shift
                            const hue = (Math.sin(time * 3) + 1) * 0.5
                            planeData.mesh.material.emissive.setHSL(hue, 0.8, 0.5)
                            planeData.mesh.material.emissiveIntensity = 1.2
                            break

                        case 2: // Breathing effect
                            const breathe = Math.sin(time * 4) * 0.3 + 1.0
                            planeData.mesh.scale.setScalar(breathe)
                            planeData.mesh.material.emissiveIntensity = 1.0
                            break

                        case 3: // Ripple effect
                            const ripple = Math.sin(time * 8) * 0.4 + 1.3
                            planeData.mesh.material.emissiveIntensity = ripple
                            planeData.mesh.rotation.z = Math.sin(time * 2) * 0.05
                            break

                        default:
                            planeData.mesh.material.emissiveIntensity = 1.0
                    }
                } else {
                    // Reset to default state - ALWAYS maintain emissive intensity
                    planeData.mesh.material.emissiveIntensity = planeData.originalIntensity || 0.8
                    planeData.mesh.scale.setScalar(1)
                    planeData.mesh.rotation.z = 0
                    if (planeData.originalEmissive) {
                        planeData.mesh.material.emissive.copy(planeData.originalEmissive)
                    }
                }
            }
        })
    })

    // Setup image planes on mount
    React.useEffect(() => {
        if (!clonedScene || !acsesTexture) return

        const planes = []
        let planesFound = 0

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                // Match Image_Plane_1 through Image_Plane_8
                if (child.name.match(/^Image_Plane_[1-8]$/)) {
                    planesFound++

                    if (child.material) {
                        child.material = child.material.clone()

                        // Apply ACSES texture
                        child.material.map = acsesTexture
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 0.8  // Increased from 0.5
                        child.material.emissiveMap = acsesTexture.clone()
                        child.material.toneMapped = false
                        child.material.color = new THREE.Color('#ffffff')
                        child.material.needsUpdate = true

                        // Make clickable
                        child.userData.clickable = true
                        child.userData.frameName = child.name
                        child.userData.originalEmissive = new THREE.Color('#00ffff')
                        child.userData.originalIntensity = 0.8  // Increased from 0.5

                        planes.push({
                            mesh: child,
                            name: child.name,
                            originalIntensity: 0.8,  // Increased from 0.5
                            originalEmissive: new THREE.Color('#00ffff')
                        })
                    }
                }
            }
        })

        imagePlaneRefs.current = planes
        console.log(`✅ Found ${planesFound} image planes`)
    }, [clonedScene, acsesTexture])

    return null
})

GalleryImagePlanes.displayName = 'GalleryImagePlanes'

export default GalleryImagePlanes
