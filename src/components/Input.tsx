<<<<<<< HEAD
import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input className={`glass-input ${className}`} {...props} />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};

export default Input;
=======
import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input className={`glass-input ${className}`} {...props} />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};

export default Input;
>>>>>>> 6601a4a265f358168171eb60ea8f3a1b19e13166
