import React, { useEffect, useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Lock, Plus, Trash2, Check } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import { billService, type RecurringBill, type CustomBill } from '../services/billService';
import { useCurrency } from '../context/CurrencyContext';
import './Bills.css';

const Bills = () => {
    const { currentUser, userProfile } = useAuth();
    const { formatCurrency } = useCurrency();
    const { expenses } = useExpenses();
    const { showToast } = useToast();

    const [predictedBills, setPredictedBills] = useState<RecurringBill[]>([]);
    const [customBills, setCustomBills] = useState<CustomBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Filter tab
    const [activeTab, setActiveTab] = useState<'upcoming' | 'paid'>('upcoming');

    // Add Form state
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!userProfile?.isPremium) {
            setLoading(false);
            return;
        }

        // Predicted bills
        if (expenses.length > 0) {
            const predicted = billService.predictBills(expenses);
            setPredictedBills(predicted);
        }

        // Custom bills subscription
        if (currentUser) {
            const unsub = billService.subscribeToBills(currentUser.uid, (data) => {
                setCustomBills(data);
                setLoading(false);
            });
            return () => unsub();
        } else {
            setLoading(false);
        }
    }, [expenses, currentUser, userProfile]);

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await billService.addBill(currentUser.uid, {
                title: title.trim(),
                amount: parseFloat(amount),
                dueDate,
                frequency
            });
            showToast('Bill reminder created!', 'success');
            setIsAddOpen(false);
            setTitle('');
            setAmount('');
            setDueDate('');
        } catch (err: any) {
            showToast(err.message || 'Failed to add bill', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkPaid = async (billId: string, amt: number, billTitle: string) => {
        if (!currentUser) return;
        try {
            await billService.markBillPaid(currentUser.uid, billId, amt, billTitle);
            showToast(`Marked "${billTitle}" as Paid & recorded expense!`, 'success');
        } catch {
            showToast('Failed to process payment', 'error');
        }
    };

    const handleDeleteBill = async (billId: string) => {
        try {
            await billService.deleteBill(billId);
            showToast('Bill deleted', 'info');
        } catch {
            showToast('Failed to delete bill', 'error');
        }
    };

    const getDaysDue = (dateStr: Date | string) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return Math.ceil((date.getTime() - Date.now()) / 86400000);
    };

    if (!userProfile?.isPremium) {
        return (
            <div className="bills-page animate-fade-in">
                <PageHeader
                    title="Upcoming Bills"
                    subtitle="Predicted recurring expenses and bill payment reminders."
                    icon={<Calendar size={22} />}
                />
                <div className="bills-gate">
                    <div className="bills-gate-card animate-fade-in-scale">
                        <div className="gate-icon-wrap">
                            <Lock size={28} />
                        </div>
                        <h2>Unlock Bill Predictions & Reminders</h2>
                        <p>Track your upcoming recurring bills, mark payments as paid, and never miss a due date again.</p>
                        <Button onClick={() => setIsUpgradeOpen(true)} size="lg">
                            Upgrade to Premium
                        </Button>
                    </div>
                </div>
                <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
            </div>
        );
    }

    // Combine custom and predicted bills
    const allUpcomingCustom = customBills.filter(b => !b.isPaid);
    const allPaidCustom = customBills.filter(b => b.isPaid);

    return (
        <div className="bills-page animate-fade-in">
            <PageHeader
                title="Upcoming Bills & Reminders"
                subtitle="Track subscriptions, recurring bills, and due dates."
                icon={<Calendar size={22} />}
                action={
                    <Button icon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>
                        Add Custom Bill
                    </Button>
                }
            />

            {/* Filter Tabs */}
            <div className="bills-tabs-bar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                    className={`cat-chip ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Bills ({allUpcomingCustom.length + predictedBills.length})
                </button>
                <button
                    className={`cat-chip ${activeTab === 'paid' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paid')}
                >
                    Paid Bills ({allPaidCustom.length})
                </button>
            </div>

            {loading ? (
                <p className="bills-loading">Analyzing recurring expenses and bills...</p>
            ) : activeTab === 'upcoming' ? (
                allUpcomingCustom.length === 0 && predictedBills.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Clock size={32} />}
                            title="No upcoming bills"
                            description="Add custom bills or spend regularly to generate smart predictions."
                            actionLabel="Add Custom Bill"
                            onAction={() => setIsAddOpen(true)}
                        />
                    </Card>
                ) : (
                    <div className="bills-list stagger-children">
                        {/* Render Custom Bills */}
                        {allUpcomingCustom.map(bill => {
                            const daysDue = getDaysDue(bill.dueDate);
                            const isOverdue = daysDue < 0;
                            const isSoon = daysDue >= 0 && daysDue <= 3;
                            const statusColor = isOverdue ? 'var(--accent-danger)'
                                : isSoon ? 'var(--accent-warning)'
                                    : 'var(--accent-success)';

                            return (
                                <Card key={bill.id} className="bill-card flat">
                                    <div className="bill-status-bar" style={{ backgroundColor: statusColor }} />
                                    <div className="bill-content">
                                        <div className="bill-left">
                                            <div className="bill-icon-wrap" style={{ color: statusColor }}>
                                                {isOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="bill-title">{bill.title}</h3>
                                                <p className="bill-meta">
                                                    {formatCurrency(bill.amount)} · <span style={{ textTransform: 'capitalize' }}>{bill.frequency}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bill-right">
                                            <div className="bill-days" style={{ color: statusColor }}>
                                                {isOverdue ? `${Math.abs(daysDue)}d overdue` : daysDue === 0 ? 'Due Today' : `${daysDue}d left`}
                                            </div>

                                            <Button
                                                size="sm"
                                                icon={<Check size={14} />}
                                                onClick={() => bill.id && handleMarkPaid(bill.id, bill.amount, bill.title)}
                                            >
                                                Mark Paid
                                            </Button>

                                            <button className="bill-delete-btn" onClick={() => bill.id && handleDeleteBill(bill.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}

                        {/* Render Predicted Bills */}
                        {predictedBills.map(bill => {
                            const daysDue = getDaysDue(bill.nextDueDate);
                            const isOverdue = daysDue < 0;
                            const isSoon = daysDue >= 0 && daysDue <= 3;
                            const statusColor = isOverdue ? 'var(--accent-danger)'
                                : isSoon ? 'var(--accent-warning)'
                                    : 'var(--accent-success)';

                            return (
                                <Card key={bill.id} className="bill-card flat">
                                    <div className="bill-status-bar" style={{ backgroundColor: statusColor }} />
                                    <div className="bill-content">
                                        <div className="bill-left">
                                            <div className="bill-icon-wrap" style={{ color: statusColor }}>
                                                {isOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="bill-title">{bill.title} <span className="predicted-tag">Smart Prediction</span></h3>
                                                <p className="bill-meta">
                                                    ~{formatCurrency(bill.averageAmount)} monthly ·{' '}
                                                    <span style={{ color: 'var(--accent-success)' }}>
                                                        {Math.round(bill.confidence * 100)}% confidence
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bill-right">
                                            <div className="bill-days" style={{ color: statusColor }}>
                                                {isOverdue ? `${Math.abs(daysDue)}d ago` : daysDue === 0 ? 'Today' : `${daysDue}d left`}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                icon={<Check size={14} />}
                                                onClick={() => handleMarkPaid(bill.id, bill.averageAmount, bill.title)}
                                            >
                                                Mark Paid
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )
            ) : (
                allPaidCustom.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<CheckCircle size={32} />}
                            title="No paid bills recorded yet"
                            description="Bills marked as paid will show up here."
                        />
                    </Card>
                ) : (
                    <div className="bills-list stagger-children">
                        {allPaidCustom.map(bill => (
                            <Card key={bill.id} className="bill-card flat">
                                <div className="bill-status-bar" style={{ backgroundColor: 'var(--accent-success)' }} />
                                <div className="bill-content">
                                    <div className="bill-left">
                                        <div className="bill-icon-wrap" style={{ color: 'var(--accent-success)' }}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="bill-title" style={{ textDecoration: 'line-through', opacity: 0.8 }}>
                                                {bill.title}
                                            </h3>
                                            <p className="bill-meta">
                                                Paid {formatCurrency(bill.amount)}
                                                {bill.paidAt && ` · ${new Date(bill.paidAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bill-right">
                                        <span className="bill-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                            Paid
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            )}

            {/* Add Custom Bill Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Custom Bill">
                <form onSubmit={handleAddBill}>
                    <Input
                        label="Bill Title"
                        placeholder="e.g. Electricity Bill, Broadband"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <Input
                        label="Amount (₹)"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        min="1"
                    />
                    <Input
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                    />
                    <div className="input-group">
                        <label className="input-label">Frequency</label>
                        <select
                            className="glass-input"
                            value={frequency}
                            onChange={e => setFrequency(e.target.value as any)}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>
                            Save Bill
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bills;
