import { motion } from 'framer-motion';
import { useCurrency } from '../../context/CurrencyContext';
import type { Budget } from '../../services/expenseService';

interface BudgetProgressProps {
    budget: Budget | null;
    currentMonthSpend: number;
    pendingAmount: number; // the amount user is typing
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budget, currentMonthSpend, pendingAmount }) => {
    if (!budget) return null;

    const { formatCurrency } = useCurrency();
    const totalAfter = currentMonthSpend + pendingAmount;
    const remaining = budget.amount - currentMonthSpend;
    const remainingAfter = budget.amount - totalAfter;
    const percentUsed = Math.min((totalAfter / budget.amount) * 100, 100);
    const overBudget = remainingAfter < 0;
    const isWarning = remainingAfter >= 0 && remainingAfter < budget.amount * 0.2;

    const statusClass = overBudget ? 'danger' : isWarning ? 'warning' : '';
    const barColor = overBudget
        ? 'linear-gradient(90deg, #ef4444, #f97316)'
        : isWarning
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
            : 'linear-gradient(90deg, #6366f1, #a855f7)';

    return (
        <motion.div
            className={`budget-progress-card ${statusClass}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{
                opacity: 1,
                y: 0,
                ...(overBudget ? { x: [0, -3, 3, -2, 2, 0] } : {}),
            }}
            transition={{ duration: overBudget ? 0.4 : 0.3 }}
        >
            <div className="budget-header">
                <span className="budget-title">Monthly Budget</span>
                <span
                    className="budget-remaining-value"
                    style={{ color: overBudget ? 'var(--accent-danger)' : isWarning ? 'var(--accent-warning)' : 'var(--accent-success)' }}
                >
                    {formatCurrency(Math.abs(remainingAfter))} {overBudget ? 'over' : 'left'}
                </span>
            </div>

            <div className="budget-bar-bg">
                <motion.div
                    className="budget-bar-fill"
                    style={{ background: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentUsed}%` }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                />
            </div>

            <div className="budget-stats">
                <span>Budget: <span className="budget-stat-value">{formatCurrency(budget.amount)}</span></span>
                <span>Spent: <span className="budget-stat-value">{formatCurrency(currentMonthSpend)}</span></span>
                <span>Remaining: <span className="budget-stat-value">{formatCurrency(remaining)}</span></span>
            </div>

            {overBudget && (
                <motion.div
                    className="budget-warning-msg"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    ⚠️ This expense exceeds your monthly budget.
                </motion.div>
            )}
        </motion.div>
    );
};

export default BudgetProgress;
