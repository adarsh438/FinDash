import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import './NotificationCenter.css';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    type: 'warning' | 'info' | 'success';
    timestamp: Date;
}

const NotificationCenter: React.FC = () => {
    const { budget, currentMonthSpend } = useExpenses();
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        const items: NotificationItem[] = [];

        if (budget && budget.amount > 0) {
            const pct = (currentMonthSpend / budget.amount) * 100;
            if (pct >= 100) {
                items.push({
                    id: 'budget-exceeded',
                    title: 'Budget Limit Exceeded!',
                    description: `You have spent ${pct.toFixed(0)}% of your monthly budget limit.`,
                    type: 'warning',
                    timestamp: new Date()
                });
            } else if (pct >= 80) {
                items.push({
                    id: 'budget-warning',
                    title: 'Budget Alert (80%)',
                    description: `You are nearing your budget limit (${pct.toFixed(0)}% spent).`,
                    type: 'warning',
                    timestamp: new Date()
                });
            }
        }

        if (userProfile?.isPremium) {
            items.push({
                id: 'premium-active',
                title: '✦ Premium Active',
                description: 'Full access to AI Coach, Bill Predictions, and Advanced Analytics.',
                type: 'success',
                timestamp: new Date()
            });
        }

        items.push({
            id: 'system-v2',
            title: 'Welcome to FinDash Commercial Edition',
            description: 'Experience real-time expense tracking, group splits, and AI intelligence.',
            type: 'info',
            timestamp: new Date()
        });

        setNotifications(items);
    }, [budget, currentMonthSpend, userProfile]);

    return (
        <div className="notification-center-wrap">
            <button
                className={`header-bell-btn ${notifications.length > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={18} />
                {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown animate-slide-up">
                    <div className="notification-dropdown-header">
                        <h3>Notifications ({notifications.length})</h3>
                        <button onClick={() => setIsOpen(false)}><X size={16} /></button>
                    </div>

                    <div className="notification-list">
                        {notifications.map(n => (
                            <div key={n.id} className={`notification-item ${n.type}`}>
                                <div className="notification-icon">
                                    {n.type === 'warning' ? <AlertTriangle size={16} /> :
                                        n.type === 'success' ? <CheckCircle size={16} /> : <Info size={16} />}
                                </div>
                                <div className="notification-body">
                                    <div className="notification-item-title">{n.title}</div>
                                    <div className="notification-item-desc">{n.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
