import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
// Reuse dashboard css for simplicity or create new one if needed
import './Dashboard.css';
import { ShoppingBag, Coffee, Home, DollarSign, HelpCircle, ArrowUp, Plus } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';

const CATEGORY_ICONS: Record<string, any> = {
    shopping: ShoppingBag,
    food: Coffee,
    utilities: Home,
    income: DollarSign,
    other: HelpCircle
};

const CATEGORY_COLORS: Record<string, string> = {
    shopping: 'var(--accent-primary)',
    food: 'var(--accent-warning)',
    utilities: 'var(--accent-info)',
    income: 'var(--accent-success)',
    other: 'var(--text-secondary)'
};

const Expenses = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('shopping');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsSubmitting(true);
        try {
            await expenseService.addExpense(currentUser.uid, {
                title,
                amount: parseFloat(amount),
                category: category as any,
                date: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(false);
            showToast("Expense added successfully", "success");
            // Reset form
            setTitle('');
            setAmount('');
            setCategory('shopping');
        } catch (error: any) {
            console.error("Failed to add expense", error);
            showToast(error.message || "Failed to add expense", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate Category Totals
    const categoryTotals = expenses
        .filter(e => e.category !== 'income')
        .reduce((acc, curr) => {
            const cat = curr.category;
            acc[cat] = (acc[cat] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Expense Analysis</h1>
                <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
                    Add Expense
                </Button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)' }}>
                                <ArrowUp size={32} color="var(--accent-danger)" />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-secondary)' }}>Total Spent</p>
                                <h2 style={{ fontSize: '2rem' }}>{formatCurrency(totalSpent)}</h2>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {sortedCategories.map(([category, amount]) => {
                                const Icon = CATEGORY_ICONS[category] || HelpCircle;
                                const color = CATEGORY_COLORS[category] || 'var(--text-secondary)';
                                const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

                                return (
                                    <div key={category}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Icon size={16} color={color} />
                                                <span style={{ textTransform: 'capitalize' }}>{category}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 600 }}>{formatCurrency(amount)}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                    ({Math.round(percentage)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: color,
                                                borderRadius: '3px',
                                                transition: 'width 0.5s ease-out'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card>
                        <h3>Top Spending</h3>
                        {sortedCategories.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                                <div style={{
                                    width: '180px',
                                    height: '180px',
                                    borderRadius: '50%',
                                    border: `12px solid ${CATEGORY_COLORS[sortedCategories[0][0]]}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    boxShadow: `0 0 20px -5px ${CATEGORY_COLORS[sortedCategories[0][0]]}`
                                }}>
                                    <ShoppingBag size={32} color={CATEGORY_COLORS[sortedCategories[0][0]]} />
                                    <span style={{ marginTop: '0.5rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                        {sortedCategories[0][0]}
                                    </span>
                                </div>
                                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    You spend the most on <span style={{ color: 'var(--text-primary)' }}>{sortedCategories[0][0]}</span>.
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No expense data available.
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Expense"
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        label="Description"
                        placeholder="e.g. Grocery Shopping"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                            className="glass-input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="shopping">Shopping</option>
                            <option value="food">Food & Dining</option>
                            <option value="utilities">Utilities</option>
                            <option value="income">Income</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button type="submit" style={{ flex: 1 }} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Expense'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
