import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    variant?: 'default' | 'flat' | 'interactive' | 'highlighted';
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    style,
    variant = 'default',
    onClick,
}) => {
    const variantClass = variant !== 'default' ? variant : '';
    return (
        <div
            className={`glass-card ${variantClass} ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
