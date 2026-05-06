import React from 'react';
import Button from './Button';
import './EmptyState.css';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => (
    <div className="empty-state animate-fade-in-scale">
        <div className="empty-state-icon">{icon}</div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-desc">{description}</p>
        {actionLabel && onAction && (
            <Button onClick={onAction} variant="secondary">
                {actionLabel}
            </Button>
        )}
    </div>
);

export default EmptyState;
