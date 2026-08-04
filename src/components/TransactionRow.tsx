import React from 'react';
import { Coffee, Wallet, Home, BookOpen, Tv, Trash2, Car, ShoppingBag, Heart, Briefcase, Plane, Package } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import type { ExpenseCategory } from '../services/expenseService';
import './TransactionRow.css';

interface TransactionRowProps {
    id?: string;
    title: string;
    date: string;
    amount: number;
    category: ExpenseCategory;
    onDelete?: (id: string) => void;
    style?: React.CSSProperties;
}

const CATEGORY_MAP: Record<ExpenseCategory, { icon: React.FC<any>; color: string; bg: string }> = {
    food:            { icon: Coffee,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    transport:       { icon: Car,         color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
    shopping:        { icon: ShoppingBag, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    entertainment:   { icon: Tv,          color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    health:          { icon: Heart,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
    rent:            { icon: Home,        color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    education:       { icon: BookOpen,    color: '#f472b6', bg: 'rgba(244,114,182,0.12)'},
    work:            { icon: Briefcase,   color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
    travel:          { icon: Plane,       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    other:           { icon: Package,     color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    income:          { icon: Wallet,      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    // Legacy aliases
    rent_hostel:     { icon: Home,        color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    study_materials: { icon: BookOpen,    color: '#f472b6', bg: 'rgba(244,114,182,0.12)'},
    subscriptions:   { icon: Tv,          color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const TransactionRow: React.FC<TransactionRowProps> = ({
    id, title, date, amount, category, onDelete, style
}) => {
    const { formatCurrency } = useCurrency();
    const isPositive = amount > 0;
    const cat = CATEGORY_MAP[category] || CATEGORY_MAP.other;
    const Icon = cat.icon;

    return (
        <div className="transaction-row animate-fade-in" style={style}>
            <div className="t-left">
                <div className="t-icon-wrapper" style={{ backgroundColor: cat.bg }}>
                    <Icon size={18} color={cat.color} />
                </div>
                <div className="t-details">
                    <div className="t-title">{title}</div>
                    <div className="t-meta">
                        <span className="t-date">{formatRelativeDate(date)}</span>
                        <span className="t-category-dot" style={{ backgroundColor: cat.color }} />
                        <span className="t-category">{category.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="t-right">
                <div className={`t-amount ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                </div>
                {onDelete && id && (
                    <button
                        className="t-delete-btn"
                        onClick={() => onDelete(id)}
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TransactionRow;
