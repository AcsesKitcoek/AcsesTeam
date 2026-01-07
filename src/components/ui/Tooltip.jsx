import React from 'react';

const Tooltip = ({ text, visible, x, y }) => {
    if (!visible) {
        return null;
    }

    const style = {
        position: 'fixed',
        top: y + 20, // Position below the cursor
        left: x + 20, // Position to the right of the cursor
        transform: 'translate(-50%, 0)', // Center horizontally on the cursor
        padding: '8px 16px',
        background: 'rgba(10, 5, 20, 0.85)', // Dark purple, slightly transparent
        color: '#f0f0f0',
        border: '1px solid #ff00ff',
        borderRadius: '8px',
        backdropFilter: 'blur(5px)',
        fontFamily: 'monospace',
        fontSize: '14px',
        pointerEvents: 'none', // Allow cursor events to pass through
        zIndex: 1001,
        boxShadow: '0 0 15px rgba(255, 0, 255, 0.3), 0 0 5px rgba(255, 0, 255, 0.2) inset',
        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.2s ease, top 0.2s ease, left 0.2s ease', // Smooth transitions
        opacity: visible ? 1 : 0,
    };

    return (
        <div style={style}>
            {text}
        </div>
    );
};

export default Tooltip;
