<<<<<<< HEAD
import React from 'react';
import { ShoppingBag, Coffee, ArrowUpRight, Zap } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import './TransactionRow.css';

interface TransactionRowProps {
    title: string;
    date: string;
    amount: number;
    category: 'shopping' | 'food' | 'income' | 'utilities';
}

const getIcon = (category: string) => {
    switch (category) {
        case 'shopping': return <ShoppingBag size={20} color="#a855f7" />;
        case 'food': return <Coffee size={20} color="#fbbf24" />;
        case 'income': return <ArrowUpRight size={20} color="#10b981" />;
        case 'utilities': return <Zap size={20} color="#3b82f6" />;
        default: return <ShoppingBag size={20} />;
    }
};

const TransactionRow: React.FC<TransactionRowProps> = ({ title, date, amount, category }) => {
    const { formatCurrency } = useCurrency();
    const isPositive = amount > 0;

    return (
        <div className="transaction-row">
            <div className="t-left" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="t-icon-wrapper">
                    {getIcon(category)}
                </div>
                <div className="t-details">
                    <div className="t-title">{title}</div>
                    <div className="t-date">{date}</div>
                </div>
            </div>
            <div className={`t-amount ${isPositive ? 'amount-positive' : 'amount-negative'}`}>
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(amount))}
            </div>
        </div>
    );
};

export default TransactionRow;
=======
import React from 'react';
import { ShoppingBag, Coffee, ArrowUpRight, Zap } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import './TransactionRow.css';

interface TransactionRowProps {
    title: string;
    date: string;
    amount: number;
    category: 'shopping' | 'food' | 'income' | 'utilities';
}

const getIcon = (category: string) => {
    switch (category) {
        case 'shopping': return <ShoppingBag size={20} color="#a855f7" />;
        case 'food': return <Coffee size={20} color="#fbbf24" />;
        case 'income': return <ArrowUpRight size={20} color="#10b981" />;
        case 'utilities': return <Zap size={20} color="#3b82f6" />;
        default: return <ShoppingBag size={20} />;
    }
};

const TransactionRow: React.FC<TransactionRowProps> = ({ title, date, amount, category }) => {
    const { formatCurrency } = useCurrency();
    const isPositive = amount > 0;

    return (
        <div className="transaction-row">
            <div className="t-left" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="t-icon-wrapper">
                    {getIcon(category)}
                </div>
                <div className="t-details">
                    <div className="t-title">{title}</div>
                    <div className="t-date">{date}</div>
                </div>
            </div>
            <div className={`t-amount ${isPositive ? 'amount-positive' : 'amount-negative'}`}>
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(amount))}
            </div>
        </div>
    );
};

export default TransactionRow;
>>>>>>> 6601a4a265f358168171eb60ea8f3a1b19e13166
