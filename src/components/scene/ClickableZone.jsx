import React from 'react'

/**
 * Clickable Zone Component
 * Creates an invisible clickable/hoverable zone for interactions
 */
const ClickableZone = React.memo(
    React.forwardRef(({ position, size, onClick, onPointerMove, onPointerDown }, ref) => {
        return (
            <mesh
                ref={ref}
                position={position}
                onPointerMove={onPointerMove}
                onClick={onClick}
                onPointerDown={onPointerDown}
            >
                <boxGeometry args={size} />
                <meshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                    colorWrite={false}
                />
            </mesh>
        )
    })
)

ClickableZone.displayName = 'ClickableZone'

export default ClickableZone
