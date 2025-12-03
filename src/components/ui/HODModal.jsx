import React from 'react'

/**
 * HOD Modal Component
 * Displays information about HOD and Faculty Coordinator
 */
const HODModal = React.memo(({ onClose }) => {
    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                pointerEvents: 'auto'
            }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(42, 0, 84, 0.95), rgba(20, 0, 40, 0.95))',
                border: '2px solid #ff00ff',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '600px',
                width: '90%',
                boxShadow: '0 0 40px rgba(255, 0, 255, 0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: '2px solid #ff00ff',
                        color: '#ff00ff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#ff00ff'
                        e.target.style.color = '#000'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#ff00ff'
                    }}
                >
                    ×
                </button>

                <h2 style={{
                    color: '#ff00ff',
                    fontSize: '32px',
                    marginBottom: '30px',
                    textAlign: 'center',
                    textShadow: '0 0 20px rgba(255, 0, 255, 0.8)'
                }}>
                    HOD CABIN
                </h2>

                <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'rgba(255, 0, 255, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 0, 255, 0.3)'
                }}>
                    <h3 style={{
                        color: '#00ffff',
                        fontSize: '20px',
                        marginBottom: '10px'
                    }}>
                        Head of Department
                    </h3>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        marginBottom: '5px'
                    }}>
                        <strong>Name:</strong> Dr. [HOD Name]
                    </p>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        marginBottom: '5px'
                    }}>
                        <strong>Email:</strong> hod@example.com
                    </p>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px'
                    }}>
                        <strong>Phone:</strong> +91 XXXXXXXXXX
                    </p>
                </div>

                <div style={{
                    padding: '20px',
                    background: 'rgba(0, 255, 255, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                }}>
                    <h3 style={{
                        color: '#00ffff',
                        fontSize: '20px',
                        marginBottom: '10px'
                    }}>
                        Faculty Coordinator
                    </h3>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        marginBottom: '5px'
                    }}>
                        <strong>Name:</strong> Prof. [Faculty Name]
                    </p>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        marginBottom: '5px'
                    }}>
                        <strong>Email:</strong> faculty@example.com
                    </p>
                    <p style={{
                        color: '#ffffff',
                        fontSize: '16px'
                    }}>
                        <strong>Phone:</strong> +91 XXXXXXXXXX
                    </p>
                </div>
            </div>
        </div>
    )
})

HODModal.displayName = 'HODModal'

export default HODModal
