import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ExpenseCategory } from '../../services/expenseService';

interface CategoryItem {
    value: ExpenseCategory;
    label: string;
    emoji: string;
}

const CATEGORIES: CategoryItem[] = [
    { value: 'food',          label: 'Food',           emoji: '🍔' },
    { value: 'transport',     label: 'Transport',      emoji: '🚗' },
    { value: 'shopping',      label: 'Shopping',       emoji: '🛍' },
    { value: 'entertainment', label: 'Entertainment',  emoji: '🎬' },
    { value: 'health',        label: 'Health',         emoji: '💊' },
    { value: 'rent',          label: 'Rent',           emoji: '🏠' },
    { value: 'education',     label: 'Education',      emoji: '📚' },
    { value: 'work',          label: 'Work',           emoji: '💼' },
    { value: 'travel',        label: 'Travel',         emoji: '✈️' },
    { value: 'other',         label: 'Other',          emoji: '📦' },
];

export { CATEGORIES };

interface CategorySelectorProps {
    selected: ExpenseCategory;
    onChange: (category: ExpenseCategory) => void;
    error?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onChange, error }) => {
    return (
        <div>
            <p className="expense-section-label">🏷️ Category</p>
            <div className="category-grid">
                {CATEGORIES.map((cat, i) => (
                    <motion.button
                        key={cat.value}
                        className={`category-card ${selected === cat.value ? 'selected' : ''}`}
                        onClick={() => onChange(cat.value)}
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.025, duration: 0.2 }}
                    >
                        {selected === cat.value && (
                            <motion.div
                                className="category-check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                                <Check />
                            </motion.div>
                        )}
                        <span className="category-emoji">{cat.emoji}</span>
                        <span className="category-label">{cat.label}</span>
                    </motion.button>
                ))}
            </div>
            {error && (
                <motion.p
                    className="field-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '0.4rem' }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default CategorySelector;
