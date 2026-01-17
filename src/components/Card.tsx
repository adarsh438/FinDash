<<<<<<< HEAD
import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
    return (
        <div className={`glass-card ${className}`} style={style}>
            {children}
        </div>
    );
};

export default Card;
=======
import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
    return (
        <div className={`glass-card ${className}`} style={style}>
            {children}
        </div>
    );
};

export default Card;
>>>>>>> 6601a4a265f358168171eb60ea8f3a1b19e13166
