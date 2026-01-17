import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Coins } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { goalService, type Goal } from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';
import './Goals.css';

const Goals = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);

    // Add Goal Form
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    // Fund Goal Form
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [fundAmount, setFundAmount] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = goalService.subscribeToGoals(currentUser.uid, (data) => {
            setGoals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            await goalService.addGoal(currentUser.uid, {
                title,
                targetAmount: parseFloat(targetAmount),
                deadline,
                color: 'var(--accent-primary)' // Default color for now
            });
            setIsAddModalOpen(false);
            setTitle('');
            setTargetAmount('');
            setDeadline('');
        } catch (error) {
            console.error("Failed to add goal", error);
        }
    };

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal || !fundAmount) return;

        try {
            await goalService.addFunds(selectedGoal.id!, selectedGoal.currentAmount, parseFloat(fundAmount));
            setIsFundModalOpen(false);
            setFundAmount('');
            setSelectedGoal(null);
        } catch (error) {
            console.error("Failed to add funds", error);
        }
    };

    const handleDelete = async (goalId: string) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            await goalService.deleteGoal(goalId);
        }
    };

    const openFundModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsFundModalOpen(true);
    };

    return (
        <div className="goals-container">
            <div className="goals-header">
                <div>
                    <h1>Financial Goals</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your savings and reach your targets.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />}>
                    New Goal
                </Button>
            </div>

            {loading ? (
                <p>Loading goals...</p>
            ) : goals.length === 0 ? (
                <Card className="empty-state">
                    <Target size={48} style={{ opacity: 0.5 }} />
                    <h3>No goals yet</h3>
                    <p>Start saving for something special today.</p>
                    <Button variant="ghost" onClick={() => setIsAddModalOpen(true)}>Create your first goal</Button>
                </Card>
            ) : (
                <div className="goals-grid">
                    {goals.map((goal) => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        return (
                            <Card key={goal.id} className="goal-card" style={{ '--card-color': goal.color } as any}>
                                <div className="goal-header">
                                    <div>
                                        <h3>{goal.title}</h3>
                                        <span className="goal-target">Target: {formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    <Target size={20} color={goal.color} />
                                </div>

                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span>{formatCurrency(goal.currentAmount)}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        By {new Date(goal.deadline).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="goal-actions">
                                    <button className="add-funds-btn" onClick={() => openFundModal(goal)}>
                                        <Coins size={14} style={{ display: 'inline', marginRight: '4px' }} /> Add Funds
                                    </button>
                                    <button className="delete-goal-btn" onClick={() => handleDelete(goal.id!)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create New Goal"
            >
                <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Goal Title"
                        placeholder="e.g. New Laptop"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        label="Target Amount"
                        type="number"
                        placeholder="0.00"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                    />
                    <Input
                        label="Target Date"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <Button type="submit" style={{ marginTop: '1rem' }}>Create Goal</Button>
                </form>
            </Modal>

            {/* Add Funds Modal */}
            <Modal
                isOpen={isFundModalOpen}
                onClose={() => setIsFundModalOpen(false)}
                title={`Add Funds to ${selectedGoal?.title}`}
            >
                <form onSubmit={handleAddFunds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        You currently have {formatCurrency(selectedGoal?.currentAmount || 0)} saved via this app.
                    </p>
                    <Input
                        label="Amount to Add"
                        type="number"
                        placeholder="0.00"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                    />
                    <Button type="submit" style={{ marginTop: '1rem' }}>Add Funds</Button>
                </form>
            </Modal>
        </div>
    );
};

export default Goals;
