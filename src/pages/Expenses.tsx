import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
// Reuse dashboard css for simplicity or create new one if needed
import './Dashboard.css';
import { ShoppingBag, Coffee, Home, DollarSign, HelpCircle, ArrowUp } from 'lucide-react';

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
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

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
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Expense Analysis</h1>

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
        </div>
    );
};

export default Expenses;
