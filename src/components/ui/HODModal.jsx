import React from 'react';
import { X, Linkedin, Mail, Phone } from 'lucide-react';
import './HODModal.css';

// Placeholder data - Replace with actual Image URLs and Links
const FACULTY_DATA = [
    {
        role: "Head of Department",
        name: "Dr. Lingraj Hadimani",
        image: "/images/faculty/hod.jpg",
        linkedin: "https://www.linkedin.com/in/lingaraj-hadimani/",
        email: "hod@example.com"
    },
    {
        role: "Faculty Coordinator",
        name: "Mr. Anesh Kshirsagar",
        image: "/images/faculty/anishk.jpg",
        linkedin: "https://www.linkedin.com/in/anesh-kshirsagar-738469195/",
        email: "faculty@example.com"
    }
];

const HODModal = React.memo(({ onClose }) => {
    return (
        <div
            className="hod-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="hod-modal-content">
                <button className="hod-close-btn" onClick={onClose} aria-label="Close">
                    <X size={24} />
                </button>

                <h2 className="hod-modal-title">HOD CABIN</h2>

                <div className="hod-card-container">
                    {FACULTY_DATA.map((person, index) => (
                        <div key={index} className="hod-card">

                            {/* FIX: Added style={{ position: 'relative' }} 
                               This forces the link to stay inside this box and not cover the whole modal.
                            */}
                            <div className="hod-image-wrapper" style={{ position: 'relative' }}>
                                <img
                                    src={person.image}
                                    alt={person.name}
                                    className="hod-profile-image"
                                />
                                <a
                                    href={person.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hod-linkedin-overlay"
                                >
                                    <div className="linkedin-icon-box">
                                        <Linkedin size={32} />
                                    </div>
                                </a>
                            </div>

                            <div className="hod-info">
                                <h3 className="hod-role">{person.role}</h3>
                                <p className="hod-name">{person.name}</p>

                                <div className="hod-contact-details">
                                    <div className="contact-row">
                                        <Mail size={14} className="contact-icon" />
                                        <span>{person.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

HODModal.displayName = 'HODModal';

export default HODModal;