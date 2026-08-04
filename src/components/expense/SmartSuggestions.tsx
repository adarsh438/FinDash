import { motion, AnimatePresence } from 'framer-motion';
import type { ExpenseCategory } from '../../services/expenseService';
import type { PaymentMethod } from './PaymentMethodSelector';

interface SmartSuggestion {
    category: ExpenseCategory;
    paymentMethod?: PaymentMethod;
    emoji: string;
    label: string;
}

const SUGGESTION_MAP: Record<string, SmartSuggestion> = {
    coffee: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    tea: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    lunch: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    dinner: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    breakfast: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    snacks: { category: 'food', paymentMethod: 'cash', emoji: '🍔', label: 'Food · Cash' },
    groceries: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    zomato: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    swiggy: { category: 'food', paymentMethod: 'upi', emoji: '🍔', label: 'Food · UPI' },
    fuel: { category: 'transport', emoji: '🚗', label: 'Transport' },
    petrol: { category: 'transport', emoji: '🚗', label: 'Transport' },
    diesel: { category: 'transport', emoji: '🚗', label: 'Transport' },
    uber: { category: 'transport', paymentMethod: 'upi', emoji: '🚗', label: 'Transport · UPI' },
    ola: { category: 'transport', paymentMethod: 'upi', emoji: '🚗', label: 'Transport · UPI' },
    rapido: { category: 'transport', paymentMethod: 'upi', emoji: '🚗', label: 'Transport · UPI' },
    metro: { category: 'transport', emoji: '🚗', label: 'Transport' },
    bus: { category: 'transport', emoji: '🚗', label: 'Transport' },
    netflix: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    spotify: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    disney: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    hotstar: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    prime: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    youtube: { category: 'entertainment', paymentMethod: 'credit_card', emoji: '🎬', label: 'Entertainment · Card' },
    movie: { category: 'entertainment', emoji: '🎬', label: 'Entertainment' },
    rent: { category: 'rent', paymentMethod: 'bank', emoji: '🏠', label: 'Rent · Bank' },
    hostel: { category: 'rent', paymentMethod: 'bank', emoji: '🏠', label: 'Rent · Bank' },
    electricity: { category: 'rent', paymentMethod: 'upi', emoji: '🏠', label: 'Rent · UPI' },
    water: { category: 'rent', paymentMethod: 'upi', emoji: '🏠', label: 'Rent · UPI' },
    books: { category: 'education', emoji: '📚', label: 'Education' },
    tuition: { category: 'education', paymentMethod: 'bank', emoji: '📚', label: 'Education · Bank' },
    course: { category: 'education', emoji: '📚', label: 'Education' },
    udemy: { category: 'education', paymentMethod: 'credit_card', emoji: '📚', label: 'Education · Card' },
    medicine: { category: 'health', emoji: '💊', label: 'Health' },
    doctor: { category: 'health', emoji: '💊', label: 'Health' },
    hospital: { category: 'health', paymentMethod: 'credit_card', emoji: '💊', label: 'Health · Card' },
    pharmacy: { category: 'health', paymentMethod: 'upi', emoji: '💊', label: 'Health · UPI' },
    gym: { category: 'health', paymentMethod: 'upi', emoji: '💊', label: 'Health · UPI' },
    amazon: { category: 'shopping', paymentMethod: 'credit_card', emoji: '🛍', label: 'Shopping · Card' },
    flipkart: { category: 'shopping', paymentMethod: 'credit_card', emoji: '🛍', label: 'Shopping · Card' },
    myntra: { category: 'shopping', paymentMethod: 'credit_card', emoji: '🛍', label: 'Shopping · Card' },
    clothes: { category: 'shopping', emoji: '🛍', label: 'Shopping' },
    shoes: { category: 'shopping', emoji: '🛍', label: 'Shopping' },
    flight: { category: 'travel', paymentMethod: 'credit_card', emoji: '✈️', label: 'Travel · Card' },
    train: { category: 'travel', emoji: '✈️', label: 'Travel' },
    hotel: { category: 'travel', paymentMethod: 'credit_card', emoji: '✈️', label: 'Travel · Card' },
};

function getSuggestions(title: string): SmartSuggestion[] {
    if (!title || title.length < 2) return [];
    const lower = title.toLowerCase().trim();
    const results: SmartSuggestion[] = [];
    const seen = new Set<string>();

    for (const [keyword, suggestion] of Object.entries(SUGGESTION_MAP)) {
        if (lower.includes(keyword) || keyword.includes(lower)) {
            const key = suggestion.category + (suggestion.paymentMethod || '');
            if (!seen.has(key)) {
                seen.add(key);
                results.push(suggestion);
            }
        }
    }

    return results.slice(0, 3);
}

interface SmartSuggestionsProps {
    title: string;
    onApply: (category: ExpenseCategory, paymentMethod?: PaymentMethod) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ title, onApply }) => {
    const suggestions = getSuggestions(title);

    return (
        <AnimatePresence>
            {suggestions.length > 0 && (
                <motion.div
                    className="smart-suggestions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
                        💡 Suggest:
                    </span>
                    {suggestions.map((s, i) => (
                        <motion.button
                            key={i}
                            className="smart-suggestion-chip"
                            onClick={() => onApply(s.category, s.paymentMethod)}
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="suggestion-emoji">{s.emoji}</span>
                            {s.label}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SmartSuggestions;
