import React from 'react'

/**
 * UI Overlay Component
 * Displays title, subtitle, and optional back button
 */
const UIOverlay = React.memo(({ title, subtitle, additionalSubtitle, children }) => {
    return (
        <header className="ui-overlay">
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
            {additionalSubtitle && <p className="additional-subtitle">{additionalSubtitle}</p>}
            {children}
        </header>
    )
})

UIOverlay.displayName = 'UIOverlay'

export default UIOverlay
