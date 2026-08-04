import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Repeat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useToast } from '../../context/ToastContext';
import { expenseService, type ExpenseCategory, type IncomeCategory } from '../../services/expenseService';
import AmountInput from './AmountInput';
import QuickAmountButtons from './QuickAmountButtons';
import RecentExpenseChips from './RecentExpenseChips';
import CategorySelector, { CATEGORIES } from './CategorySelector';
import PaymentMethodSelector, { type PaymentMethod } from './PaymentMethodSelector';
import BudgetProgress from './BudgetProgress';
import TagInput from './TagInput';
import ReceiptUploader from './ReceiptUploader';
import SmartSuggestions from './SmartSuggestions';
import ExpenseSuccessOverlay from './ExpenseSuccessOverlay';
import type { Expense } from '../../services/expenseService';
import './ExpenseModal.css';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingExpense?: Expense | null;
}

const INCOME_CATEGORIES: { value: IncomeCategory; label: string; emoji: string }[] = [
    { value: 'salary', label: 'Salary', emoji: '💼' },
    { value: 'freelance', label: 'Freelance', emoji: '💻' },
    { value: 'investments', label: 'Investments', emoji: '📈' },
    { value: 'other', label: 'Other Income', emoji: '💵' },
];

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 },
    },
    exit: {
        opacity: 0,
        scale: 0.92,
        y: 20,
        transition: { duration: 0.2 },
    },
};

const mobileModalVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    exit: {
        opacity: 0,
        y: '100%',
        transition: { duration: 0.25 },
    },
};

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, editingExpense }) => {
    const { currentUser } = useAuth();
    const { expenses, budget, currentMonthSpend, updateExpense } = useExpenses();
    const { showToast } = useToast();

    // Type toggle
    const [txType, setTxType] = useState<'expense' | 'income'>('expense');

    // Form state
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('food');
    const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('salary');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPeriod, setRecurringPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

    // UI state
    const [showOptional, setShowOptional] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Validation state
    const [errors, setErrors] = useState<{ amount?: string; title?: string; category?: string }>({});

    // Populate editing state if editing
    useEffect(() => {
        if (editingExpense && isOpen) {
            setTxType(editingExpense.type === 'income' || editingExpense.category === 'income' ? 'income' : 'expense');
            setAmount(editingExpense.amount.toString());
            setTitle(editingExpense.title || '');
            setCategory(editingExpense.category || 'food');
            setIncomeCategory(editingExpense.incomeCategory || 'salary');
            setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
            setPaymentMethod(editingExpense.paymentMethod || 'upi');
            setNotes(editingExpense.notes || '');
            setTags(editingExpense.tags || []);
            setIsRecurring(editingExpense.isRecurring || false);
            setRecurringPeriod(editingExpense.recurringPeriod || 'monthly');
            if (editingExpense.notes || editingExpense.tags?.length) {
                setShowOptional(true);
            }
        }
    }, [editingExpense, isOpen]);

    // Check mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const resetForm = useCallback(() => {
        setTxType('expense');
        setAmount('');
        setTitle('');
        setCategory('food');
        setIncomeCategory('salary');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('upi');
        setNotes('');
        setTags([]);
        setReceiptFile(null);
        setIsRecurring(false);
        setRecurringPeriod('monthly');
        setShowOptional(false);
        setErrors({});
        setShowSuccess(false);
    }, []);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    }, [isSubmitting, onClose, resetForm]);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            newErrors.amount = 'Enter a valid amount greater than ₹0';
        }
        if (!title.trim()) {
            newErrors.title = txType === 'income' ? 'Income source is required' : 'Expense name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate() || !currentUser) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                amount: parseFloat(amount),
                type: txType,
                category: txType === 'income' ? 'income' as ExpenseCategory : category,
                incomeCategory: txType === 'income' ? incomeCategory : undefined,
                paymentMethod,
                date,
                notes: notes.trim() || undefined,
                tags: tags.length ? tags : undefined,
                isRecurring,
                recurringPeriod: isRecurring ? recurringPeriod : undefined
            };

            if (editingExpense && editingExpense.id) {
                await updateExpense(editingExpense.id, payload);
                showToast(txType === 'income' ? 'Income updated!' : 'Expense updated!', 'success');
                handleClose();
            } else {
                await expenseService.addExpense(currentUser.uid, payload);
                setShowSuccess(true);
                setTimeout(() => {
                    handleClose();
                    showToast(txType === 'income' ? 'Income added!' : 'Expense added!', 'success');
                }, 1500);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecentSelect = (expense: Expense) => {
        setTitle(expense.title);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
    };

    const handleSmartApply = (cat: ExpenseCategory, pm?: PaymentMethod) => {
        setCategory(cat);
        if (pm) setPaymentMethod(pm);
    };

    const handleFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const pendingAmount = parseFloat(amount) || 0;
    const selectedCategoryLabel = txType === 'income'
        ? (INCOME_CATEGORIES.find(c => c.value === incomeCategory)?.label || 'Income')
        : (CATEGORIES.find(c => c.value === category)?.label || category);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="expense-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={handleClose}
                >
                    <motion.div
                        className="expense-modal"
                        variants={isMobile ? mobileModalVariants : modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={editingExpense ? "Edit Transaction" : "Add Transaction"}
                    >
                        {/* Success Overlay */}
                        <AnimatePresence>
                            {showSuccess && (
                                <ExpenseSuccessOverlay
                                    amount={amount}
                                    category={selectedCategoryLabel}
                                />
                            )}
                        </AnimatePresence>

                        {/* Header */}
                        <div className="expense-modal-header">
                            <h2>
                                <span>{txType === 'income' ? '💰' : '💸'}</span>{' '}
                                {editingExpense ? (txType === 'income' ? 'Edit Income' : 'Edit Expense') : (txType === 'income' ? 'Add Income' : 'Add Expense')}
                            </h2>
                            <button
                                className="expense-modal-close"
                                onClick={handleClose}
                                aria-label="Close modal"
                                type="button"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Income / Expense Toggle */}
                        <div className="tx-type-toggle-bar" style={{ padding: '0 1.5rem 0.5rem' }}>
                            <button
                                className={`tx-toggle-btn ${txType === 'expense' ? 'active-expense' : ''}`}
                                onClick={() => setTxType('expense')}
                                type="button"
                            >
                                💸 Expense
                            </button>
                            <button
                                className={`tx-toggle-btn ${txType === 'income' ? 'active-income' : ''}`}
                                onClick={() => setTxType('income')}
                                type="button"
                            >
                                💰 Income
                            </button>
                        </div>

                        {/* Body */}
                        <form
                            className="expense-modal-body"
                            onSubmit={handleSubmit}
                            onKeyDown={handleFormKeyDown}
                        >
                            {/* Amount */}
                            <div>
                                <p className="expense-section-label">💰 Amount</p>
                                <AmountInput
                                    value={amount}
                                    onChange={(v) => { setAmount(v); setErrors(e => ({ ...e, amount: undefined })); }}
                                    error={errors.amount}
                                />
                                <QuickAmountButtons
                                    currentAmount={amount}
                                    onSelect={(a) => setAmount(a.toString())}
                                />
                            </div>

                            {/* Recent Expenses (Only for expenses) */}
                            {txType === 'expense' && (
                                <RecentExpenseChips
                                    expenses={expenses}
                                    onSelect={handleRecentSelect}
                                />
                            )}

                            {/* Title / Description */}
                            <div>
                                <p className="expense-section-label">
                                    {txType === 'income' ? '💵 Income Source' : '📝 Expense Name'}
                                </p>
                                <motion.input
                                    className={`expense-name-input ${errors.title ? 'field-error-input' : ''}`}
                                    placeholder={txType === 'income' ? 'e.g. Monthly Salary, Freelance Work...' : 'e.g. Coffee, Groceries, Netflix...'}
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); setErrors(er => ({ ...er, title: undefined })); }}
                                    aria-label="Transaction title"
                                    animate={errors.title ? { x: [0, -4, 4, -3, 3, 0] } : {}}
                                    transition={{ duration: 0.3 }}
                                />
                                {errors.title && (
                                    <motion.p
                                        className="field-error"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.title}
                                    </motion.p>
                                )}
                                {txType === 'expense' && (
                                    <SmartSuggestions
                                        title={title}
                                        onApply={handleSmartApply}
                                    />
                                )}
                            </div>

                            {/* Category Selector */}
                            {txType === 'expense' ? (
                                <CategorySelector
                                    selected={category}
                                    onChange={(c) => { setCategory(c); setErrors(e => ({ ...e, category: undefined })); }}
                                    error={errors.category}
                                />
                            ) : (
                                <div>
                                    <p className="expense-section-label">🏷️ Income Category</p>
                                    <div className="category-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {INCOME_CATEGORIES.map(ic => (
                                            <button
                                                key={ic.value}
                                                type="button"
                                                className={`category-card ${incomeCategory === ic.value ? 'selected' : ''}`}
                                                onClick={() => setIncomeCategory(ic.value)}
                                            >
                                                <span className="category-emoji">{ic.emoji}</span>
                                                <span className="category-label">{ic.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date + Payment Method Row */}
                            <div className="expense-row-2">
                                <div>
                                    <p className="expense-section-label">📅 Date</p>
                                    <input
                                        className="expense-date-input"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        aria-label="Transaction date"
                                    />
                                </div>
                                <PaymentMethodSelector
                                    selected={paymentMethod}
                                    onChange={setPaymentMethod}
                                />
                            </div>

                            {/* Recurring Transaction Toggle */}
                            <div className="recurring-toggle-row">
                                <label className="remember-me-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                    />
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                                        <Repeat size={14} /> Recurring Transaction
                                    </span>
                                </label>
                                {isRecurring && (
                                    <select
                                        className="glass-input"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                        value={recurringPeriod}
                                        onChange={(e) => setRecurringPeriod(e.target.value as any)}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                )}
                            </div>

                            {/* Budget Progress (Only for expenses) */}
                            {txType === 'expense' && (
                                <BudgetProgress
                                    budget={budget}
                                    currentMonthSpend={currentMonthSpend}
                                    pendingAmount={pendingAmount}
                                />
                            )}

                            {/* Optional Fields Toggle */}
                            <button
                                className={`expense-optional-toggle ${showOptional ? 'expanded' : ''}`}
                                onClick={() => setShowOptional(!showOptional)}
                                type="button"
                            >
                                <ChevronDown size={14} />
                                {showOptional ? 'Hide' : 'Show'} optional fields (Notes, Tags, Receipt)
                            </button>

                            <AnimatePresence>
                                {showOptional && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}
                                    >
                                        {/* Notes */}
                                        <div>
                                            <p className="expense-section-label">📍 Notes</p>
                                            <textarea
                                                className="expense-notes-input"
                                                placeholder="Add optional notes..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                aria-label="Transaction notes"
                                            />
                                        </div>

                                        {/* Tags */}
                                        <TagInput tags={tags} onChange={setTags} />

                                        {/* Receipt */}
                                        <ReceiptUploader file={receiptFile} onChange={setReceiptFile} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Footer */}
                        <div className="expense-modal-footer">
                            <button
                                className="expense-cancel-btn"
                                onClick={handleClose}
                                type="button"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="expense-submit-btn"
                                onClick={() => handleSubmit()}
                                type="button"
                                disabled={isSubmitting || showSuccess}
                            >
                                {isSubmitting ? (
                                    <span className="submit-spinner" />
                                ) : (
                                    editingExpense ? 'Update Transaction' : (txType === 'income' ? '✨ Save Income' : '✨ Add Expense')
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ExpenseModal;
