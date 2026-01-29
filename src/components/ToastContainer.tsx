import React from 'react';
import { useToast, type ToastType } from '../context/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastItem: React.FC<{
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
}> = ({ id, message, type, onDismiss }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertCircle size={20} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const getStyles = () => {
        // Glassmorphism effect consistent with app theme
        return {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        };
    };

    return (
        <div
            role="alert"
            style={{
                ...getStyles(),
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '0.5rem',
                minWidth: '300px',
                maxWidth: '450px',
                animation: 'slideIn 0.3s ease-out forwards',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ marginRight: '0.75rem', display: 'flex', alignItems: 'center' }}>
                {getIcon()}
            </div>
            <div style={{ flex: 1, fontSize: '0.9rem' }}>{message}</div>
            <button
                onClick={() => onDismiss(id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '0.5rem'
                }}
                aria-label="Close"
            >
                <X size={16} />
            </button>
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                pointerEvents: 'none', // Allow clicks pass through transparent areas
            }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDismiss={removeToast}
                    />
                ))}
            </div>
        </div>
    );
};
