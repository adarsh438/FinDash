import { motion } from 'framer-motion';

export type PaymentMethod = 'cash' | 'bank' | 'credit_card' | 'upi' | 'wallet';

interface PaymentOption {
    value: PaymentMethod;
    label: string;
    emoji: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
    { value: 'cash',        label: 'Cash',        emoji: '💵' },
    { value: 'bank',        label: 'Bank',        emoji: '🏦' },
    { value: 'credit_card', label: 'Credit Card', emoji: '💳' },
    { value: 'upi',         label: 'UPI',         emoji: '📱' },
    { value: 'wallet',      label: 'Wallet',      emoji: '💰' },
];

interface PaymentMethodSelectorProps {
    selected: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selected, onChange }) => {
    return (
        <div>
            <p className="expense-section-label">💳 Payment Method</p>
            <div className="payment-methods">
                {PAYMENT_METHODS.map((pm, i) => (
                    <motion.button
                        key={pm.value}
                        className={`payment-pill ${selected === pm.value ? 'selected' : ''}`}
                        onClick={() => onChange(pm.value)}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                        <span className="payment-emoji">{pm.emoji}</span>
                        {pm.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;
