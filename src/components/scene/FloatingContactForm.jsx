import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import './FloatingContactForm.css'

/**
 * Floating Contact Form Component
 * Renders an HTML form in 3D space above the laptops
 */
export default function FloatingContactForm({ position = [0, 2, 0], scale = 1 }) {
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
    }

    return (
        <Html
            position={position}
            center
            distanceFactor={scale}
            occlude={false}
            zIndexRange={[0, 0]}
            style={{
                transition: 'all 0.2s',
                opacity: 1
            }}
        >
            <div className="floating-contact-form">
                <div className="form-glow-bg"></div>
                <div className="form-content">
                    <h2 className="form-title">Contact Us</h2>
                    <p className="form-subtitle">Get in touch with ACSES</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your message..."
                                rows="4"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn">
                            <span className="btn-text">Send Message</span>
                            <span className="btn-glow"></span>
                        </button>
                    </form>
                </div>
            </div>
        </Html>
    )
}
