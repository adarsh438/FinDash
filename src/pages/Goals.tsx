import Card from '../components/Card';
import { Target } from 'lucide-react';

const Goals = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Target size={32} color="var(--accent-success)" />
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Financial Goals</h1>
            </div>
            <Card>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Set and track your savings goals here.
                </p>
            </Card>
        </div>
    );
};

export default Goals;
