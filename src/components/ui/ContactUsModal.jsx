import React, { useState } from 'react'

/**
 * Contact Us Modal Component
 * Displays a contact form in a modal overlay
 */
const ContactUsModal = React.memo(({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        // TODO: Add your form submission logic here
        alert('Message sent! (This is a demo)')
        setFormData({ name: '', email: '', message: '' })
        onClose()
    }

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
                pointerEvents: 'auto',
                animation: 'fadeIn 0.3s ease-out'
            }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(42, 0, 84, 0.95), rgba(20, 0, 40, 0.95))',
                border: '2px solid #aa00ff',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 0 40px rgba(170, 0, 255, 0.5)',
                position: 'relative',
                animation: 'slideUp 0.4s ease-out'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: '2px solid #aa00ff',
                        color: '#aa00ff',
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
                        e.target.style.background = '#aa00ff'
                        e.target.style.color = '#000'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#aa00ff'
                    }}
                >
                    ×
                </button>

                {/* Title */}
                <h2 style={{
                    color: '#aa00ff',
                    fontSize: '32px',
                    marginBottom: '10px',
                    textAlign: 'center',
                    textShadow: '0 0 20px rgba(170, 0, 255, 0.8)'
                }}>
                    Contact Us
                </h2>

                <p style={{
                    color: '#00e5ff',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    Get in touch with ACSES
                </p>

                {/* Contact Form */}
                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#aa00ff',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(10, 5, 20, 0.6)',
                                border: '1.5px solid rgba(170, 0, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#ffffff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(0, 229, 255, 0.6)'
                                e.target.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(170, 0, 255, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Email Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#aa00ff',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(10, 5, 20, 0.6)',
                                border: '1.5px solid rgba(170, 0, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#ffffff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(0, 229, 255, 0.6)'
                                e.target.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(170, 0, 255, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Message Field */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            color: '#aa00ff',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your message..."
                            rows="4"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(10, 5, 20, 0.6)',
                                border: '1.5px solid rgba(170, 0, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#ffffff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s',
                                resize: 'vertical',
                                minHeight: '100px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(0, 229, 255, 0.6)'
                                e.target.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(170, 0, 255, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: 'linear-gradient(135deg, #6a0dad, #00bfff)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(170, 0, 255, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 6px 25px rgba(170, 0, 255, 0.6)'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0px)'
                            e.target.style.boxShadow = '0 4px 15px rgba(170, 0, 255, 0.4)'
                        }}
                    >
                        Send Message
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
})

ContactUsModal.displayName = 'ContactUsModal'

export default ContactUsModal
