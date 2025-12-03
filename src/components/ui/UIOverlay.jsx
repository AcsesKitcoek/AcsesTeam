import React from 'react'

/**
 * UI Overlay Component
 * Displays title, subtitle, and optional back button
 */
const UIOverlay = React.memo(({ title, subtitle, showBackButton, onBackClick, children }) => {
    return (
        <div className="ui-overlay">
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>

            {showBackButton && (
                <button
                    className="back-button"
                    onClick={onBackClick}
                >
                    ← Back to Campus
                </button>
            )}

            {children}
        </div>
    )
})

UIOverlay.displayName = 'UIOverlay'

export default UIOverlay
