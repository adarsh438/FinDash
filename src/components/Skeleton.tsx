import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    type?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'rect', width, height, style, className = '' }) => {
    const styles: React.CSSProperties = {
        width,
        height,
        ...style,
    };

    return <div className={`skeleton skeleton-${type} ${className}`} style={styles} />;
};

export default Skeleton;
