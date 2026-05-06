import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Coins, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { goalService, type Goal } from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import './Goals.css';

const GOAL_COLORS = ['#6366f1','#a855f7','#10b981','#f59e0b','#ef4444','#06b6d4'];

const Goals = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isFundOpen, setIsFundOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [pickedColor, setPickedColor] = useState(GOAL_COLORS[0]);
    const [fundAmount, setFundAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const unsub = goalService.subscribeToGoals(currentUser.uid, data => {
            setGoals(data); setLoading(false);
        });
        return () => unsub();
    }, [currentUser]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await goalService.addGoal(currentUser.uid, {
                title, targetAmount: parseFloat(targetAmount),
                deadline, color: pickedColor
            });
            setIsAddOpen(false);
            showToast('Goal created!', 'success');
            setTitle(''); setTargetAmount(''); setDeadline(''); setPickedColor(GOAL_COLORS[0]);
        } catch (err: any) {
            showToast(err.message || 'Failed', 'error');
        } finally { setIsSubmitting(false); }
    };

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal) return;
        setIsSubmitting(true);
        try {
            await goalService.addFunds(selectedGoal.id!, selectedGoal.currentAmount, parseFloat(fundAmount));
            setIsFundOpen(false);
            showToast('Funds added!', 'success');
            setFundAmount('');
        } catch (err: any) {
            showToast(err.message || 'Failed', 'error');
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (goalId: string) => {
        try {
            await goalService.deleteGoal(goalId);
            showToast('Goal deleted', 'info');
        } catch { showToast('Failed to delete', 'error'); }
    };

    const getDaysRemaining = (deadline: string) => {
        const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
        return diff;
    };

    return (
        <div className="goals-page animate-fade-in">
            <PageHeader
                title="Financial Goals"
                subtitle="Save with intention. Reach your targets."
                icon={<Target size={22} />}
                action={<Button icon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>New Goal</Button>}
            />

            {loading ? <p className="loading-text">Loading goals...</p>
            : goals.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Target size={32} />}
                        title="No goals yet"
                        description="Create your first savings goal and start tracking progress."
                        actionLabel="Create Goal"
                        onAction={() => setIsAddOpen(true)}
                    />
                </Card>
            ) : (
                <div className="goals-grid stagger-children">
                    {goals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const isComplete = progress >= 100;
                        const daysLeft = getDaysRemaining(goal.deadline);

                        return (
                            <Card key={goal.id} className={`goal-card ${isComplete ? 'complete' : ''}`}
                                style={{ '--goal-color': goal.color } as React.CSSProperties}>
                                <div className="goal-accent-bar" />

                                <div className="goal-top">
                                    <div>
                                        <div className="goal-title-row">
                                            <h3>{goal.title}</h3>
                                            {isComplete && <CheckCircle size={16} className="complete-icon" />}
                                        </div>
                                        <p className="goal-target">
                                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                        </p>
                                    </div>
                                    <button className="goal-delete-btn" onClick={() => handleDelete(goal.id!)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="goal-progress-section">
                                    <div className="goal-progress-bar-bg">
                                        <div
                                            className="goal-progress-bar-fill"
                                            style={{
                                                width: `${progress}%`,
                                                background: isComplete
                                                    ? 'var(--accent-success)'
                                                    : `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`,
                                                boxShadow: `0 0 10px ${goal.color}60`
                                            }}
                                        />
                                    </div>
                                    <div className="goal-progress-labels">
                                        <span>{Math.round(progress)}% funded</span>
                                        <span className={`days-badge ${daysLeft < 0 ? 'overdue' : daysLeft < 30 ? 'soon' : ''}`}>
                                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue`
                                             : daysLeft === 0 ? 'Due today!'
                                             : `${daysLeft}d left`}
                                        </span>
                                    </div>
                                </div>

                                {!isComplete && (
                                    <button className="add-funds-btn"
                                        onClick={() => { setSelectedGoal(goal); setIsFundOpen(true); }}
                                        style={{ '--goal-color': goal.color } as React.CSSProperties}>
                                        <Coins size={14} /> Add Funds
                                    </button>
                                )}
                                {isComplete && (
                                    <div className="goal-complete-badge">
                                        🎉 Goal Achieved!
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Goal">
                <form onSubmit={handleAdd}>
                    <Input label="Goal Title" placeholder="e.g. New Laptop" value={title}
                        onChange={e => setTitle(e.target.value)} required />
                    <Input label="Target Amount" type="number" placeholder="0.00" value={targetAmount}
                        onChange={e => setTargetAmount(e.target.value)} required min="1" />
                    <Input label="Target Date" type="date" value={deadline}
                        onChange={e => setDeadline(e.target.value)} required />
                    <div className="input-group">
                        <label className="input-label">Color</label>
                        <div className="color-picker">
                            {GOAL_COLORS.map(c => (
                                <button key={c} type="button"
                                    className={`color-swatch ${pickedColor === c ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setPickedColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>Create Goal</Button>
                    </div>
                </form>
            </Modal>

            {/* Fund Modal */}
            <Modal isOpen={isFundOpen} onClose={() => setIsFundOpen(false)}
                title={`Fund: ${selectedGoal?.title || ''}`}>
                <form onSubmit={handleFund}>
                    <p className="fund-current">
                        Currently saved: <strong>{formatCurrency(selectedGoal?.currentAmount || 0)}</strong>
                        {' '}of{' '}<strong>{formatCurrency(selectedGoal?.targetAmount || 0)}</strong>
                    </p>
                    <Input label="Amount to Add" type="number" placeholder="0.00" value={fundAmount}
                        onChange={e => setFundAmount(e.target.value)} required min="1" />
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsFundOpen(false)}>Cancel</Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>Add Funds</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Goals;
