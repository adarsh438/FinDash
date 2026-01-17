import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5s

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} color="var(--accent-success)" />,
        error: <AlertCircle size={20} color="var(--accent-danger)" />,
        info: <Info size={20} color="var(--accent-info)" />
    };

    const borders = {
        success: '1px solid var(--accent-success)',
        error: '1px solid var(--accent-danger)',
        info: '1px solid var(--accent-info)'
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            border: borders[type],
            borderRadius: '12px',
            color: 'var(--text-primary)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out',
            zIndex: 9999,
            pointerEvents: 'auto'
        }}>
            {icons[type]}
            <p style={{ margin: 0, flex: 1, fontSize: '14px' }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
