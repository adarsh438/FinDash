import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { Check, Shield, Crown } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // 1. Mock Checkout
            const order = await paymentService.initiateCheckout(currentUser.uid);

            // 2. Mock Confirm
            await paymentService.confirmPayment(currentUser.uid, order.orderId);

            showToast("Welcome to Premium! Features unlocked.", "success");
            onClose();
        } catch (error: any) {
            console.error("Upgrade failed:", error);
            showToast("Payment failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        "Advanced Analytics & Trends",
        "AI-Powered Bill Predictions",
        "Unlimited Goals & Transactions",
        "Personalized AI Coach Insights"
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Premium">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{
                    marginBottom: '1.5rem',
                    display: 'inline-flex',
                    padding: '1.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.2) 100%)',
                    border: '1px solid rgba(255,215,0,0.3)'
                }}>
                    <Crown size={48} color="#FFD700" />
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Unlock Full Potential</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Take control of your finances with our premium tools.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {benefits.map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ background: 'var(--accent-success)', borderRadius: '50%', padding: '2px' }}>
                                <Check size={12} color="white" />
                            </div>
                            <span>{b}</span>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--accent-info)' }}>
                        <Shield size={14} />
                        <strong>Safe & Secure</strong>
                    </div>
                    This is a secure mocked transaction for developer preview.
                    No real money will be deducted.
                </div>

                <Button
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', background: 'var(--gradient-primary)' }}
                >
                    {loading ? 'Processing...' : 'Upgrade Now - ₹499/Year'}
                </Button>
            </div>
        </Modal>
    );
};

export default UpgradeModal;
