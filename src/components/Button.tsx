import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => (
    <button
        className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
    >
        {loading ? (
            <span className="btn-spinner" />
        ) : (
            icon && <span className="btn-icon">{icon}</span>
        )}
        {children}
    </button>
);

export default Button;
