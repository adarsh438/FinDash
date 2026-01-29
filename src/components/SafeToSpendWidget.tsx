import React, { useMemo } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import Card from './Card';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { type Budget } from '../services/expenseService';

interface SafeToSpendWidgetProps {
    budget: Budget | null;
    totalSpentMonth: number;
    daysRemaining: number;
    onSetBudget: () => void;
}

const SafeToSpendWidget: React.FC<SafeToSpendWidgetProps> = ({
    budget,
    totalSpentMonth,
    daysRemaining,
    onSetBudget
}) => {
    const { formatCurrency } = useCurrency();

    const safeStats = useMemo(() => {
        if (!budget) return null;

        const remainingBudget = budget.amount - totalSpentMonth;
        const dailySafe = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;
        const weeklySafe = dailySafe * 7;

        const status = remainingBudget <= 0
            ? 'critical'
            : remainingBudget < (budget.amount * 0.2)
                ? 'warning'
                : 'success';

        return { remainingBudget, dailySafe, weeklySafe, status };
    }, [budget, totalSpentMonth, daysRemaining]);

    if (!budget) {
        return (
            <Card className="safe-to-spend-card empty">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="icon-bg" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', margin: '0 auto 1rem', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                    <h3>Set a Monthly Budget</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Track your "Safe to Spend" limit by setting a budget.
                    </p>
                    <button
                        onClick={onSetBudget}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Set Budget
                    </button>
                </div>
            </Card>
        );
    }

    const { remainingBudget, dailySafe, status } = safeStats!;
    const statusColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';

    return (
        <Card className="safe-to-spend-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Safe to Spend</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Allowance</p>
                </div>
                <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: `${statusColor}20`,
                    color: statusColor,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {status === 'critical' ? 'Over Budget' : `${daysRemaining} Days Left`}
                </div>
            </div>

            <div className="stats-row" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ fontSize: '2rem', color: statusColor }}>{formatCurrency(dailySafe)}</h2>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>/ day</span>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining: <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(remainingBudget)}</span></span>
                <span style={{ color: 'var(--text-secondary)' }}>
                    Budget: <span style={{ color: 'var(--text-primary)', marginRight: '8px' }}>{formatCurrency(budget.amount)}</span>
                    <button
                        onClick={onSetBudget}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--accent-primary)',
                            padding: 0,
                            fontSize: '0.8rem',
                            textDecoration: 'underline'
                        }}
                    >
                        Edit
                    </button>
                </span>
            </div>
        </Card>
    );
};

export default SafeToSpendWidget;
