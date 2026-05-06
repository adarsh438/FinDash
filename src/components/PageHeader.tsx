import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon,
    action,
    className = '',
}) => (
    <div className={`page-header ${className}`}>
        <div className="page-header-left">
            {icon && <div className="page-header-icon">{icon}</div>}
            <div>
                <h1 className="page-header-title">{title}</h1>
                {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
            </div>
        </div>
        {action && <div className="page-header-action">{action}</div>}
    </div>
);

export default PageHeader;
