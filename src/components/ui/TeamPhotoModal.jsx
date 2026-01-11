import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './TeamPhotoModal.css';

export default function TeamPhotoModal({ isOpen, onClose }) {
    const [animateOpen, setAnimateOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setAnimateOpen(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateOpen(false);
        }
    }, [isOpen]);

    if (!isOpen && !animateOpen) return null;

    return (
        <div className={`team-photo-modal-overlay ${animateOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="team-photo-modal-frame" onClick={(e) => e.stopPropagation()}>
                <div className="team-photo-modal-screen">
                    <button className="photo-modal-close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                    
                    <h2 className="photo-modal-title">Team ACSES 2025-26</h2>
                    
                    <div className="photo-container">
                        <img 
                            src="/images/about/TeamACSES.jpeg" 
                            alt="Team ACSES 2025-26" 
                            className="team-photo"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
