import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ExpenseSuccessOverlayProps {
    amount: string;
    category: string;
}

const ExpenseSuccessOverlay: React.FC<ExpenseSuccessOverlayProps> = ({ amount, category }) => {
    return (
        <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="success-checkmark"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
            >
                <Check size={32} strokeWidth={3} />
            </motion.div>
            <motion.p
                className="success-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Expense Added Successfully
            </motion.p>
            <motion.p
                className="success-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                ₹{Number(amount).toLocaleString('en-IN')} · {category}
            </motion.p>
        </motion.div>
    );
};

export default ExpenseSuccessOverlay;
