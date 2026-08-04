import { useState } from 'react';
import { Users, Plus, Link as LinkIcon, Trash2, CheckCircle, QrCode } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import './Groups.css';

interface FriendMember {
    name: string;
    customAmount?: number;
    isSettled: boolean;
}

const Groups = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [groupName, setGroupName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

    const [friends, setFriends] = useState<FriendMember[]>([]);
    const [newFriend, setNewFriend] = useState('');

    const handleAddFriend = () => {
        if (!newFriend.trim()) return;
        setFriends(prev => [...prev, { name: newFriend.trim(), isSettled: false }]);
        setNewFriend('');
    };

    const handleRemoveFriend = (idx: number) => {
        setFriends(prev => prev.filter((_, i) => i !== idx));
    };

    const handleCustomAmountChange = (idx: number, amtStr: string) => {
        const val = parseFloat(amtStr) || 0;
        setFriends(prev => prev.map((f, i) => i === idx ? { ...f, customAmount: val } : f));
    };

    const handleToggleSettled = (idx: number) => {
        setFriends(prev => prev.map((f, i) => i === idx ? { ...f, isSettled: !f.isSettled } : f));
        showToast('Settlement status updated!', 'info');
    };

    const calculatePerPerson = () => {
        const amount = parseFloat(totalAmount) || 0;
        const totalPeople = friends.length + 1;
        return amount / totalPeople;
    };

    const handleSplit = () => {
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
        if (!upiId.includes('@')) { showToast('Enter a valid UPI ID (e.g. name@bank)', 'error'); return; }
        if (friends.length === 0) { showToast('Add at least one friend', 'error'); return; }

        setStep(3);
        showToast('Group expense split generated!', 'success');
    };

    const handleReset = () => {
        setStep(1);
        setGroupName('');
        setTotalAmount('');
        setUpiId('');
        setSplitType('equal');
        setFriends([]);
        setNewFriend('');
    };

    return (
        <div className="groups-page animate-fade-in">
            <PageHeader
                title="Group Expense Split & Settlements"
                subtitle="Split bills equally or custom amounts. Generate instant UPI QR links."
                icon={<Users size={22} />}
            />

            {/* Step indicator */}
            <div className="split-steps">
                {['Details', 'Members & Split', 'Settlement'].map((label, i) => (
                    <div key={label} className={`step-item ${step >= i + 1 ? 'active' : ''} ${step === i + 1 ? 'current' : ''}`}>
                        <div className="step-num">{i + 1}</div>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="groups-grid">
                {/* Step 1 */}
                {step === 1 && (
                    <Card className="flat groups-step-card animate-fade-in-scale">
                        <h3 className="step-heading">Expense & Payment Details</h3>
                        <Input
                            label="Your UPI ID (For receiving payments)"
                            placeholder="e.g. yourname@upi"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                        />
                        <Input
                            label="Occasion / Trip Name"
                            placeholder="e.g. Goa Trip, Dinner, Rent"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                        />
                        <Input
                            label="Total Bill Amount (₹)"
                            type="number"
                            placeholder="0.00"
                            value={totalAmount}
                            onChange={e => setTotalAmount(e.target.value)}
                        />

                        <div className="input-group">
                            <label className="input-label">Split Mode</label>
                            <div className="tx-type-toggle-bar">
                                <button
                                    type="button"
                                    className={`tx-toggle-btn ${splitType === 'equal' ? 'active-expense' : ''}`}
                                    onClick={() => setSplitType('equal')}
                                >
                                    Equal Split
                                </button>
                                <button
                                    type="button"
                                    className={`tx-toggle-btn ${splitType === 'custom' ? 'active-income' : ''}`}
                                    onClick={() => setSplitType('custom')}
                                >
                                    Custom Amounts
                                </button>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            onClick={() => {
                                if (!upiId.includes('@')) { showToast('Enter a valid UPI ID', 'error'); return; }
                                if (!totalAmount || isNaN(parseFloat(totalAmount))) { showToast('Enter a valid amount', 'error'); return; }
                                setStep(2);
                            }}
                        >
                            Next → Members
                        </Button>
                    </Card>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <Card className="flat groups-step-card animate-fade-in-scale">
                        <h3 className="step-heading">Add Group Members</h3>
                        <div className="add-friend-row">
                            <Input
                                placeholder="Member name"
                                value={newFriend}
                                onChange={e => setNewFriend(e.target.value)}
                                style={{ marginBottom: 0, flex: 1 }}
                            />
                            <Button icon={<Plus size={16} />} size="sm" onClick={handleAddFriend}>
                                Add Member
                            </Button>
                        </div>

                        <div className="people-list">
                            <div className="person-chip self">
                                <div className="person-avatar">Y</div>
                                <span>You (Paid Full Bill)</span>
                            </div>
                            {friends.map((f, i) => (
                                <div key={i} className="person-chip custom-split-chip">
                                    <div className="person-avatar" style={{ background: `hsl(${i * 60 + 120}, 60%, 45%)` }}>
                                        {f.name[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ flex: 1 }}>{f.name}</span>

                                    {splitType === 'custom' && (
                                        <input
                                            type="number"
                                            className="glass-input custom-split-input"
                                            placeholder="₹ Share"
                                            value={f.customAmount || ''}
                                            onChange={e => handleCustomAmountChange(i, e.target.value)}
                                        />
                                    )}

                                    <button className="remove-person" onClick={() => handleRemoveFriend(i)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="split-preview">
                            {friends.length + 1} members · {splitType === 'equal' ? (
                                <>Each pays <strong>{formatCurrency(calculatePerPerson())}</strong></>
                            ) : (
                                <>Custom split enabled</>
                            )}
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button variant="ghost" fullWidth onClick={() => setStep(1)}>← Back</Button>
                            <Button fullWidth onClick={handleSplit} disabled={friends.length === 0}>
                                Generate Split Summary
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3 — Results & Settlement */}
                {step === 3 && (
                    <Card className="flat groups-step-card animate-fade-in-scale">
                        <h3 className="step-heading">Settlement Dashboard</h3>

                        <div className="split-amount-hero">
                            <p>{groupName || 'Expense Split'}</p>
                            <h1>{formatCurrency(parseFloat(totalAmount))}</h1>
                            <span>Total Bill Paid by You</span>
                        </div>

                        <div className="friend-links">
                            {friends.map((f, i) => {
                                const amountOwed = splitType === 'custom'
                                    ? (f.customAmount || 0)
                                    : calculatePerPerson();

                                const upiLink = `upi://pay?pa=${upiId}&pn=User&am=${amountOwed.toFixed(2)}&tn=${encodeURIComponent(groupName || 'Expense Split')}`;

                                return (
                                    <div key={i} className={`friend-link-row ${f.isSettled ? 'settled-row' : ''}`}>
                                        <div className="person-avatar sm" style={{ background: `hsl(${i * 60 + 120}, 60%, 45%)` }}>
                                            {f.name[0]?.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 600 }}>{f.name}</span>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Owes {formatCurrency(amountOwed)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                            <button
                                                className={`settle-btn ${f.isSettled ? 'done' : ''}`}
                                                onClick={() => handleToggleSettled(i)}
                                            >
                                                <CheckCircle size={13} /> {f.isSettled ? 'Settled' : 'Mark Settled'}
                                            </button>

                                            <button className="copy-btn" onClick={() => {
                                                navigator.clipboard.writeText(upiLink);
                                                showToast(`Payment link for ${f.name} copied!`, 'success');
                                            }}>
                                                <LinkIcon size={13} /> Copy UPI Link
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="qr-wrapper" style={{ marginTop: '1.5rem' }}>
                            <QrCode size={18} style={{ marginBottom: '0.3rem', color: 'var(--accent-primary)' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>QR Code generated for main UPI payment link.</p>
                        </div>

                        <Button variant="secondary" fullWidth onClick={handleReset} style={{ marginTop: '1rem' }}>
                            Start New Group Split
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Groups;
