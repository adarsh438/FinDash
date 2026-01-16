import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Wallet } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)'
        }}>
            <Card style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                    <Wallet size={48} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to FinDash</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your AI-powered personal finance assistant.
                </p>

                <Button onClick={loginWithGoogle} style={{ width: '100%' }}>
                    Sign in with Google
                </Button>
            </Card>
        </div>
    );
};

export default Login;
