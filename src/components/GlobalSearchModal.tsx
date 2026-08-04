import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Calendar, Target, X, ChevronRight } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { goalService, type Goal } from '../services/goalService';
import { billService, type CustomBill } from '../services/billService';
import { useCurrency } from '../context/CurrencyContext';
import './GlobalSearchModal.css';

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    type: 'Expense' | 'Income' | 'Bill' | 'Goal';
    route: string;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { expenses } = useExpenses();
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();

    const [queryText, setQueryText] = useState('');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [bills, setBills] = useState<CustomBill[]>([]);

    useEffect(() => {
        if (!currentUser) return;
        const unsubGoals = goalService.subscribeToGoals(currentUser.uid, setGoals);
        const unsubBills = billService.subscribeToBills(currentUser.uid, setBills);
        return () => {
            unsubGoals();
            unsubBills();
        };
    }, [currentUser]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const trimmed = queryText.toLowerCase().trim();

    const results: SearchResultItem[] = [];

    if (trimmed.length > 0) {
        expenses.forEach(e => {
            if (e.title.toLowerCase().includes(trimmed) || (e.notes && e.notes.toLowerCase().includes(trimmed))) {
                results.push({
                    id: e.id || e.title,
                    title: e.title,
                    subtitle: `${e.date} · ${formatCurrency(e.amount)} (${e.category})`,
                    type: e.type === 'income' || e.category === 'income' ? 'Income' : 'Expense',
                    route: '/expenses'
                });
            }
        });

        goals.forEach(g => {
            if (g.title.toLowerCase().includes(trimmed)) {
                results.push({
                    id: g.id || g.title,
                    title: g.title,
                    subtitle: `Target ${formatCurrency(g.targetAmount)} by ${g.deadline}`,
                    type: 'Goal',
                    route: '/goals'
                });
            }
        });

        bills.forEach(b => {
            if (b.title.toLowerCase().includes(trimmed)) {
                results.push({
                    id: b.id || b.title,
                    title: b.title,
                    subtitle: `Due ${b.dueDate} · ${formatCurrency(b.amount)}`,
                    type: 'Bill',
                    route: '/bills'
                });
            }
        });
    }

    const handleSelect = (route: string) => {
        navigate(route);
        onClose();
        setQueryText('');
    };

    return (
        <div className="global-search-overlay" onClick={onClose}>
            <div className="global-search-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="global-search-input-wrap">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="global-search-input"
                        placeholder="Search transactions, bills, goals... (Press Esc to exit)"
                        value={queryText}
                        onChange={e => setQueryText(e.target.value)}
                        autoFocus
                    />
                    <button className="search-close-btn" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="global-search-results">
                    {trimmed.length === 0 ? (
                        <p className="search-hint">Type a keyword like "Coffee", "Salary", "Netflix", or "Laptop"...</p>
                    ) : results.length === 0 ? (
                        <p className="search-hint">No matching records found for "{queryText}".</p>
                    ) : (
                        results.slice(0, 8).map(res => (
                            <div key={res.id} className="search-result-item" onClick={() => handleSelect(res.route)}>
                                <div className="result-item-icon">
                                    {res.type === 'Expense' || res.type === 'Income' ? <CreditCard size={16} /> :
                                        res.type === 'Goal' ? <Target size={16} /> : <Calendar size={16} />}
                                </div>
                                <div className="result-item-info">
                                    <span className="result-item-title">{res.title}</span>
                                    <span className="result-item-sub">{res.subtitle}</span>
                                </div>
                                <span className={`result-type-badge ${res.type.toLowerCase()}`}>{res.type}</span>
                                <ChevronRight size={16} className="result-arrow" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearchModal;
