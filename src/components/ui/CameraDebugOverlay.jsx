import React, { useState } from 'react'

/**
 * Camera Debug Overlay Component
 * Displays camera position and distance with copy-to-clipboard functionality
 */
const CameraDebugOverlay = React.memo(({ cameraPosition, distance }) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        const code = `position: [${cameraPosition.x}, ${cameraPosition.y}, ${cameraPosition.z}]`
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ffff',
            padding: '15px 20px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: '2px solid #00ffff',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            minWidth: '250px',
            zIndex: 1000
        }}>
            <div style={{
                borderBottom: '1px solid #00ffff',
                paddingBottom: '8px',
                marginBottom: '10px',
                fontWeight: 'bold',
                fontSize: '14px'
            }}>
                📷 Camera Debug
            </div>

            <div style={{ marginBottom: '5px' }}>
                <strong>Current Position:</strong>
            </div>
            <div style={{ paddingLeft: '10px', color: '#88ffff' }}>
                <div>X: {cameraPosition.x}</div>
                <div>Y: {cameraPosition.y}</div>
                <div>Z: {cameraPosition.z}</div>
            </div>

            <div style={{ marginTop: '10px', marginBottom: '5px' }}>
                <strong>Distance:</strong> <span style={{ color: '#88ffff' }}>{distance}</span>
            </div>

            <button
                onClick={copyToClipboard}
                style={{
                    marginTop: '12px',
                    padding: '8px 15px',
                    background: copied ? '#00ff00' : '#00ffff',
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
                {copied ? '✓ Copied!' : '📋 Copy Position'}
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

CameraDebugOverlay.displayName = 'CameraDebugOverlay'

export default CameraDebugOverlay
