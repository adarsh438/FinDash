import { useState } from 'react';
import { Users, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import './Groups.css';

const Groups = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [groupName, setGroupName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [friends, setFriends] = useState<string[]>([]);
    const [newFriend, setNewFriend] = useState('');
    const [splitResult, setSplitResult] = useState<{ perPerson: number; upiLink: string } | null>(null);

    const handleAddFriend = () => {
        if (!newFriend.trim()) return;
        setFriends(prev => [...prev, newFriend.trim()]);
        setNewFriend('');
    };

    const handleRemoveFriend = (idx: number) => {
        setFriends(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSplit = () => {
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
        if (!upiId.includes('@')) { showToast('Enter a valid UPI ID (e.g. name@bank)', 'error'); return; }
        if (friends.length === 0) { showToast('Add at least one friend', 'error'); return; }

        const totalPeople = friends.length + 1;
        const perPerson = amount / totalPeople;
        const upiLink = `upi://pay?pa=${upiId}&pn=User&am=${perPerson.toFixed(2)}&tn=${encodeURIComponent(groupName || 'Expense Split')}`;
        setSplitResult({ perPerson, upiLink });
        setStep(3);
        showToast('Split calculated!', 'success');
    };

    const handleReset = () => {
        setStep(1);
        setGroupName(''); setTotalAmount(''); setUpiId('');
        setFriends([]); setNewFriend(''); setSplitResult(null);
    };

    return (
        <div className="groups-page animate-fade-in">
            <PageHeader
                title="Group Split"
                subtitle="Split bills with friends instantly. Generate UPI payment links."
                icon={<Users size={22} />}
            />

            {/* Step indicator */}
            <div className="split-steps">
                {['Details', 'People', 'Results'].map((label, i) => (
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
                        <h3 className="step-heading">Expense Details</h3>
                        <Input label="Your UPI ID" placeholder="e.g. mobile@paytm"
                            value={upiId} onChange={e => setUpiId(e.target.value)} />
                        <Input label="Occasion Name" placeholder="e.g. Goa Trip"
                            value={groupName} onChange={e => setGroupName(e.target.value)} />
                        <Input label="Total Amount (₹)" type="number" placeholder="0.00"
                            value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                        <Button fullWidth onClick={() => {
                            if (!upiId.includes('@')) { showToast('Enter a valid UPI ID', 'error'); return; }
                            if (!totalAmount || isNaN(parseFloat(totalAmount))) { showToast('Enter a valid amount', 'error'); return; }
                            setStep(2);
                        }}>
                            Next →
                        </Button>
                    </Card>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <Card className="flat groups-step-card animate-fade-in-scale">
                        <h3 className="step-heading">Add People</h3>
                        <div className="add-friend-row">
                            <Input placeholder="Friend's name" value={newFriend}
                                onChange={e => setNewFriend(e.target.value)}
                                style={{ marginBottom: 0, flex: 1 }} />
                            <Button icon={<Plus size={16} />} size="sm" onClick={handleAddFriend}>Add</Button>
                        </div>

                        <div className="people-list">
                            <div className="person-chip self">
                                <div className="person-avatar">Y</div>
                                <span>You (Owner)</span>
                            </div>
                            {friends.map((f, i) => (
                                <div key={i} className="person-chip">
                                    <div className="person-avatar" style={{ background: `hsl(${i * 60}, 60%, 45%)` }}>
                                        {f[0]?.toUpperCase()}
                                    </div>
                                    <span>{f}</span>
                                    <button className="remove-person" onClick={() => handleRemoveFriend(i)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="split-preview">
                            {friends.length + 1} people · Each pays{' '}
                            <strong>{formatCurrency(parseFloat(totalAmount) / (friends.length + 1))}</strong>
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button variant="ghost" fullWidth onClick={() => setStep(1)}>← Back</Button>
                            <Button fullWidth onClick={handleSplit} disabled={friends.length === 0}>
                                Generate Split
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3 — Results */}
                {step === 3 && splitResult && (
                    <Card className="flat groups-step-card animate-fade-in-scale">
                        <h3 className="step-heading">Payment Links</h3>

                        <div className="split-amount-hero">
                            <p>Each person owes</p>
                            <h1>{formatCurrency(splitResult.perPerson)}</h1>
                            <span>{formatCurrency(parseFloat(totalAmount))} ÷ {friends.length + 1} people</span>
                        </div>

                        <div className="qr-wrapper">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(splitResult.upiLink)}`}
                                alt="UPI QR Code"
                                width={160} height={160}
                            />
                            <p>Scan to Pay via Any UPI App</p>
                        </div>

                        <div className="friend-links">
                            {friends.map((f, i) => (
                                <div key={i} className="friend-link-row">
                                    <div className="person-avatar sm" style={{ background: `hsl(${i * 60}, 60%, 45%)` }}>
                                        {f[0]?.toUpperCase()}
                                    </div>
                                    <span>{f}</span>
                                    <button className="copy-btn" onClick={() => {
                                        navigator.clipboard.writeText(splitResult.upiLink);
                                        showToast('Link copied!', 'success');
                                    }}>
                                        <LinkIcon size={13} /> Copy
                                    </button>
                                </div>
                            ))}
                        </div>

                        <Button variant="secondary" fullWidth onClick={handleReset}>
                            Start New Split
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Groups;
