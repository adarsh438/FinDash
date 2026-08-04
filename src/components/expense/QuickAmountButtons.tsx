import { motion } from 'framer-motion';

interface QuickAmountButtonsProps {
    currentAmount: string;
    onSelect: (amount: number) => void;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({ currentAmount, onSelect }) => {
    return (
        <div className="quick-amounts">
            {QUICK_AMOUNTS.map((amt, i) => (
                <motion.button
                    key={amt}
                    className={`quick-amount-btn ${currentAmount === amt.toString() ? 'selected' : ''}`}
                    onClick={() => onSelect(amt)}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                    ₹{amt.toLocaleString('en-IN')}
                </motion.button>
            ))}
        </div>
    );
};

export default QuickAmountButtons;
