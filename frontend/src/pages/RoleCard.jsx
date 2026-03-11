import React from 'react';

const RoleCard = ({ icon, title, desc, features, image, isPrimary, onSelect, buttonText}) => (
    <div className="group role-card-container">
        {/* Изображение */}
        <div className="role-card-img-wrapper">
            <div className="role-card-overlay"></div>
            <img
                src={image}
                alt={title}
                className="role-card-image group-hover:scale-110"
            />
            <div className="role-card-icon-box">
                <span className="icon-feature flex">{icon}</span>
            </div>
        </div>

        {/* Контент */}
        <div className="role-card-content">
            <h3 className="role-card-title">{title}</h3>
            <p className="role-card-desc">{desc}</p>

            <div className="feature-list">
                {features.map((feature, i) => (
                    <div key={i} className="feature-row">
                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        <span>{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onSelect}
                className={isPrimary ? "role-btn-primary" : "role-btn-secondary"}
            >
                {buttonText}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
        </div>
    </div>
);

export default RoleCard;