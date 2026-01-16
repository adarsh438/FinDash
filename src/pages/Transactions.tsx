import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { expenseService, type Expense } from '../services/expenseService';
import './Transactions.css';

const Transactions = () => {
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('shopping');

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setTransactions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            await expenseService.addExpense(currentUser.uid, {
                title,
                amount: parseFloat(amount),
                category: category as any,
                date: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(false);
            // Reset form
            setTitle('');
            setAmount('');
            setCategory('shopping');
        } catch (error) {
            console.error("Failed to add transaction", error);
            alert("Failed to add transaction");
        }
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Transactions</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and track your financial history.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
                    Add Transaction
                </Button>
            </div>

            <Card className="transactions-container">
                <div className="filters-bar">
                    <div className="search-wrapper">
                        <Search size={18} />
                        <input type="text" placeholder="Search transactions..." />
                    </div>
                    <button className="filter-btn">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="transactions-list">
                    {loading ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
                    ) : transactions.length === 0 ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</p>
                    ) : (
                        transactions.map((t) => (
                            <TransactionRow
                                key={t.id}
                                title={t.title}
                                date={t.date}
                                amount={t.category === 'income' ? t.amount : -t.amount}
                                category={t.category as any}
                            />
                        ))
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Transaction"
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        label="Description"
                        placeholder="e.g. Grocery Shopping"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                            className="glass-input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="shopping">Shopping</option>
                            <option value="food">Food & Dining</option>
                            <option value="utilities">Utilities</option>
                            <option value="income">Income</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button type="submit" style={{ flex: 1 }}>
                            Save Transaction
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
