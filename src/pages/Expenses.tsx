import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Search, Filter, Trash2, HelpCircle, Coffee, Home, BookOpen, Tv, DollarSign, ShoppingBag, Heart, Briefcase, Plane, Package, Car } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import DonutChart from '../components/DonutChart';
import ExpenseModal from '../components/expense/ExpenseModal';
import { useExpenses } from '../context/ExpenseContext';
import { type ExpenseCategory } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import './Expenses.css';

const CATEGORIES: { value: ExpenseCategory; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'food',            label: 'Food',           icon: Coffee,      color: '#f59e0b' },
    { value: 'transport',       label: 'Transport',      icon: Car,         color: '#06b6d4' },
    { value: 'shopping',        label: 'Shopping',       icon: ShoppingBag, color: '#ec4899' },
    { value: 'entertainment',   label: 'Entertainment',  icon: Tv,          color: '#8b5cf6' },
    { value: 'health',          label: 'Health',         icon: Heart,       color: '#ef4444' },
    { value: 'rent',            label: 'Rent',           icon: Home,        color: '#6366f1' },
    { value: 'education',       label: 'Education',      icon: BookOpen,    color: '#f472b6' },
    { value: 'work',            label: 'Work',           icon: Briefcase,   color: '#14b8a6' },
    { value: 'travel',          label: 'Travel',         icon: Plane,       color: '#3b82f6' },
    { value: 'other',           label: 'Other',          icon: Package,     color: '#64748b' },
    { value: 'income',          label: 'Income',         icon: DollarSign,  color: '#10b981' },
    // Legacy aliases for backward compatibility
    { value: 'rent_hostel',     label: 'Rent / Hostel',  icon: Home,        color: '#6366f1' },
    { value: 'subscriptions',   label: 'Subscriptions',  icon: Tv,          color: '#8b5cf6' },
    { value: 'study_materials', label: 'Study',          icon: BookOpen,    color: '#f472b6' },
];

// Normalize legacy categories for display
const normalizeCategory = (cat: ExpenseCategory): ExpenseCategory => {
    if (cat === 'rent_hostel') return 'rent';
    if (cat === 'subscriptions') return 'entertainment';
    if (cat === 'study_materials') return 'education';
    return cat;
};

// Filter categories shown in chips (exclude legacy and income)
const FILTER_CATEGORIES = CATEGORIES.filter(c =>
    !['rent_hostel', 'subscriptions', 'study_materials'].includes(c.value)
);

const Expenses = () => {
    const { formatCurrency } = useCurrency();
    const { expenses, loading, deleteExpense } = useExpenses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState<string>('all');

    const filtered = useMemo(() => {
        return expenses.filter(e => {
            const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
            const normalizedCat = normalizeCategory(e.category);
            const matchCat = filterCat === 'all' || normalizedCat === filterCat || e.category === filterCat;
            return matchSearch && matchCat;
        });
    }, [expenses, search, filterCat]);

    const categoryTotals = useMemo(() => {
        return expenses
            .filter(e => e.category !== 'income')
            .reduce((acc, e) => {
                const normalized = normalizeCategory(e.category);
                acc[normalized] = (acc[normalized] || 0) + e.amount;
                return acc;
            }, {} as Record<string, number>);
    }, [expenses]);

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const donutSegments = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, val]) => {
            const catDef = CATEGORIES.find(c => c.value === cat);
            return { value: val, color: catDef?.color || '#64748b', label: catDef?.label || cat };
        });

    return (
        <div className="expenses-page animate-fade-in">
            <PageHeader
                title="Expense Analysis"
                subtitle="Track where your money goes."
                icon={<CreditCard size={22} />}
                action={
                    <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                        Add Expense
                    </Button>
                }
            />

            {/* Filters */}
            <div className="expenses-filters">
                <div className="search-bar">
                    <Search size={16} />
                    <input
                        className="search-input"
                        placeholder="Search expenses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="category-chips">
                    <button
                        className={`cat-chip ${filterCat === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterCat('all')}
                    >All</button>
                    {FILTER_CATEGORIES.map(c => (
                        <button
                            key={c.value}
                            className={`cat-chip ${filterCat === c.value ? 'active' : ''}`}
                            style={filterCat === c.value ? { borderColor: c.color, color: c.color } : {}}
                            onClick={() => setFilterCat(c.value)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <p className="loading-text">Loading...</p> : (
                <div className="expenses-grid">
                    {/* Category breakdown */}
                    <Card className="flat">
                        <h3 className="section-heading">Category Breakdown</h3>
                        <div className="expense-donut-row">
                            <DonutChart
                                segments={donutSegments}
                                size={160}
                                strokeWidth={18}
                                centerValue={formatCurrency(totalSpent)}
                                centerLabel="total"
                            />
                            <div className="cat-breakdown-list">
                                {Object.entries(categoryTotals)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([cat, amount]) => {
                                        const catDef = CATEGORIES.find(c => c.value === cat);
                                        const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                                        return (
                                            <div key={cat} className="cat-breakdown-item">
                                                <div className="cat-breakdown-left">
                                                    <span className="cat-dot" style={{ backgroundColor: catDef?.color }} />
                                                    <span className="cat-name">{catDef?.label || cat}</span>
                                                </div>
                                                <div className="cat-breakdown-right">
                                                    <span className="cat-amount">{formatCurrency(amount)}</span>
                                                    <span className="cat-pct">{pct.toFixed(0)}%</span>
                                                </div>
                                                <div className="cat-bar-bg">
                                                    <div
                                                        className="cat-bar-fill"
                                                        style={{ width: `${pct}%`, backgroundColor: catDef?.color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {Object.keys(categoryTotals).length === 0 && (
                                    <p className="empty-cat-text">No expenses yet.</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Transactions list */}
                    <Card className="flat expenses-list-card">
                        <h3 className="section-heading">Transactions ({filtered.length})</h3>
                        {filtered.length === 0 ? (
                            <EmptyState
                                icon={<Filter size={28} />}
                                title="No results"
                                description="Try adjusting your search or filter."
                            />
                        ) : (
                            <div className="expenses-list">
                                {filtered.map((e) => {
                                    const normalizedCat = normalizeCategory(e.category);
                                    const catDef = CATEGORIES.find(c => c.value === normalizedCat) || CATEGORIES.find(c => c.value === e.category);
                                    return (
                                        <div key={e.id} className="expense-item">
                                            <div className="expense-item-left">
                                                <div
                                                    className="expense-item-icon"
                                                    style={{
                                                        backgroundColor: `${catDef?.color || '#64748b'}18`
                                                    }}
                                                >
                                                    {React.createElement(
                                                        catDef?.icon || HelpCircle,
                                                        { size: 16, color: catDef?.color || '#64748b' }
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="expense-item-title">{e.title}</div>
                                                    <div className="expense-item-date">{e.date}</div>
                                                </div>
                                            </div>
                                            <div className="expense-item-right">
                                                <span className={`expense-item-amount ${e.category === 'income' ? 'income' : ''}`}>
                                                    {e.category === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
                                                </span>
                                                <button
                                                    className="expense-delete-btn"
                                                    onClick={() => e.id && deleteExpense(e.id)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Premium Expense Modal */}
            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Expenses;

