import React from 'react';
import { Coffee, Wallet, HelpCircle, Home, Bus, BookOpen, Tv } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import type { ExpenseCategory } from '../services/expenseService';
import './TransactionRow.css';

interface TransactionRowProps {
    title: string;
    date: string;
    amount: number;
    category: ExpenseCategory;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ title, date, amount, category }) => {
    const { formatCurrency } = useCurrency();
    const isPositive = amount > 0;

    const getIcon = () => {
        switch (category) {
            case 'food': return <Coffee size={20} />;
            case 'income': return <Wallet size={20} />;
            case 'rent_hostel': return <Home size={20} />;
            case 'travel': return <Bus size={20} />;
            case 'study_materials': return <BookOpen size={20} />;
            case 'subscriptions': return <Tv size={20} />;
            case 'other':
            default: return <HelpCircle size={20} />;
        }
    };

    const getIconColor = () => {
        switch (category) {
            case 'food': return 'var(--accent-warning)';
            case 'income': return 'var(--accent-success)';
            case 'rent_hostel': return '#8b5cf6';
            case 'travel': return '#06b6d4';
            case 'study_materials': return '#f472b6';
            case 'subscriptions': return '#ec4899';
            case 'other':
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="transaction-row">
            <div className="t-left" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="t-icon-wrapper" style={{ backgroundColor: getIconColor(), color: '#1e293b' }}>
                    {getIcon()}
                </div>
                <div className="t-details">
                    <div className="t-title">{title}</div>
                    <div className="t-date">{date}</div>
                </div>
            </div>
            <div className={`t-amount ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
            </div>
        </div>
    );
};

export default TransactionRow;
