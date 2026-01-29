import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Link as LinkIcon, QrCode } from 'lucide-react';
// QRCodeSVG and ArrowRight removed as they were unused or causing issues

const Groups = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [groupName, setGroupName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [upiId, setUpiId] = useState(''); // New state for UPI ID
    const [friends, setFriends] = useState<string[]>([]);
    const [newFriend, setNewFriend] = useState('');
    const [splitResult, setSplitResult] = useState<{ perPerson: number, upiLink: string } | null>(null);

    const handleAddFriend = () => {
        if (newFriend.trim()) {
            setFriends([...friends, newFriend.trim()]);
            setNewFriend('');
        }
    };

    const handleSplit = () => {
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }
        if (!upiId.includes('@')) {
            showToast("Please enter a valid UPI ID (e.g. name@bank)", "error");
            return;
        }
        if (friends.length === 0) {
            showToast("Add at least one friend to split with", "error");
            return;
        }

        const totalPeople = friends.length + 1; // +1 for self
        const perPerson = amount / totalPeople;

        // Generate UPI link with user's ID
        const upiLink = `upi://pay?pa=${upiId}&pn=User&am=${perPerson.toFixed(2)}&tn=${encodeURIComponent(groupName || 'Expense Split')}`;

        setSplitResult({ perPerson, upiLink });
        showToast("Expense split calculated!", "success");
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '2rem' }}>
            <div className="dashboard-header">
                <h1>Group Split 🤝</h1>
                <p>Split bills with roommates or for trips instantly.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Input Section */}
                <Card>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="var(--accent-primary)" /> New Split
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input
                            label="Your UPI ID (to receive money)"
                            placeholder="e.g. mobile@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                        />
                        <Input
                            label="Group / Occasion Name"
                            placeholder="e.g. Goa Trip, Flat Rent"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Input
                            label="Total Amount (₹)"
                            type="number"
                            placeholder="0.00"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                        />

                        <div>
                            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Split with whom?</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Input
                                    placeholder="Friend's Name"
                                    value={newFriend}
                                    onChange={(e) => setNewFriend(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <Button onClick={handleAddFriend} icon={<Plus size={18} />}>
                                    Add
                                </Button>
                            </div>

                            {/* Friend Chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    fontSize: '0.9rem',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    You (Owner)
                                </span>
                                {friends.map((friend, idx) => (
                                    <span key={idx} style={{
                                        padding: '4px 12px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#60a5fa',
                                        borderRadius: '16px',
                                        fontSize: '0.9rem',
                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {friend}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSplit} style={{ marginTop: '1rem' }}>
                            Calculate Split
                        </Button>
                    </div>
                </Card>

                {/* Result Section */}
                <Card className={!splitResult ? 'disabled-card' : ''} style={{ opacity: splitResult ? 1 : 0.5, pointerEvents: splitResult ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LinkIcon size={20} color="var(--accent-success)" /> Payment Links
                    </h3>

                    {splitResult ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Each person owes</p>
                                <h1 style={{ fontSize: '3rem', color: 'var(--accent-success)', margin: '0.5rem 0' }}>
                                    {formatCurrency(splitResult.perPerson)}
                                </h1>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total: {formatCurrency(parseFloat(totalAmount))} / {friends.length + 1} people</p>
                            </div>

                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                                {/* Placeholder QR */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(splitResult.upiLink)}`}
                                    alt="UPI QR Code"
                                    width={150}
                                    height={150}
                                />
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Scan to Pay via Any UPI App
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {friends.map((friend, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        <span>{friend}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(splitResult.upiLink);
                                                showToast("Link copied!", "success");
                                            }}
                                            style={{
                                                background: 'none',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'var(--text-primary)',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
                            <QrCode size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>Enter details to generate payment links</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Groups;
