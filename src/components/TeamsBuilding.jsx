import React, { useRef, useEffect, useState } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function TeamsBuilding() {
    const groupRef = useRef()
    const [lightPositions, setLightPositions] = useState([])

    const { scene } = useGLTF('/models/towerss.glb')
    const acsesTexture = useTexture('/images/ACSES_Image.jpg')

    const clonedScene = React.useMemo(() => scene.clone(), [scene])

    // Setup: Configure materials and emissive lighting
    useEffect(() => {
        console.log('Setting up Teams Building scene...')

        let lightsFound = 0
        let screensFound = 0
        let baseFound = false
        const positions = []

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true

                // Log all mesh names for debugging
                console.log(`Mesh found: ${child.name}`)

                // Ceiling lights - pattern: Light_11, Light_12, Light_21, etc. (capital L)
                // These should glow white/bright and emit light
                if (child.name.startsWith('Light_')) {
                    lightsFound++
                    console.log(`✅ Ceiling light found: ${child.name}`)

                    // Get world position for point light
                    const worldPos = new THREE.Vector3()
                    child.getWorldPosition(worldPos)
                    positions.push({
                        position: worldPos.clone(),
                        name: child.name
                    })

                    // Clone material for unique emissive properties
                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ffffff')
                        child.material.emissiveIntensity = 2
                        child.material.toneMapped = false
                        child.material.needsUpdate = true
                    }
                }

                // Screens - look for screen/monitor meshes
                // Apply ACSES image texture instead of just cyan glow
                const screenPatterns = ['screen', 'monitor', 'display', 'panel']
                const meshNameLower = child.name.toLowerCase()

                if (screenPatterns.some(pattern => meshNameLower.includes(pattern))) {
                    screensFound++
                    console.log(`✅ Screen found: ${child.name}`)

                    if (child.material) {
                        child.material = child.material.clone()

                        // Apply ACSES image as texture with more glow
                        child.material.map = acsesTexture
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 5
                        child.material.emissiveMap = acsesTexture
                        child.material.toneMapped = false
                        child.material.needsUpdate = true
                    }
                }

                // Base platform - specifically named 'Middle_Cyan_Base'
                if (child.name === 'Middle_Cyan_Base' || meshNameLower.includes('middle_cyan_base')) {
                    baseFound = true
                    console.log(`✅ Base platform found: ${child.name}`)

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#00ffff')
                        child.material.emissiveIntensity = 100
                        child.material.needsUpdate = true
                    }
                }

                // Main_Structure - make it highly receptive to light
                // So it glows/illuminates when ceiling lights shine on it
                if (child.name === 'Main_Structure' || meshNameLower.includes('main_structure')) {
                    console.log(`✅ Main Structure found: ${child.name}`)

                    if (child.material) {
                        child.material = child.material.clone()
                        // Make it more reflective and receptive to light
                        child.material.metalness = 0.3
                        child.material.roughness = 0.4
                        child.material.envMapIntensity = 1.5
                        // Add slight emissive to make it glow
                        child.material.emissive = new THREE.Color('#ffffff')
                        child.material.emissiveIntensity = 0.1
                        child.material.needsUpdate = true
                    }
                }

                // Check for existing emissive materials (from Blender)
                if (child.material && child.material.emissive) {
                    const emissiveHex = child.material.emissive.getHex()

                    // If it has cyan emissive (0x00ffff), boost it
                    if (emissiveHex === 0x00ffff) {
                        child.material = child.material.clone()
                        child.material.emissiveIntensity = 5
                        child.material.toneMapped = false
                        console.log(`Boosted cyan emissive for: ${child.name}`)
                    }
                }
            }
        })

        setLightPositions(positions)

        console.log(`✅ Teams Building setup complete`)
        console.log(`   - Ceiling lights found: ${lightsFound}`)
        console.log(`   - Screens found: ${screensFound}`)
        console.log(`   - Base platform found: ${baseFound}`)
    }, [clonedScene, acsesTexture])

    return (
        <>
            {/* Point lights for ceiling lights - emit actual light */}
            {lightPositions.map((light, index) => (
                <pointLight
                    key={`ceiling-light-${index}`}
                    position={[
                        light.position.x,
                        light.position.y - 0.5,  // Slightly below the light mesh
                        light.position.z
                    ]}
                    intensity={8}
                    color="#ffffff"
                    distance={10}
                    decay={2}
                />
            ))}

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