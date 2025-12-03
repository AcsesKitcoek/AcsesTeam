import { useThree, useFrame } from '@react-three/fiber'
import { useCallback } from 'react'

/**
 * Camera Tracker Component
 * Tracks camera position and distance, calls onUpdate callback
 */
export default function CameraTracker({ onUpdate }) {
    const { camera } = useThree()

    const handleUpdate = useCallback(() => {
        onUpdate(
            {
                x: camera.position.x.toFixed(2),
                y: camera.position.y.toFixed(2),
                z: camera.position.z.toFixed(2)
            },
            camera.position.length().toFixed(2)
        )
    }, [camera, onUpdate])

    useFrame(handleUpdate)

    return null
}
