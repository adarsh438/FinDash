import { useEffect, useState } from 'react';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Safety timeout in case Firestore hangs or permissions fail
        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
            setLoading(false);
            clearTimeout(safetyTimer);
        });

        return () => {
            unsubscribe();
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
                    <Skeleton type="text" width={250} height={32} />
                    <Skeleton type="text" width={350} height={20} style={{ marginTop: '0.5rem' }} />
                </div>

                <div className="stats-grid">
                    <Skeleton type="rect" height={140} style={{ borderRadius: '16px' }} />
                    <Skeleton type="rect" height={140} style={{ borderRadius: '16px' }} />
                    <Skeleton type="rect" height={140} style={{ borderRadius: '16px' }} />
                </div>

                <div className="recent-section">
                    <Skeleton type="rect" height={250} style={{ borderRadius: '24px' }} />
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
                                category={expense.category as any}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
