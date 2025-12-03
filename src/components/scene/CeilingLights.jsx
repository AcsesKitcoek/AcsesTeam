import React from 'react'

/**
 * Ceiling Lights Component
 * Renders array of point lights for TeamsBuilding ceiling
 */
const CeilingLights = React.memo(({ lightPositions, lightRefs, isMobile }) => {
    return (
        <>
            {lightPositions.map((light, index) => (
                <pointLight
                    key={`ceiling-light-${index}`}
                    ref={(el) => (lightRefs.current[index] = el)}
                    position={[
                        light.position.x,
                        light.position.y - 0.8,
                        light.position.z
                    ]}
                    intensity={0}
                    color="#eeccff"
                    distance={isMobile ? 25 : 30}
                    decay={1.8}
                    castShadow={!isMobile}
                />
            ))}
        </>
    )
})

CeilingLights.displayName = 'CeilingLights'

export default CeilingLights
