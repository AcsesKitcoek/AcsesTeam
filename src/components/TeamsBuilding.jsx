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
        let mainStructureFixed = false
        const positions = []

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
                        name: child.name
                    })

                    if (child.material) {
                        child.material = child.material.clone()
                        child.material.emissive = new THREE.Color('#ffffff')
                        child.material.emissiveIntensity = 1
                        child.material.toneMapped = false
                        child.material.needsUpdate = true
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
                    }
                }
            }
        })

        setLightPositions(positions)

        // console.log(`✅ Teams Building setup complete`)
        // console.log(`   - Ceiling lights: ${lightsFound}`)
        // console.log(`   - Screens: ${screensFound}`)
        // console.log(`   - Base platform: ${baseFound}`)
    }, [clonedScene, acsesTexture])

    return (
        <>
            {/* Ceiling point lights - YOUR PERFECT VALUES */}
            {lightPositions.map((light, index) => (
                <pointLight
                    key={`ceiling-light-${index}`}
                    position={[
                        light.position.x,
                        light.position.y - 0.8,
                        light.position.z
                    ]}
                    intensity={100}
                    color="#ffffff"
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
                color="#ffffff"
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