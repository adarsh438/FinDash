import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const formatWithCommas = (val: string): string => {
    const num = val.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return val;
    const parts = num.split('.');
    // Indian numbering
    parts[0] = parts[0].replace(/\B(?=(\d{2})+(?=\d{3})(?!\d))/g, ',');
    return parts.join('.');
};

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, error }) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus on mount
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, '');
        // Allow only numbers and one decimal
        if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
            onChange(raw);
        }
    };

    const displayValue = value ? formatWithCommas(value) : '';

    return (
        <motion.div
            className={`amount-input-container ${focused ? 'focused' : ''} ${error ? 'field-error-input' : ''}`}
            animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            <div className="amount-input-wrap">
                <span className="amount-currency">₹</span>
                <input
                    ref={inputRef}
                    className="amount-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-label="Expense amount"
                />
            </div>
            {error && (
                <motion.p
                    className="field-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                >
                    {error}
                </motion.p>
            )}
        </motion.div>
    );
};

export default AmountInput;
