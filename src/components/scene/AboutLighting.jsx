import React from 'react'

/**
 * About ACSES Lighting Component
 * Configures ambient and accent lighting for the About ACSES scene
 */
const AboutLighting = React.memo(({ isMobile, platformLightRef }) => {
    return (
        <>
            {/* Platform Cyan Point Light - BRIGHTER */}
            <pointLight
                ref={platformLightRef}
                position={[0, 1, 0]}
                intensity={25}
                color="#00e5ff"
                distance={30}
                decay={0.5}
                castShadow={!isMobile}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            {/* Ambient lighting for the scene - MUCH BRIGHTER */}
            <ambientLight intensity={isMobile ? 1.2 : 1.0} color="#4a4a6e" />

            {/* Hemisphere light for better overall illumination */}
            <hemisphereLight
                skyColor="#6080ff"
                groundColor="#2a1a3e"
                intensity={isMobile ? 0.8 : 0.6}
            />

            {/* Directional light for wall illumination */}
            <directionalLight
                position={[10, 15, 10]}
                intensity={isMobile ? 1.0 : 0.8}
                color="#ffffff"
            />

            {/* Accent lights for wall illumination - BRIGHTER */}
            <pointLight
                position={[-8, 8, 0]}
                intensity={isMobile ? 8 : 10}
                color="#ff00ff"
                distance={20}
                decay={1}
            />
            <pointLight
                position={[8, 8, 0]}
                intensity={isMobile ? 8 : 10}
                color="#00e5ff"
                distance={20}
                decay={1}
            />

            {/* Additional fill lights for corners */}
            <pointLight
                position={[0, 8, -8]}
                intensity={isMobile ? 6 : 8}
                color="#8060ff"
                distance={18}
                decay={1}
            />
            <pointLight
                position={[0, 8, 8]}
                intensity={isMobile ? 6 : 8}
                color="#60a0ff"
                distance={18}
                decay={1}
            />
        </>
    )
})

AboutLighting.displayName = 'AboutLighting'

export default AboutLighting
