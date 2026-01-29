import { useEffect, useState, useCallback } from 'react';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import Skeleton from '../components/Skeleton';
import SafeToSpendWidget from '../components/SafeToSpendWidget';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense, type Budget } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);

    const daysRemaining = (() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return lastDay.getDate() - now.getDate();
    })();

    const handleSetBudget = useCallback(async () => {
        if (!currentUser) return;
        const amountStr = prompt("Enter your monthly budget amount (₹):", budget?.amount.toString() || "5000");
        if (amountStr && !isNaN(parseFloat(amountStr))) {
            const amount = parseFloat(amountStr);
            try {
                await expenseService.setBudget(currentUser.uid, amount, 'monthly');
                showToast(`Budget set to ${formatCurrency(amount)}`, 'success');
            } catch (error) {
                console.error(error);
                showToast("Failed to update budget", 'error');
            }
        }
    }, [currentUser, budget, formatCurrency, showToast]);

    useEffect(() => {
        if (!currentUser) return;

        // Safety timeout
        const safetyTimer = setTimeout(() => setLoading(false), 5000);

        const unsubscribeExpenses = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
            setLoading(false); // Ensure loading is false when data arrives
            clearTimeout(safetyTimer);
        });

        const unsubscribeBudget = expenseService.subscribeToBudget(currentUser.uid, (data) => {
            setBudget(data);
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeBudget();
            clearTimeout(safetyTimer);
        };
    }, [currentUser]);

    const totalIncome = expenses
        .filter(e => e.category === 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expenses
        .filter(e => e.category !== 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpenses;
    const recentTransactions = expenses.slice(0, 5);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <Skeleton width={250} height={32} />
                    <Skeleton width={350} height={20} style={{ marginTop: '0.5rem' }} />
                </div>

                <div className="safe-section" style={{ marginBottom: '1.5rem' }}>
                    <Skeleton height={180} style={{ borderRadius: '16px' }} />
                </div>

                <div className="stats-grid">
                    <Skeleton height={140} style={{ borderRadius: '16px' }} />
                    <Skeleton height={140} style={{ borderRadius: '16px' }} />
                    <Skeleton height={140} style={{ borderRadius: '16px' }} />
                </div>

                <div className="recent-section">
                    <Skeleton height={250} style={{ borderRadius: '24px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
                <p>Here's what's happening with your money today.</p>
            </div>

            <div className="safe-section" style={{ marginBottom: '1.5rem' }}>
                <SafeToSpendWidget
                    budget={budget}
                    totalSpentMonth={totalExpenses} // Note: This assumes all fetched expenses are this month. For prod, we need filtering.
                    daysRemaining={daysRemaining}
                    onSetBudget={handleSetBudget}
                />
            </div>

            <div className="stats-grid">
                <Card className="stat-card balance">
                    <div className="stat-icon">
                        <Wallet size={24} color="white" />
                    </div>
                    <div>
                        <h3>Total Balance</h3>
                        <p className="stat-value">{formatCurrency(balance)}</p>
                    </div>
                </Card>

                <Card className="stat-card income">
                    <div className="stat-icon income">
                        <TrendingUp size={24} color="var(--accent-success)" />
                    </div>
                    <div>
                        <h3>Income</h3>
                        <p className="stat-value">{formatCurrency(totalIncome)}</p>
                    </div>
                </Card>

                <Card className="stat-card expense">
                    <div className="stat-icon expense">
                        <TrendingDown size={24} color="var(--accent-danger)" />
                    </div>
                    <div>
                        <h3>Expenses</h3>
                        <p className="stat-value">{formatCurrency(totalExpenses)}</p>
                    </div>
                </Card>
            </div>

            <div className="recent-section">
                <div className="section-header">
                    <h2><Clock size={20} /> Recent Activity</h2>
                    <button className="view-all-btn" onClick={() => navigate('/expenses')}>
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <div className="transactions-list">
                    {recentTransactions.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            <p>No recent transactions.</p>
                        </Card>
                    ) : (
                        recentTransactions.map((expense) => (
                            <TransactionRow
                                key={expense.id}
                                title={expense.title}
                                date={expense.date}
                                amount={expense.category === 'income' ? expense.amount : -expense.amount}
                                category={expense.category}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
