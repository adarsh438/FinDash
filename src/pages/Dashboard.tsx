import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Plus, Target, Clock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/StatCard';
import TransactionRow from '../components/TransactionRow';
import SafeToSpendWidget from '../components/SafeToSpendWidget';
import BudgetModal from '../components/BudgetModal';
import Skeleton from '../components/Skeleton';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const navigate = useNavigate();
    const {
        loading, expenses, budget,
        currentMonthIncome, currentMonthSpend, balance,
        currentMonthExpenses, deleteExpense
    } = useExpenses();

    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    const daysRemaining = (() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return Math.max(lastDay.getDate() - now.getDate(), 1);
    })();

    // Last month comparison for trend
    const lastMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        const now = new Date();
        return d.getMonth() === (now.getMonth() - 1 + 12) % 12 &&
               d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()) &&
               e.category !== 'income';
    });
    const lastMonthSpend = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const spendTrend = lastMonthSpend > 0
        ? ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100
        : 0;

    const recentTransactions = currentMonthExpenses.slice(0, 6);

    const handleDelete = useCallback(async (id: string) => {
        await deleteExpense(id);
    }, [deleteExpense]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <Skeleton height={80} style={{ borderRadius: 16, marginBottom: '2rem' }} />
                <Skeleton height={140} style={{ borderRadius: 16, marginBottom: '2rem' }} />
                <div className="stats-grid">
                    {[1,2,3].map(i => <Skeleton key={i} height={130} style={{ borderRadius: 16 }} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fade-in">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-greeting">
                        Good {getTimeOfDay()}, <span className="gradient-text">{currentUser?.displayName?.split(' ')[0] || 'there'}</span> 👋
                    </h1>
                    <p className="dashboard-subtitle">Here's your financial overview for {getCurrentMonth()}.</p>
                </div>
                <div className="dashboard-quick-actions">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={<Target size={15} />}
                        onClick={() => setIsBudgetModalOpen(true)}
                    >
                        Set Budget
                    </Button>
                    <Button
                        size="sm"
                        icon={<Plus size={15} />}
                        onClick={() => navigate('/expenses')}
                    >
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Safe to Spend */}
            <div className="safe-section">
                <SafeToSpendWidget
                    budget={budget}
                    totalSpentMonth={currentMonthSpend}
                    daysRemaining={daysRemaining}
                    onSetBudget={() => setIsBudgetModalOpen(true)}
                />
            </div>

            {/* Stats */}
            <div className="stats-grid stagger-children">
                <StatCard
                    label="Balance"
                    value={formatCurrency(balance)}
                    icon={<Wallet size={18} />}
                    accentColor="var(--accent-primary)"
                />
                <StatCard
                    label="Income"
                    value={formatCurrency(currentMonthIncome)}
                    icon={<TrendingUp size={18} />}
                    accentColor="var(--accent-success)"
                />
                <StatCard
                    label="Expenses"
                    value={formatCurrency(currentMonthSpend)}
                    icon={<TrendingDown size={18} />}
                    trend={spendTrend}
                    accentColor="var(--accent-danger)"
                />
            </div>

            {/* Recent Transactions */}
            <div className="recent-section">
                <div className="section-header">
                    <div className="section-title">
                        <Clock size={17} />
                        <h2>Recent Activity</h2>
                    </div>
                    <button className="view-all-btn" onClick={() => navigate('/transactions')}>
                        View All <ArrowRight size={14} />
                    </button>
                </div>

                <div className="transactions-card">
                    {recentTransactions.length === 0 ? (
                        <div className="no-transactions">
                            <Zap size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <p>No transactions this month yet.</p>
                            <button className="add-first-btn" onClick={() => navigate('/expenses')}>
                                + Add your first expense
                            </button>
                        </div>
                    ) : (
                        <div className="stagger-children">
                            {recentTransactions.map((expense) => (
                                <TransactionRow
                                    key={expense.id}
                                    id={expense.id}
                                    title={expense.title}
                                    date={expense.date}
                                    amount={expense.category === 'income' ? expense.amount : -expense.amount}
                                    category={expense.category}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
            />
        </div>
    );
};

function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

function getCurrentMonth() {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default Dashboard;
