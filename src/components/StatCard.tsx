import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    trend?: number; // % change vs last month, positive = up
    accentColor?: string;
    className?: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    accentColor = 'var(--accent-primary)',
    className = '',
    onClick,
}) => {
    const hasTrend = trend !== undefined;
    const isUp   = hasTrend && trend > 0;
    const isDown  = hasTrend && trend < 0;
    const isFlat  = hasTrend && trend === 0;

    return (
        <div
            className={`stat-card ${onClick ? 'clickable' : ''} ${className}`}
            onClick={onClick}
            style={{ '--stat-accent': accentColor } as React.CSSProperties}
        >
            <div className="stat-card-accent-bar" />
            <div className="stat-card-header">
                <div className="stat-card-icon-wrap">
                    {icon}
                </div>
                {hasTrend && (
                    <div className={`stat-card-trend ${isUp ? 'up' : isDown ? 'down' : 'flat'}`}>
                        {isUp   && <TrendingUp  size={13} />}
                        {isDown && <TrendingDown size={13} />}
                        {isFlat && <Minus        size={13} />}
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value animate-count">{value}</div>
        </div>
    );
};

export default StatCard;
