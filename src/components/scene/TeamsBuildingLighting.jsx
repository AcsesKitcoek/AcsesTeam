import React from 'react'

/**
 * Teams Building Lighting Component
 * Configures ambient and fill lighting for the TeamsBuilding scene
 */
const TeamsBuildingLighting = React.memo(({ isMobile }) => {
    return (
        <>
            {/* Ambient light */}
            <ambientLight intensity={isMobile ? 0.2 : 0.1} color="#0a0a1a" />

            {/* Fill light */}
            <directionalLight
                position={[10, 20, 10]}
                intensity={isMobile ? 0.5 : 0.3}
                color="#ffffff"
            />
        </>
    )
})

TeamsBuildingLighting.displayName = 'TeamsBuildingLighting'

export default TeamsBuildingLighting
