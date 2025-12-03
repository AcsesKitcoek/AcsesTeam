import React from 'react'

/**
 * Responsive Back Button Component
 * Adapts styling for mobile and desktop
 */
const BackButton = React.memo(({ onClick, isMobile, label = '← Back to Campus' }) => {
    const mobileLabel = '←'
    const displayLabel = isMobile ? mobileLabel : label

    return (
        <button
            className="back-button"
            onClick={onClick}
            style={{
                position: 'fixed',
                top: isMobile ? '10px' : '20px',
                left: isMobile ? '10px' : '20px',
                padding: isMobile ? '10px' : '8px 16px',
                background: 'rgba(255, 0, 255, 0.2)',
                border: '2px solid #ff00ff',
                color: '#ff00ff',
                fontSize: isMobile ? '16px' : '12px',
                fontWeight: '600',
                borderRadius: isMobile ? '50%' : '6px',
                width: isMobile ? '40px' : 'auto',
                height: isMobile ? '40px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                letterSpacing: isMobile ? '0' : '1px',
                textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
                pointerEvents: 'auto',
                zIndex: 1000,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
                if (!isMobile) {
                    e.target.style.background = 'rgba(255, 0, 255, 0.4)'
                    e.target.style.transform = 'scale(1.05)'
                }
            }}
            onMouseLeave={(e) => {
                if (!isMobile) {
                    e.target.style.background = 'rgba(255, 0, 255, 0.2)'
                    e.target.style.transform = 'scale(1)'
                }
            }}
            onTouchStart={(e) => {
                e.target.style.background = 'rgba(255, 0, 255, 0.4)'
                e.target.style.transform = 'scale(0.9)'
            }}
            onTouchEnd={(e) => {
                e.target.style.background = 'rgba(255, 0, 255, 0.2)'
                e.target.style.transform = 'scale(1)'
            }}
        >
            {displayLabel}
        </button>
    )
})

BackButton.displayName = 'BackButton'

export default BackButton
