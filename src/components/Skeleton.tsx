import React from 'react';

interface SkeletonProps {
    height?: number | string;
    width?: number | string;
    style?: React.CSSProperties;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    height = 20,
    width = '100%',
    style,
    className = '',
}) => (
    <div
        className={`skeleton ${className}`}
        style={{ height, width, ...style }}
    />
);

export default Skeleton;
