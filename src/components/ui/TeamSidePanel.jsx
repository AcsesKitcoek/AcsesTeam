import React from 'react';
import {
    GraduationCap,
    ShieldCheck,
    Shield,
    Cpu,
    User,
    ExternalLink,
    X,
    // New Icons for Management
    Crown,          // President
    Star,           // Vice President
    CalendarCheck,  // Event Coordinator
    Banknote,       // Treasurer
    FileText        // Secretary
} from 'lucide-react';
import './TeamSidePanel.css';

// New Component for rendering each member item
const MemberListItem = ({ member, Icon, label, className = '' }) => {
    const isObject = typeof member === 'object' && member !== null;
    const name = isObject ? member.name : member;
    const link = isObject ? member.link : null;

    const content = (
        <>
            <Icon size={18} className="member-icon-svg" aria-label={label} />
            <span className="member-name">{name}</span>
            {link && <ExternalLink size={14} className="member-link-icon" />}
        </>
    );

    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`member-item ${className}`}>
                {content}
            </a>
        );
    }

    return (
        <div className={`member-item ${className}`}>
            {content}
        </div>
    );
};


export default function TeamSidePanel({ isOpen, onClose, teamData }) {
    if (!teamData) return null;

    // Helper to determine grid class based on item count
    // Returns 'single-col' if there is exactly 1 item, ensuring it takes full width
    const getGridClass = (list, baseClass) => {
        return list && list.length === 1 ? `${baseClass} single-col` : baseClass;
    };

    // Detect if this is the Management Team structure
    const isManagement = !!teamData.president;

    return (
        <>
            <div className={`panel-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`team-side-panel ${isOpen ? 'open' : ''} ${isManagement ? 'management-panel' : ''}`}>
                {/* Close Button */}
                <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
                    <X size={24} />
                </button>

                {/* Team Image */}
                <div className="panel-image-container">
                    <img
                        src={teamData.image}
                        alt={teamData.name}
                        className="panel-team-image"
                    />
                    <div className="image-overlay"></div>
                </div>

                {/* Team Content */}
                <div className="panel-content">
                    {/* Team Name */}
                    <h2 className="panel-team-name">{teamData.name}</h2>

                    {/* Purpose Section */}
                    <div className="panel-section">
                        <h3 className="section-title">Purpose</h3>
                        <p className="section-text">{teamData.purpose}</p>
                    </div>

                    {isManagement ? (
                        <>
                            {/* President */}
                            {teamData.president && (
                                <div className="panel-section">
                                    <h3 className="section-title">President</h3>
                                    <MemberListItem member={teamData.president} Icon={Crown} label="President" className="president-item" />
                                </div>
                            )}

                            {/* Vice President */}
                            {teamData.vice_president && (
                                <div className="panel-section">
                                    <h3 className="section-title">Vice President</h3>
                                    <MemberListItem member={teamData.vice_president} Icon={Star} label="Vice President" className="vp-item" />
                                </div>
                            )}

                            {/* Executive Roles Grid (Coordinator & Treasurer) */}
                            {(teamData.event_coordinator || teamData.treasurer) && (
                                <div className="panel-section">
                                    <h3 className="section-title">Executives</h3>
                                    <div className="member-grid">
                                        {teamData.event_coordinator && (
                                            <MemberListItem member={teamData.event_coordinator} Icon={CalendarCheck} label="Event Coordinator" className="coordinator-item" />
                                        )}
                                        {teamData.treasurer && (
                                            <MemberListItem member={teamData.treasurer} Icon={Banknote} label="Treasurer" className="treasurer-item" />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Secretary - GRID */}
                            {teamData.secretary && teamData.secretary.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Secretaries</h3>
                                    <div className={getGridClass(teamData.secretary, "member-grid")}>
                                        {teamData.secretary.map((sec, index) => (
                                            <MemberListItem key={index} member={sec} Icon={FileText} label="Secretary" className="secretary-item" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Joint Treasurer - GRID */}
                            {teamData.joint_treasurer && teamData.joint_treasurer.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Joint Treasurers</h3>
                                    <div className={getGridClass(teamData.joint_treasurer, "member-grid")}>
                                        {teamData.joint_treasurer.map((jt, index) => (
                                            <MemberListItem key={index} member={jt} Icon={Banknote} label="Joint Treasurer" className="joint-treasurer-item" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* --- STANDARD TEAM LAYOUT (Existing) --- */
                        <>
                            {/* Mentors */}
                            {teamData.mentors && teamData.mentors.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Mentors</h3>
                                    <div className={getGridClass(teamData.mentors, "member-list")}>
                                        {teamData.mentors.map((mentor, index) => (
                                            <MemberListItem key={index} member={mentor} Icon={GraduationCap} label="Mentor" className="mentor-item" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team Head */}
                            {teamData.teamHead && (
                                <div className="panel-section">
                                    <h3 className="section-title">Team Head</h3>
                                    <MemberListItem member={teamData.teamHead} Icon={ShieldCheck} label="Team Head" className="head-item" />
                                </div>
                            )}

                            {/* Co-Heads */}
                            {teamData.coHeads && teamData.coHeads.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Co-Head{teamData.coHeads.length > 1 ? 's' : ''}</h3>
                                    <div className={getGridClass(teamData.coHeads, "member-list")}>
                                        {teamData.coHeads.map((coHead, index) => (
                                            <MemberListItem key={index} member={coHead} Icon={Shield} label="Co-Head" className="cohead-item" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Core Team */}
                            {teamData.coreMembers && teamData.coreMembers.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Core Team</h3>
                                    <div className={getGridClass(teamData.coreMembers, "member-list")}>
                                        {teamData.coreMembers.map((member, index) => (
                                            <MemberListItem key={index} member={member} Icon={Cpu} label="Core Member" className="core-item" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Members - ALWAYS MULTI COLUMN (Default behavior) */}
                            {teamData.members && teamData.members.length > 0 && (
                                <div className="panel-section">
                                    <h3 className="section-title">Members</h3>
                                    <div className="member-list">
                                        {teamData.members.map((member, index) => (
                                            <MemberListItem key={index} member={member} Icon={User} label="Member" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
