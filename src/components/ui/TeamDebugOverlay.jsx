import React, { useState } from 'react'

/**
 * Team Debug Overlay Component
 * Displays the position and size of a debug box with copy-to-clipboard functionality.
 */
const TeamDebugOverlay = React.memo(({ box }) => {
    const [copied, setCopied] = useState(false)

    if (!box) {
        return null;
    }

    const copyToClipboard = () => {
        const code = `position={[${box.position.x.toFixed(2)}, ${box.position.y.toFixed(2)}, ${box.position.z.toFixed(2)}]}
size={[${box.size[0].toFixed(2)}, ${box.size[1].toFixed(2)}, ${box.size[2].toFixed(2)}]}`
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#ff00ff', // Changed color to magenta for distinction
            padding: '15px 20px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: '2px solid #ff00ff',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
            minWidth: '280px',
            zIndex: 1000
        }}>
            <div style={{
                borderBottom: '1px solid #ff00ff',
                paddingBottom: '8px',
                marginBottom: '10px',
                fontWeight: 'bold',
                fontSize: '14px'
            }}>
                📦 Team Zone Debug
            </div>

            <div style={{ marginBottom: '5px' }}>
                <strong>Box Position:</strong>
            </div>
            <div style={{ paddingLeft: '10px', color: '#ff88ff' }}>
                <div>X: {box.position.x.toFixed(2)}</div>
                <div>Y: {box.position.y.toFixed(2)}</div>
                <div>Z: {box.position.z.toFixed(2)}</div>
            </div>

            <div style={{ marginTop: '10px', marginBottom: '5px' }}>
                <strong>Box Size:</strong>
            </div>
            <div style={{ paddingLeft: '10px', color: '#ff88ff' }}>
                <div>Width: {box.size[0].toFixed(2)}</div>
                <div>Height: {box.size[1].toFixed(2)}</div>
                <div>Depth: {box.size[2].toFixed(2)}</div>
            </div>

            <button
                onClick={copyToClipboard}
                style={{
                    marginTop: '12px',
                    padding: '8px 15px',
                    background: copied ? '#00ff00' : '#ff00ff',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    width: '100%',
                    transition: 'all 0.2s'
                }}
            >
                {copied ? '✓ Copied!' : '📋 Copy Box Info'}
            </button>

            <div style={{
                marginTop: '12px',
                fontSize: '10px',
                color: '#888',
                fontStyle: 'italic',
                textAlign: 'center',
                borderTop: '1px solid #333',
                paddingTop: '8px'
            }}>
                Remove this component in production
            </div>
        </div>
    )
})

TeamDebugOverlay.displayName = 'TeamDebugOverlay'

export default TeamDebugOverlay
