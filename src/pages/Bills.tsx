import { useEffect, useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { billService, type RecurringBill } from '../services/billService';
import { useCurrency } from '../context/CurrencyContext';
import './Bills.css';

const Bills = () => {
    const { userProfile } = useAuth();
    const { formatCurrency } = useCurrency();
    const { expenses } = useExpenses();
    const [bills, setBills] = useState<RecurringBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    useEffect(() => {
        if (!userProfile?.isPremium || expenses.length === 0) {
            setLoading(false);
            return;
        }
        const predicted = billService.predictBills(expenses);
        setBills(predicted);
        setLoading(false);
    }, [expenses, userProfile]);

    const getDaysDue = (date: Date) =>
        Math.ceil((date.getTime() - Date.now()) / 86400000);

    if (!userProfile?.isPremium) {
        return (
            <div className="bills-page animate-fade-in">
                <PageHeader
                    title="Upcoming Bills"
                    subtitle="Predicted recurring expenses based on your history."
                    icon={<Calendar size={22} />}
                />
                <div className="bills-gate">
                    <div className="bills-gate-card animate-fade-in-scale">
                        <div className="gate-icon-wrap">
                            <Lock size={28} />
                        </div>
                        <h2>Unlock Bill Predictions</h2>
                        <p>See your upcoming recurring bills and never miss a payment again. Available for Premium users.</p>
                        <Button onClick={() => setIsUpgradeOpen(true)} size="lg">
                            Upgrade to Premium
                        </Button>
                    </div>
                </div>
                <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
            </div>
        );
    }

    return (
        <div className="bills-page animate-fade-in">
            <PageHeader
                title="Upcoming Bills"
                subtitle="Predicted recurring expenses based on your history."
                icon={<Calendar size={22} />}
            />

            {loading ? (
                <p className="bills-loading">Analyzing your expense history...</p>
            ) : bills.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Clock size={32} />}
                        title="No recurring bills detected"
                        description="Add recurring expenses like Netflix or Rent monthly and I'll start predicting them here."
                    />
                </Card>
            ) : (
                <div className="bills-list stagger-children">
                    {bills.map(bill => {
                        const daysDue = getDaysDue(bill.nextDueDate);
                        const isOverdue = daysDue < 0;
                        const isSoon = daysDue >= 0 && daysDue <= 3;
                        const statusColor = isOverdue ? 'var(--accent-danger)'
                            : isSoon ? 'var(--accent-warning)'
                            : 'var(--accent-success)';

                        return (
                            <Card key={bill.id} className="bill-card flat">
                                <div className="bill-status-bar"
                                    style={{ backgroundColor: statusColor }} />

                                <div className="bill-content">
                                    <div className="bill-left">
                                        <div className="bill-icon-wrap" style={{ color: statusColor }}>
                                            {isOverdue ? <AlertTriangle size={20} />
                                                : isSoon ? <Clock size={20} />
                                                : <CheckCircle size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="bill-title">{bill.title}</h3>
                                            <p className="bill-meta">
                                                ~{formatCurrency(bill.averageAmount)} monthly
                                                {' · '}
                                                <span style={{
                                                    color: bill.confidence > 0.8 ? 'var(--accent-success)' : 'var(--accent-warning)'
                                                }}>
                                                    {Math.round(bill.confidence * 100)}% confident
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bill-right">
                                        <div className="bill-date-box">
                                            <span className="bill-month">
                                                {bill.nextDueDate.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="bill-day">{bill.nextDueDate.getDate()}</span>
                                        </div>
                                        <div className="bill-days" style={{ color: statusColor }}>
                                            {isOverdue ? `${Math.abs(daysDue)}d ago`
                                                : daysDue === 0 ? 'Today'
                                                : `${daysDue}d left`}
                                        </div>
                                        {(isOverdue || isSoon) && (
                                            <span className="bill-badge" style={{
                                                backgroundColor: `${statusColor}20`,
                                                color: statusColor,
                                                borderColor: `${statusColor}30`
                                            }}>
                                                {isOverdue ? 'Overdue' : 'Due Soon'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Bills;
