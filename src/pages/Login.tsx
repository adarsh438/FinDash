import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail, currentUser, loginAsDemo } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await loginWithEmail(email, password);
                showToast('Welcome back!', 'success');
            } else {
                await signupWithEmail(email, password);
                showToast('Account created!', 'success');
            }
        } catch {
            showToast('Authentication failed. Check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);

    return (
        <div className="login-container">
            <div className="ambient-glow" />

            <div className="content-wrapper">
                {/* Left — Animated Brand */}
                <div className="animation-section">
                    <div className="rupee-symbol">₹</div>
                    <div className="orbit-ring ring-1" />
                    <div className="orbit-ring ring-2" />
                    <div className="orbit-ring ring-3" />
                    <div className="brand-tag">
                        <span className="brand-tag-name">FinDash</span>
                        <span className="brand-tag-sub">AI-Powered Finance</span>
                    </div>
                </div>

                {/* Right — Login Card */}
                <div className="login-card">
                    <div className="card-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
                        <p>{isLogin ? 'Sign in to your account.' : 'Join the future of personal finance.'}</p>
                    </div>

                    <div className="google-login-section">
                        <button className="google-btn" onClick={async () => {
                            try {
                                await loginWithGoogle();
                                showToast('Signed in with Google!', 'success');
                            } catch {
                                showToast('Google sign in failed.', 'error');
                            }
                        }}>
                            <span className="google-icon-wrapper">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google" width={18} height={18} />
                            </span>
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <div className="auth-divider"><span>OR</span></div>

                    <form onSubmit={handleEmailAuth} className="auth-form">
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input type="email" className="styled-input"
                                placeholder="name@example.com" value={email}
                                onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="password-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="styled-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="demo-section">
                        <button type="button" className="demo-btn" onClick={() => loginAsDemo()}>
                            🎮 Try Demo Mode
                        </button>
                    </div>

                    <div className="auth-switch">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
