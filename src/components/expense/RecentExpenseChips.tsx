import { motion } from 'framer-motion';
import type { Expense } from '../../services/expenseService';

interface RecentExpenseChipsProps {
    expenses: Expense[];
    onSelect: (expense: Expense) => void;
}

const RecentExpenseChips: React.FC<RecentExpenseChipsProps> = ({ expenses, onSelect }) => {
    // Deduplicate by title, keep most recent, limit to 5
    const unique = expenses
        .filter(e => e.category !== 'income')
        .reduce((acc, e) => {
            const key = e.title.toLowerCase();
            if (!acc.has(key)) acc.set(key, e);
            return acc;
        }, new Map<string, Expense>());

    const recent = Array.from(unique.values()).slice(0, 5);

    if (recent.length === 0) return null;

    return (
        <div>
            <p className="expense-section-label">📋 Recent</p>
            <div className="recent-chips-row">
                {recent.map((e, i) => (
                    <motion.button
                        key={e.id || i}
                        className="recent-chip"
                        onClick={() => onSelect(e)}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                        <span>{e.title}</span>
                        <span className="recent-chip-amount">₹{e.amount.toLocaleString('en-IN')}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default RecentExpenseChips;
