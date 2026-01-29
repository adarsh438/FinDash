import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`skeleton-loader ${className}`}
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
                    animation: 'shimmer 1.5s infinite',
                }}
            />
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
};

export default Skeleton;
