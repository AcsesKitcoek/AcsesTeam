import { useState, useEffect } from 'react'

/**
 * Custom hook to detect mobile devices and handle resize events
 * @returns {boolean} isMobile - True if device is mobile or has touch support
 */
export function useMobileDetection() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}
