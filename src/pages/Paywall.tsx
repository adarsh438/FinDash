import Card from '../components/Card';
import Button from '../components/Button';
import { Crown, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

const Paywall = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const handleUpgrade = async () => {
        if (!currentUser) return;
        setProcessing(true);

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: 99900, // Amount in paise = ₹999.00
            currency: "INR",
            name: "AI Finance Coach",
            description: "Premium Subscription",
            image: "https://via.placeholder.com/150",
            handler: async function (response: any) {
                try {
                    console.log("Payment ID: ", response.razorpay_payment_id);
                    await userService.upgradeToPremium(currentUser.uid);
                    await refreshProfile();
                    alert("Payment Successful! Welcome to Premium 🌟");
                    navigate('/');
                } catch (error) {
                    console.error("Upgrade failed after payment", error);
                    alert("Payment successful but activation failed. Contact support.");
                }
            },
            prefill: {
                name: currentUser.displayName || "",
                email: currentUser.email || "",
                contact: ""
            },
            theme: {
                color: "#6366f1"
            },
            modal: {
                ondismiss: function () {
                    setProcessing(false);
                }
            }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
            alert("Payment Failed: " + response.error.description);
            setProcessing(false);
        });
        rzp1.open();
    };

    if (userProfile?.isPremium) {
        return (
            <div className="paywall-container">
                <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Crown size={64} color="var(--accent-warning)" fill="var(--accent-warning)" />
                    </div>
                    <h1>You are Premium! 🌟</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Thank you for supporting us. You have full access to AI Coach and Bill Predictions.
                    </p>
                    <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="paywall-container">
            <div className="paywall-header">
                <Crown size={48} color="var(--accent-warning)" />
                <h1>Upgrade to Pro</h1>
                <p>Unlock the full power of AI for your finances.</p>
            </div>

            <div className="plans-grid">
                <Card className="plan-card featured">
                    <div className="plan-badge">MOST POPULAR</div>
                    <h2>Monthly Pro</h2>
                    <div className="price">₹999<span>/mo</span></div>

                    <ul className="features-list">
                        <li><Check size={16} color="var(--accent-success)" /> Unlimited AI Coach Chat</li>
                        <li><Check size={16} color="var(--accent-success)" /> Smart Bill Predictions</li>
                        <li><Check size={16} color="var(--accent-success)" /> Advanced Analytics</li>
                        <li><Check size={16} color="var(--accent-success)" /> Priority Support</li>
                    </ul>

                    <Button
                        variant="primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        onClick={handleUpgrade}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Start Free Trial'}
                    </Button>
                    <p className="guarantee">Cancel anytime. No questions asked.</p>
                </Card>
            </div>
        </div>
    );
};

export default Paywall;
