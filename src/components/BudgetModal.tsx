import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import Button from './Button';
import './BudgetModal.css';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_AMOUNTS = [5000, 10000, 15000, 20000, 25000, 50000];

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
    const { budget, setBudget } = useExpenses();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [value, setValue] = useState(budget?.amount?.toString() || '');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid budget amount', 'error');
            return;
        }
        setSaving(true);
        try {
            await setBudget(amount);
            showToast(`Budget set to ${formatCurrency(amount)}`, 'success');
            onClose();
        } catch {
            showToast('Failed to update budget', 'error');
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="budget-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="budget-modal-header">
                    <div className="budget-modal-icon">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h2>Set Monthly Budget</h2>
                        <p>How much do you plan to spend this month?</p>
                    </div>
                    <button className="budget-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="budget-modal-body">
                    <div className="budget-amount-input-wrap">
                        <span className="budget-currency-symbol">₹</span>
                        <input
                            type="number"
                            className="budget-amount-input"
                            placeholder="0"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            autoFocus
                            min={0}
                        />
                    </div>

                    <p className="budget-quick-label">Quick select</p>
                    <div className="budget-quick-grid">
                        {QUICK_AMOUNTS.map(amt => (
                            <button
                                key={amt}
                                className={`budget-quick-btn ${value === amt.toString() ? 'selected' : ''}`}
                                onClick={() => setValue(amt.toString())}
                            >
                                {formatCurrency(amt)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="budget-modal-footer">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Budget'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BudgetModal;
