import React from 'react'

/**
 * Clickable Zone Component
 * Creates an invisible clickable/hoverable zone for interactions
 */
const ClickableZone = React.memo(
    React.forwardRef(({ position, size, onClick, onPointerMove, onPointerDown, debug, color = 'red' }, ref) => {
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
                    transparent={!debug}
                    opacity={debug ? 0 : 0}
                    depthWrite={false}
                    colorWrite={false}
                    color={color}
                />
            </mesh>
        )
    })
)

ClickableZone.displayName = 'ClickableZone'

export default ClickableZone
