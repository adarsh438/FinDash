import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Globe } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = React.useState(false);

    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div className="login-container">
            <div className="ambient-glow"></div>

            <div className="content-wrapper">
                {/* Left Side: 3D Animation */}
                <div className="animation-section">
                    <div className="rupee-symbol">₹</div>
                    <div className="orbit-ring ring-1"></div>
                    <div className="orbit-ring ring-2"></div>
                    <div className="orbit-ring ring-3"></div>
                </div>

                {/* Right Side: Glass Login Card */}
                <div className="login-card">
                    <div className="card-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Enter your credentials to access your account.' : 'Join the future of finance today.'}</p>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input type="email" className="styled-input" placeholder="name@example.com" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type="password" className="styled-input" placeholder="••••••••" />
                        </div>
                    </div>

                    {isLogin && (
                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot Password?</a>
                        </div>
                    )}

                    <button className="login-btn" onClick={loginWithGoogle}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>

                    <div className="social-login">
                        <div className="social-btn"><Globe size={20} /></div>
                        <div className="social-btn"><Smartphone size={20} /></div>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: 0,
                                font: 'inherit'
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
