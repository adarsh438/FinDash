import React, { useState, useMemo } from 'react';
import { Plus, Search, ArrowLeftRight } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import TransactionRow from '../components/TransactionRow';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { expenseService, type ExpenseCategory } from '../services/expenseService';
import { useToast } from '../context/ToastContext';
import './Transactions.css';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: 'food',            label: 'Food & Dining' },
    { value: 'rent_hostel',     label: 'Rent / Hostel' },
    { value: 'travel',          label: 'Travel' },
    { value: 'subscriptions',   label: 'Subscriptions' },
    { value: 'study_materials', label: 'Study Materials' },
    { value: 'income',          label: 'Income' },
    { value: 'other',           label: 'Other' },
];

const Transactions = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { expenses, loading, deleteExpense } = useExpenses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('other');
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
            showToast('Transaction added!', 'success');
            setTitle(''); setAmount(''); setCategory('other');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (err: any) {
            showToast(err.message || 'Failed', 'error');
        } finally { setIsSubmitting(false); }
    };

    const filtered = useMemo(() =>
        expenses.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase())),
        [expenses, search]
    );

    return (
        <div className="transactions-page animate-fade-in">
            <PageHeader
                title="Transactions"
                subtitle="Your complete financial history."
                icon={<ArrowLeftRight size={22} />}
                action={
                    <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                        Add Transaction
                    </Button>
                }
            />

            <Card className="flat transactions-card">
                {/* Search */}
                <div className="tx-search-bar">
                    <Search size={16} />
                    <input
                        className="tx-search-input"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="tx-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>

                <div className="tx-count">
                    {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                    {search ? ` matching "${search}"` : ''}
                </div>

                {loading ? (
                    <p className="tx-loading">Loading transactions...</p>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<ArrowLeftRight size={28} />}
                        title={search ? 'No results' : 'No transactions yet'}
                        description={search ? 'Try a different search term.' : 'Add your first transaction to get started.'}
                        actionLabel={!search ? 'Add Transaction' : undefined}
                        onAction={!search ? () => setIsModalOpen(true) : undefined}
                    />
                ) : (
                    <div className="tx-list">
                        {filtered.map(t => (
                            <TransactionRow
                                key={t.id}
                                id={t.id}
                                title={t.title}
                                date={t.date}
                                amount={t.category === 'income' ? t.amount : -t.amount}
                                category={t.category}
                                onDelete={t.id ? deleteExpense : undefined}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
                <form onSubmit={handleSubmit}>
                    <Input label="Description" placeholder="e.g. Grocery Shopping" value={title}
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
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
