import React from 'react';
import { X, Image } from 'lucide-react';
import './EventSidePanel.css';

export default function EventSidePanel({ isOpen, onClose, eventData }) {
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

    if (!eventData) return null;

    return (
        <>
            <div className={`panel-backdrop ${animateOpen ? 'open' : ''}`} onClick={onClose} />
            <aside className={`event-side-panel ${animateOpen ? 'open' : ''}`}>
                {/* Close Button */}
                <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
                    <X size={24} />
                </button>

                {/* Event Header Image */}
                <figure className="panel-image-container">
                    <img
                        src={eventData.panelImage}
                        alt={eventData.title}
                        className="panel-event-image"
                    />
                    <div className="image-overlay"></div>
                </figure>

                {/* Panel Content */}
                <article className="panel-content">
                    {/* Event Name */}
                    <h2 className="panel-event-name">{eventData.title}</h2>

                    {/* Description Section */}
                    <section className="panel-section">
                        <h3 className="section-title">About the Event</h3>
                        <p className="section-text">{eventData.description}</p>
                    </section>

                    {/* Gallery Grid */}
                    {eventData.galleryImages && eventData.galleryImages.length > 0 && (
                        <section className="panel-section">
                            <h3 className="section-title">
                                <Image size={18} style={{ marginRight: '8px' }} />
                                Gallery
                            </h3>
                            <ul className="gallery-grid">
                                {eventData.galleryImages.map((imgSrc, index) => (
                                    <li key={index} className="gallery-item-container">
                                        <figure className="gallery-item">
                                            <img
                                                src={imgSrc}
                                                alt={`${eventData.title} ${index + 1}`}
                                                className="gallery-image"
                                                loading="lazy"
                                            />
                                        </figure>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </article>
            </aside>
        </>
    );
}
