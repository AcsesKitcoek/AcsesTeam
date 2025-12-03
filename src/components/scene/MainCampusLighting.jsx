import React from 'react'

/**
 * Main Campus Lighting Component
 * Configures all lights for the MainCampus scene
 */
const MainCampusLighting = React.memo(({ isMobile }) => {
    return (
        <>
            {/* Ambient light */}
            <ambientLight intensity={isMobile ? 1.4 : 1.2} color="#6080a0" />

            {/* Hemisphere light */}
            <hemisphereLight
                skyColor="#4060ff"
                groundColor="#2a1a3e"
                intensity={isMobile ? 1.0 : 0.8}
            />

            {/* Main directional light with shadows */}
            <directionalLight
                position={[15, 25, 15]}
                intensity={isMobile ? 1.5 : 2.0}
                castShadow={!isMobile}
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
                shadow-camera-near={0.5}
                shadow-camera-far={100}
                shadow-bias={-0.0001}
            />

            {/* Point lights for accent lighting */}
            <pointLight
                position={[-15, 15, 10]}
                intensity={isMobile ? 6 : 8}
                color="#4080ff"
                castShadow={!isMobile}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight
                position={[15, 12, -10]}
                intensity={isMobile ? 4 : 6}
                color="#8060ff"
                castShadow={!isMobile}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
        </>
    )
})

MainCampusLighting.displayName = 'MainCampusLighting'

export default MainCampusLighting
