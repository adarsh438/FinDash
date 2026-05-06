import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Search, Filter, Trash2, HelpCircle, Coffee, Home, Bus, BookOpen, Tv, DollarSign } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import DonutChart from '../components/DonutChart';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { expenseService, type ExpenseCategory } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import './Expenses.css';

const CATEGORIES: { value: ExpenseCategory; label: string; icon: any; color: string }[] = [
    { value: 'food',            label: 'Food',           icon: Coffee,    color: '#f59e0b' },
    { value: 'rent_hostel',     label: 'Rent / Hostel',  icon: Home,      color: '#8b5cf6' },
    { value: 'travel',          label: 'Travel',         icon: Bus,       color: '#06b6d4' },
    { value: 'subscriptions',   label: 'Subscriptions',  icon: Tv,        color: '#ec4899' },
    { value: 'study_materials', label: 'Study',          icon: BookOpen,  color: '#f472b6' },
    { value: 'income',          label: 'Income',         icon: DollarSign,color: '#10b981' },
    { value: 'other',           label: 'Other',          icon: HelpCircle,color: '#64748b' },
];

const Expenses = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const { expenses, loading, deleteExpense } = useExpenses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState<string>('all');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await expenseService.addExpense(currentUser.uid, {
                title, amount: parseFloat(amount), category, date
            });
            setIsModalOpen(false);
            showToast('Expense added!', 'success');
            setTitle(''); setAmount(''); setCategory('food');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (err: any) {
            showToast(err.message || 'Failed to add expense', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = useMemo(() => {
        return expenses.filter(e => {
            const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
            const matchCat = filterCat === 'all' || e.category === filterCat;
            return matchSearch && matchCat;
        });
    }, [expenses, search, filterCat]);

    const categoryTotals = useMemo(() => {
        return expenses
            .filter(e => e.category !== 'income')
            .reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
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
                    {CATEGORIES.map(c => (
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
                                {filtered.map((e) => (
                                    <div key={e.id} className="expense-item">
                                        <div className="expense-item-left">
                                            <div
                                                className="expense-item-icon"
                                                style={{
                                                    backgroundColor: `${CATEGORIES.find(c => c.value === e.category)?.color}18`
                                                }}
                                            >
                                                {React.createElement(
                                                    CATEGORIES.find(c => c.value === e.category)?.icon || HelpCircle,
                                                    { size: 16, color: CATEGORIES.find(c => c.value === e.category)?.color }
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
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit}>
                    <Input label="Description" placeholder="e.g. Hostel Rent" value={title}
                        onChange={e => setTitle(e.target.value)} required />
                    <Input label="Amount" type="number" placeholder="0.00" value={amount}
                        onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" required />
                    <Input label="Date" type="date" value={date}
                        onChange={e => setDate(e.target.value)} required />
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select className="glass-input" value={category}
                            onChange={e => setCategory(e.target.value as ExpenseCategory)}>
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>Save Expense</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
