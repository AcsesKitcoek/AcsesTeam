import React from 'react';
import { X } from 'lucide-react';
import './AboutModal.css';

const contentData = {
    'about': {
        title: "ABOUT ACSES",
        text: `The Association of Computer Science and Engineering Students (ACSES) is a vibrant, student-driven organization dedicated to fostering innovation and collaboration in the CSE department. Established by students, ACSES actively celebrates the department's 25-year legacy through events that build both technical and professional skills. Each year, ACSES organizes technical workshops, seminars, and its biggest competition during the Pioneer festival, drawing participants eager to tackle real-world challenges.

Notably, for the past two years, ACSES has hosted the prestigious Smart India Hackathon, where students develop tech solutions for societal issues, reflecting the organization's commitment to meaningful innovation. ACSES also hosts an annual alumni meet, connecting current students with alumni for mentorship and networking, strengthening ties within the community. Serving as a platform for growth and collaboration, ACSES empowers students to excel in the dynamic field of computer science and engineering, making a lasting impact within and beyond the campus.`
    },
    'vision': {
        title: "OUR VISION",
        text: `ACSES began with a mindset of encouraging beginner coders to experience competitive programming & focused to improve problem solving skills.

Our vision is to help students nurture and grow their interpersonal and technical skills.

We provide platform for students to show their coding skills by organizing various coding competitions every year.

We also organize technical workshops based on various programming languages.`
    }
};

export default function AboutModal({ isOpen, onClose, section }) {
    const content = contentData[section];

    if (!content) return null;

    return (
        <div className={`about-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            {/* The Neon Frame */}
            <div className="about-modal-frame" onClick={(e) => e.stopPropagation()}>
                {/* The Black Screen Content */}
                <div className="about-modal-screen">
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                    
                    <h2 className="modal-title">{content.title}</h2>
                    <div className="modal-text">
                        {content.text}
                    </div>
                </div>
            </div>
        </div>
    );
}