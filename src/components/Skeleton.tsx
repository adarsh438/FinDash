<<<<<<< HEAD
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
=======
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
>>>>>>> 6601a4a265f358168171eb60ea8f3a1b19e13166
