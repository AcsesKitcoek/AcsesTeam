import React, { useState } from 'react'
import { X } from 'lucide-react'
import emailjs from '@emailjs/browser'
import Toast from './Toast'
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
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }))
        }, 3000)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID
        const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

        if (!serviceID || !templateID || !publicKey) {
            showToast('Configuration Error: Missing environment variables', 'error')
            setIsSubmitting(false)
            return
        }

        if (serviceID === 'your_service_id' || templateID === 'your_template_id' || publicKey === 'your_public_key') {
            showToast('Configuration Error: Placeholders detected', 'error')
            setIsSubmitting(false)
            return
        }

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_name: 'ACSES Team',
            ...formData
        }

        emailjs.send(serviceID, templateID, templateParams, publicKey)
            .then(() => {
                showToast('Message sent successfully!')
                setFormData({ name: '', email: '', message: '' })
                // Close modal after a short delay so user sees the toast
                setTimeout(() => {
                    onClose()
                }, 2000)
            })
            .catch((error) => {
                showToast('Failed to send message', 'error')
            })
            .finally(() => {
                setIsSubmitting(false)
            })
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
            <div
                className="contact-modal-container"
                style={{
                    background: 'linear-gradient(135deg, rgba(42, 0, 84, 0.95), rgba(20, 0, 40, 0.95))',
                    border: '2px solid #aa00ff',
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 0 40px rgba(170, 0, 255, 0.5)',
                    position: 'relative',
                    animation: 'slideUp 0.4s ease-out'
                }}>
                
                <Toast message={toast.message} type={toast.type} isVisible={toast.show} />

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
                    <X size={24} />
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
                        className="w-full"
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: isSubmitting ? 'rgba(106, 13, 173, 0.5)' : 'linear-gradient(135deg, #6a0dad, #00bfff)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(170, 0, 255, 0.4)',
                            whiteSpace: 'nowrap',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isSubmitting) {
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 6px 25px rgba(170, 0, 255, 0.6)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSubmitting) {
                                e.target.style.transform = 'translateY(0px)'
                                e.target.style.boxShadow = '0 4px 15px rgba(170, 0, 255, 0.4)'
                            }
                        }}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
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

                /* Mobile Responsive Styles */
                @media (max-width: 768px) {
                    .contact-modal-container {
                        padding: 24px !important;
                        border-radius: 16px !important;
                        width: 95% !important;
                    }

                    .contact-modal-container h2 {
                        font-size: 24px !important;
                        margin-bottom: 8px !important;
                    }

                    .contact-modal-container p {
                        font-size: 12px !important;
                        margin-bottom: 20px !important;
                    }

                    .contact-modal-container label {
                        font-size: 12px !important;
                        margin-bottom: 6px !important;
                    }

                    .contact-modal-container input,
                    .contact-modal-container textarea {
                        padding: 10px 12px !important;
                        font-size: 13px !important;
                        border-radius: 8px !important;
                    }

                    .contact-modal-container textarea {
                        min-height: 80px !important;
                    }

                    .contact-modal-container button[type="submit"] {
                        padding: 12px 20px !important;
                        font-size: 13px !important;
                        border-radius: 10px !important;
                        letter-spacing: 0.5px !important;
                        white-space: nowrap !important;
                    }

                    .contact-modal-container button:first-of-type {
                        width: 32   px !important;
                        height: 32px !important;
                        font-size: 20px !important;
                        top: 16px !important;
                        right: 16px !important;
                    }

                    .contact-modal-container > div {
                        margin-bottom: 16px !important;
                    }
                }
            `}</style>
        </div>
    )
})

ContactUsModal.displayName = 'ContactUsModal'

export default ContactUsModal
