import Card from '../components/Card';
import Button from '../components/Button';
import { Crown } from 'lucide-react';

const Paywall = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '50%', marginBottom: '2rem' }}>
                <Crown size={48} color="#fbbf24" />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Upgrade to Premium</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Unlock AI Insights, Bill Predictions, and Unlimited Goals.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Card style={{ textAlign: 'left' }}>
                    <h3>Free Plan</h3>
                    <p>Basic Expense Tracking</p>
                </Card>
                <Card style={{ textAlign: 'left', border: '1px solid var(--accent-primary)' }}>
                    <h3 style={{ color: 'var(--accent-primary)' }}>Premium Plan</h3>
                    <p>AI Coach + All Features</p>
                    <Button style={{ marginTop: '1rem', width: '100%' }}>Go Premium</Button>
                </Card>
            </div>
        </div>
    );
};

export default Paywall;
