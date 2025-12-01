import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function TeamsBuilding() {
    const groupRef = useRef()

    const { scene } = useGLTF('/models/towerss.glb')

    const clonedScene = React.useMemo(() => scene.clone(), [scene])

    // Setup: Configure materials and log mesh names for debugging
    useEffect(() => {
        console.log('Setting up Teams Building scene...')

        let lightsFound = 0
        let screensFound = 0
        let baseFound = false

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true

                // Log all mesh names for debugging
                console.log(`Mesh found: ${child.name}`)

                // Ceiling lights - pattern: light_11, light_12, light_21, etc.
                if (child.name.startsWith('light_')) {
                    lightsFound++
                    console.log(`✅ Ceiling light found: ${child.name}`)

                    // Will configure emissive materials in next phase
                    // For now, just log them
                }

                // Screens - need to identify the naming pattern
                // Will configure based on actual mesh names

                // Base platform - need to identify the naming pattern
                // Will configure based on actual mesh names
            }
        })

        console.log(`✅ Teams Building setup complete`)
        console.log(`   - Ceiling lights found: ${lightsFound}`)
        console.log(`   - Screens found: ${screensFound}`)
        console.log(`   - Base platform found: ${baseFound}`)
    }, [clonedScene])

    return (
        <>
            {/* The 3D Model */}
            <primitive
                ref={groupRef}
                object={clonedScene}
            />
        </>
    )
}

useGLTF.preload('/models/towerss.glb')
