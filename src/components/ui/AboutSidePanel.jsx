import React from 'react';
import { X } from 'lucide-react';
import './AboutSidePanel.css';

const contentData = {
    'about': {
        title: "ABOUT ACSES",
        image: "/images/ACSES_Image.jpg",
        text: `The Association of Computer Science and Engineering Students (ACSES) is a vibrant, student-driven organization dedicated to fostering innovation and collaboration in the CSE department. Established by students, ACSES actively celebrates the department's 25-year legacy through events that build both technical and professional skills. Each year, ACSES organizes technical workshops, seminars, and its biggest competition during the Pioneer festival, drawing participants eager to tackle real-world challenges.

Notably, for the past two years, ACSES has hosted the prestigious Smart India Hackathon, where students develop tech solutions for societal issues, reflecting the organization's commitment to meaningful innovation. ACSES also hosts an annual alumni meet, connecting current students with alumni for mentorship and networking, strengthening ties within the community. Serving as a platform for growth and collaboration, ACSES empowers students to excel in the dynamic field of computer science and engineering, making a lasting impact within and beyond the campus.`
    },
    'vision': {
        title: "OUR VISION",
        image: "/images/ACSES_Image.jpg",
        text: `ACSES began with a mindset of encouraging beginner coders to experience competitive programming & focused to improve problem solving skills.

Our vision is to help students nurture and grow their interpersonal and technical skills.

We provide platform for students to show their coding skills by organizing various coding competitions every year.

We also organize technical workshops based on various programming languages.`
    }
};

export default function AboutSidePanel({ isOpen, onClose, section }) {
    const content = contentData[section];
    
    // Internal state to trigger animation class after mount
    const [animateOpen, setAnimateOpen] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            // Small delay to ensure DOM is painted before adding 'open' class
            const timer = setTimeout(() => setAnimateOpen(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateOpen(false);
        }
    }, [isOpen]);
    
    // Determine direction based on section
    // 'about' -> Left panel
    // 'vision' -> Right panel
    // Default to right if undefined
    const direction = section === 'about' ? 'left' : 'right';

    if (!content) return null;

    return (
        <>
            <div className={`panel-backdrop ${animateOpen ? 'open' : ''}`} onClick={onClose} />
            
            <div className={`about-side-panel ${direction} ${animateOpen ? 'open' : ''}`}>
                {/* Close Button */}
                <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
                    <X size={24} />
                </button>

                {/* Header Image */}
                <div className="panel-image-container">
                    <img
                        src={content.image}
                        alt={content.title}
                        className="panel-header-image"
                    />
                    <div className="image-overlay"></div>
                </div>

                {/* Content */}
                <div className="panel-content">
                    <h2 className="panel-title">{content.title}</h2>
                    <div className="panel-text">
                        {content.text}
                    </div>
                </div>
            </div>
        </>
    );
}
