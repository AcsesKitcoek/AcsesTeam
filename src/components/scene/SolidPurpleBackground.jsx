import React from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Solid Purple Background Component
 * Sets the scene background to match the floor plane
 */
const SolidPurpleBackground = React.memo(() => {
    const { scene } = useThree()

    React.useEffect(() => {
        scene.background = new THREE.Color('#0a0514')
    }, [scene])

    return null
})

SolidPurpleBackground.displayName = 'SolidPurpleBackground'

export default SolidPurpleBackground
