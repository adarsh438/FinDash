import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import { billService, type RecurringBill } from '../services/billService';
import { useCurrency } from '../context/CurrencyContext';
import './Bills.css';

import Button from '../components/Button';
import UpgradeModal from '../components/UpgradeModal';

const Bills = () => {
    const { currentUser, userProfile } = useAuth();
    const { formatCurrency } = useCurrency();
    // navigate removed

    // Premium Check
    // Premium Check
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    if (!userProfile?.isPremium) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', animation: 'fadeIn 0.5s ease-out', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Calendar size={48} color="var(--accent-primary)" />
                    </div>
                    <h2>Unlock Bill Predictions</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        See your upcoming recurring bills and never miss a payment again.
                        Available for Premium users.
                    </p>
                    <Button onClick={() => setIsUpgradeModalOpen(true)} variant="primary" style={{ justifyContent: 'center' }}>
                        Upgrade to Premium
                    </Button>
                </Card>
                <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
            </div>
        );
    }

    const [bills, setBills] = useState<RecurringBill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (expenses) => {
            const predicted = billService.predictBills(expenses);
            setBills(predicted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getDaysDue = (date: Date) => {
        const today = new Date();
        const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="bills-container">
            <div className="bills-header">
                <div>
                    <h1>Upcoming Bills</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Predicted recurring expenses based on your history.</p>
                </div>
                <div className="header-icon-wrapper">
                    <Calendar size={24} color="var(--accent-primary)" />
                </div>
            </div>

            <div className="bills-list">
                {loading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Analyzing expenses...</p>
                ) : bills.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '3rem' }}>
                        <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No recurring bills detected yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Add more expenses like "Netflix", "Rent", or "Internet" monthly, and I'll start predicting them here.
                        </p>
                    </Card>
                ) : (
                    bills.map((bill) => {
                        const daysDue = getDaysDue(bill.nextDueDate);
                        const isOverdue = daysDue < 0;
                        const isSoon = daysDue <= 3 && daysDue >= 0;

                        return (
                            <Card key={bill.id} className="bill-card" style={{ borderLeft: isOverdue ? '4px solid var(--accent-danger)' : isSoon ? '4px solid var(--accent-warning)' : '4px solid var(--accent-success)' }}>
                                <div className="bill-info">
                                    <div className="bill-title-row">
                                        <h3>{bill.title}</h3>
                                        {isOverdue && <span className="badge danger">Overdue</span>}
                                        {isSoon && <span className="badge warning">Due Soon</span>}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Usually ~{formatCurrency(bill.averageAmount)} • Monthly
                                    </p>
                                </div>

                                <div className="bill-date">
                                    <div className="date-box">
                                        <span className="month">{bill.nextDueDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="day">{bill.nextDueDate.getDate()}</span>
                                    </div>
                                    <div className="days-remaining" style={{ color: isOverdue ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                                        {isOverdue ? `${Math.abs(daysDue)} days ago` : daysDue === 0 ? 'Today' : `${daysDue} days left`}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Bills;
