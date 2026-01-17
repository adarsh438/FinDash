import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import './Dashboard.css'; // Reusing dashboard styles

const Analytics = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 1. Calculate Weekly Spending Trend (Last 7 Days)
    const getWeeklyData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const data = last7Days.map(date => {
            const dayTotal = expenses
                .filter(e => e.date === date && e.category !== 'income')
                .reduce((sum, e) => sum + e.amount, 0);

            return {
                date,
                dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                amount: dayTotal
            };
        });

        return data;
    };

    const weeklyData = getWeeklyData();
    const maxAmount = Math.max(...weeklyData.map(d => d.amount), 1); // Avoid div by zero

    // 2. Monthly Summary
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === currentMonth && e.category !== 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const monthlyIncome = expenses
        .filter(e => new Date(e.date).getMonth() === currentMonth && e.category === 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const savingsRate = monthlyIncome > 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
        : 0;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <BarChart3 size={32} color="var(--accent-primary)" />
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Analytics</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>This Month's Spending</p>
                            <h2>{formatCurrency(monthlyExpenses)}</h2>
                        </div>
                        <Calendar size={24} color="var(--text-secondary)" />
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Savings Rate</p>
                            <h2 style={{ color: savingsRate > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                {savingsRate.toFixed(1)}%
                            </h2>
                        </div>
                        <TrendingUp size={24} color={savingsRate > 0 ? 'var(--accent-success)' : 'var(--accent-danger)'} />
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem' }}>Last 7 Days Spending</h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '200px',
                    gap: '1rem'
                }}>
                    {weeklyData.map((day) => {
                        const heightPercentage = (day.amount / maxAmount) * 100;
                        return (
                            <div key={day.date} style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(heightPercentage, 2)}%`, // Min 2% height for visibility
                                    background: 'var(--accent-primary)',
                                    borderRadius: '4px',
                                    opacity: 0.8,
                                    transition: 'height 0.5s ease-out',
                                    minHeight: '4px'
                                }} title={`${day.date}: ${formatCurrency(day.amount)}`} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {day.dayName}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
