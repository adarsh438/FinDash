import React, { useState, useMemo } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    Trash2,
    Edit2,
    Copy,
    Download,
    HelpCircle,
    Coffee,
    Home,
    BookOpen,
    Tv,
    DollarSign,
    ShoppingBag,
    Heart,
    Briefcase,
    Plane,
    Package,
    Car,
    SlidersHorizontal,
    ShieldCheck,
    Repeat
} from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import DonutChart from '../components/DonutChart';
import ExpenseModal from '../components/expense/ExpenseModal';
import { useExpenses } from '../context/ExpenseContext';
import { type Expense, type ExpenseCategory } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { parseLocalDate, getLocalDateString } from '../utils/dateUtils';
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
    // Legacy aliases
    { value: 'rent_hostel',     label: 'Rent / Hostel',  icon: Home,        color: '#6366f1' },
    { value: 'subscriptions',   label: 'Subscriptions',  icon: Tv,          color: '#8b5cf6' },
    { value: 'study_materials', label: 'Study',          icon: BookOpen,    color: '#f472b6' },
];

const normalizeCategory = (cat: ExpenseCategory): ExpenseCategory => {
    if (cat === 'rent_hostel') return 'rent';
    if (cat === 'subscriptions') return 'entertainment';
    if (cat === 'study_materials') return 'education';
    return cat;
};

const FILTER_CATEGORIES = CATEGORIES.filter(c =>
    !['rent_hostel', 'subscriptions', 'study_materials'].includes(c.value)
);

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const Expenses = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const {
        expenses,
        loading,
        deleteExpense,
        duplicateExpense,
        safeToSpend,
        budget,
        currentMonthSpend,
        currentMonthIncome
    } = useExpenses();

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Filter & Search states
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState<string>('all');
    const [filterPayment, setFilterPayment] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // Editing handler
    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    // Duplicate handler
    const handleDuplicate = async (expense: Expense) => {
        try {
            await duplicateExpense(expense);
            showToast(`Duplicated "${expense.title}"`, 'success');
        } catch {
            showToast('Failed to duplicate expense', 'error');
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (!expenses.length) {
            showToast('No expenses available to export', 'error');
            return;
        }

        const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Payment Method', 'Date', 'Notes', 'Tags'];
        const rows = filtered.map(e => [
            e.id || '',
            `"${e.title.replace(/"/g, '""')}"`,
            e.amount,
            e.type || (e.category === 'income' ? 'income' : 'expense'),
            e.category,
            e.paymentMethod || '',
            e.date,
            `"${(e.notes || '').replace(/"/g, '""')}"`,
            `"${(e.tags || []).join('; ')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `findash-expenses-${getLocalDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Exported to CSV!', 'success');
    };

    // Filter & Sort Logic
    const filtered = useMemo(() => {
        return expenses
            .filter(e => {
                // Search query
                const query = search.toLowerCase().trim();
                const matchSearch = !query ||
                    e.title.toLowerCase().includes(query) ||
                    (e.notes && e.notes.toLowerCase().includes(query)) ||
                    (e.tags && e.tags.some(t => t.toLowerCase().includes(query)));

                // Category filter
                const normalizedCat = normalizeCategory(e.category);
                const matchCat = filterCat === 'all' || normalizedCat === filterCat || e.category === filterCat;

                // Payment Method filter
                const matchPayment = filterPayment === 'all' || e.paymentMethod === filterPayment;

                // Date Range
                const matchStart = !startDate || e.date >= startDate;
                const matchEnd = !endDate || e.date <= endDate;

                // Amount Range
                const min = parseFloat(minAmount);
                const max = parseFloat(maxAmount);
                const matchMin = isNaN(min) || e.amount >= min;
                const matchMax = isNaN(max) || e.amount <= max;

                return matchSearch && matchCat && matchPayment && matchStart && matchEnd && matchMin && matchMax;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
                if (sortBy === 'oldest') return parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
                if (sortBy === 'highest') return b.amount - a.amount;
                if (sortBy === 'lowest') return a.amount - b.amount;
                return 0;
            });
    }, [expenses, search, filterCat, filterPayment, startDate, endDate, minAmount, maxAmount, sortBy]);

    // Category Totals calculation
    const categoryTotals = useMemo(() => {
        return expenses
            .filter(e => e.category !== 'income' && e.type !== 'income')
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
                title="Expense & Financial Analytics"
                subtitle="Track transactions, recurring expenses, and budget metrics."
                icon={<CreditCard size={22} />}
                action={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="ghost" icon={<Download size={15} />} onClick={handleExportCSV}>
                            Export CSV
                        </Button>
                        <Button icon={<Plus size={16} />} onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}>
                            Add Transaction
                        </Button>
                    </div>
                }
            />

            {/* Safe to Spend & Financial Summary Banner */}
            <div className="finance-summary-grid">
                <div className="summary-card safe-to-spend-card">
                    <div className="summary-card-header">
                        <ShieldCheck size={18} className="summary-icon safe" />
                        <span>Safe to Spend</span>
                    </div>
                    <div className="summary-value safe">{formatCurrency(safeToSpend)}</div>
                    <div className="summary-desc">Monthly Budget + Income minus Spend</div>
                </div>

                <div className="summary-card">
                    <div className="summary-card-header">
                        <DollarSign size={18} className="summary-icon income" />
                        <span>Monthly Income</span>
                    </div>
                    <div className="summary-value income">+{formatCurrency(currentMonthIncome)}</div>
                    <div className="summary-desc">Total earnings this month</div>
                </div>

                <div className="summary-card">
                    <div className="summary-card-header">
                        <CreditCard size={18} className="summary-icon spend" />
                        <span>Monthly Spend</span>
                    </div>
                    <div className="summary-value spend">-{formatCurrency(currentMonthSpend)}</div>
                    <div className="summary-desc">
                        {budget ? `${((currentMonthSpend / budget.amount) * 100).toFixed(0)}% of monthly budget` : 'No budget set'}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="expenses-filters">
                <div className="search-bar">
                    <Search size={16} />
                    <input
                        className="search-input"
                        placeholder="Search by name, notes, or tags..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-controls-row">
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

                    <div className="filter-actions">
                        <select
                            className="glass-input sort-select"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="oldest">Sort: Oldest First</option>
                            <option value="highest">Sort: Highest Amount</option>
                            <option value="lowest">Sort: Lowest Amount</option>
                        </select>

                        <button
                            className={`advanced-filter-btn ${showAdvancedFilters ? 'active' : ''}`}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        >
                            <SlidersHorizontal size={15} /> Filters
                        </button>
                    </div>
                </div>

                {/* Advanced Filter Panel */}
                {showAdvancedFilters && (
                    <div className="advanced-filters-panel animate-slide-up">
                        <div className="filter-group">
                            <label>Payment Method</label>
                            <select className="glass-input" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                                <option value="all">All Methods</option>
                                <option value="upi">UPI</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="wallet">Wallet</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date From</label>
                            <input type="date" className="glass-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Date To</label>
                            <input type="date" className="glass-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Min Amount (₹)</label>
                            <input type="number" className="glass-input" placeholder="0" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Max Amount (₹)</label>
                            <input type="number" className="glass-input" placeholder="Any" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
                        </div>
                        <button
                            className="clear-filters-btn"
                            onClick={() => {
                                setFilterCat('all');
                                setFilterPayment('all');
                                setStartDate('');
                                setEndDate('');
                                setMinAmount('');
                                setMaxAmount('');
                                setSearch('');
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {loading ? <p className="loading-text">Loading transactions...</p> : (
                <div className="expenses-grid">
                    {/* Category Breakdown */}
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
                                title="No matching transactions"
                                description="Try adjusting your search query or filters."
                            />
                        ) : (
                            <div className="expenses-list">
                                {filtered.map((e) => {
                                    const isIncome = e.type === 'income' || e.category === 'income';
                                    const normalizedCat = normalizeCategory(e.category);
                                    const catDef = CATEGORIES.find(c => c.value === normalizedCat) || CATEGORIES.find(c => c.value === e.category);

                                    return (
                                        <div key={e.id} className="expense-item">
                                            <div className="expense-item-left">
                                                <div
                                                    className="expense-item-icon"
                                                    style={{
                                                        backgroundColor: isIncome ? 'rgba(16,185,129,0.15)' : `${catDef?.color || '#64748b'}18`
                                                    }}
                                                >
                                                    {React.createElement(
                                                        isIncome ? DollarSign : (catDef?.icon || HelpCircle),
                                                        { size: 16, color: isIncome ? '#10b981' : (catDef?.color || '#64748b') }
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="expense-item-title-row">
                                                        <span className="expense-item-title">{e.title}</span>
                                                        {e.isRecurring && (
                                                            <span className="recurring-badge" title={`Recurring ${e.recurringPeriod}`}>
                                                                <Repeat size={10} /> {e.recurringPeriod}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="expense-item-meta">
                                                        <span>{e.date}</span>
                                                        {e.paymentMethod && <span> • {e.paymentMethod.toUpperCase()}</span>}
                                                        {e.tags && e.tags.length > 0 && (
                                                            <span> • {e.tags.map(t => `#${t}`).join(' ')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="expense-item-right">
                                                <span className={`expense-item-amount ${isIncome ? 'income' : ''}`}>
                                                    {isIncome ? '+' : '-'}{formatCurrency(e.amount)}
                                                </span>

                                                <div className="item-action-btns">
                                                    <button
                                                        className="expense-action-btn"
                                                        onClick={() => handleEdit(e)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        className="expense-action-btn"
                                                        onClick={() => handleDuplicate(e)}
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={13} />
                                                    </button>
                                                    <button
                                                        className="expense-action-btn delete"
                                                        onClick={() => e.id && deleteExpense(e.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
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
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                }}
                editingExpense={editingExpense}
            />
        </div>
    );
};

export default Expenses;
