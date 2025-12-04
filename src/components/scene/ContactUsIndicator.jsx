import React from 'react'
import { Html } from '@react-three/drei'

/**
 * Contact Us Indicator Component
 * A clickable button that appears above the laptops with a down arrow
 */
export default function ContactUsIndicator({ position = [0, 2, 0], onClick, scale = 2.5 }) {
    return (
        <Html
            position={position}
            center
            distanceFactor={scale}
            occlude={false}
            zIndexRange={[0, 0]}
        >
            <div
                onClick={onClick}
                style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(170, 0, 255, 0.9), rgba(0, 229, 255, 0.9))',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(170, 0, 255, 0.5)',
                    transition: 'all 0.3s ease',
                    animation: 'pulse 2s ease-in-out infinite',
                    pointerEvents: 'auto',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(170, 0, 255, 0.8)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(170, 0, 255, 0.5)'
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap'
                    }}>
                        Contact Us
                    </span>
                    <div style={{
                        fontSize: '20px',
                        animation: 'bounce 1.5s ease-in-out infinite'
                    }}>
                        ▼
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(3px);
                    }
                }
            `}</style>
        </Html>
    )
}
