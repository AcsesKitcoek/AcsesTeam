import React from 'react'

/**
 * Clickable Zone Component
 * Creates an invisible clickable/hoverable zone for interactions
 */
const ClickableZone = React.memo(
    React.forwardRef(({ position, size, onClick, onPointerMove, onPointerDown, onPointerEnter, onPointerLeave, debug, color = 'red' }, ref) => {
        return (
            <mesh
                ref={ref}
                position={position}
                onPointerMove={onPointerMove}
                onClick={onClick}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            >
                <boxGeometry args={size} />
                <meshBasicMaterial
                    transparent={!debug}
                    opacity={debug ? 0.3 : 0}
                    depthWrite={false}
                    colorWrite={debug}
                    color={color}
                />
            </mesh>
        )
    })
)

ClickableZone.displayName = 'ClickableZone'

export default ClickableZone
