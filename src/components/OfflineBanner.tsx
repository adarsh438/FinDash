import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import './OfflineBanner.css';

const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="offline-banner animate-slide-up">
            <WifiOff size={16} />
            <span>You are currently offline. FinDash will sync changes when connectivity is restored.</span>
        </div>
    );
};

export default OfflineBanner;
