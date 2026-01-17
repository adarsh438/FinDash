import Card from '../components/Card';

const Expenses = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Expenses</h1>
            <Card>
                <p style={{ color: 'var(--text-secondary)' }}>Expense tracking features coming soon.</p>
            </Card>
        </div>
    );
};

export default Expenses;
