import React from 'react';
import { X, Linkedin } from 'lucide-react';
import './HODModal.css';

// Updated data with linkedinUsername
const FACULTY_DATA = [
    {
        role: "Head of Department",
        name: "Dr. Lingaraj Hadimani",
        image: "/images/faculty/hod.jpg",
        linkedin: "https://www.linkedin.com/in/lingaraj-hadimani/",
        linkedinUsername: "lingaraj-hadimani"
    },
    {
        role: "Faculty Coordinator",
        name: "Mr. Anesh Kshirsagar",
        image: "/images/faculty/anishk.jpg",
        linkedin: "https://www.linkedin.com/in/anesh-kshirsagar-738469195/",
        linkedinUsername: "anesh-kshirsagar"
    }
];

const HODModal = React.memo(({ onClose, openTime }) => {
    const handleLinkClick = (e) => {
        const clickTime = Date.now();
        // If the click happens within 100ms of the modal opening, it's a ghost click.
        if (clickTime - openTime < 100) {
            e.preventDefault(); // Stop the navigation
            e.stopPropagation(); // Stop any other listeners
        }
    };

    return (
        <div
            className="hod-modal-overlay"
            onClick={(e) => {
                // Close modal only if the overlay itself is clicked
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
                        // The entire card is now a link
                        <a
                            key={index}
                            href={person.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hod-card-link"
                            onClick={handleLinkClick}
                        >
                            <div className="hod-card">
                                <div className="hod-image-wrapper">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="hod-profile-image"
                                    />
                                </div>
                                <div className="hod-info">
                                    <h3 className="hod-role">{person.role}</h3>
                                    <p className="hod-name">{person.name}</p>
                                    {/* LinkedIn username display */}
                                    <div className="hod-linkedin-username">
                                        <Linkedin size={14} className="linkedin-username-icon" />
                                        <span>{person.linkedinUsername}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
});

HODModal.displayName = 'HODModal';

export default HODModal;