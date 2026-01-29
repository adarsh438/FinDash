import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Smartphone, Globe } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail, currentUser, loginAsDemo } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLogin, setIsLogin] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await loginWithEmail(email, password);
                showToast('Successfully logged in!', 'success');
            } else {
                await signupWithEmail(email, password);
                showToast('Account created successfully!', 'success');
            }
        } catch (error) {
            console.error("Auth error:", error);
            showToast("Authentication failed. Please check your credentials.", 'error');
        } finally {
            setLoading(false);
        }
    };


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

                    <div className="google-login-section">
                        <button className="google-btn" onClick={async () => {
                            try {
                                await loginWithGoogle();
                                showToast('Successfully logged in with Google!', 'success');
                            } catch (e) {
                                showToast('Google login failed.', 'error');
                            }
                        }}>
                            <span className="google-icon-wrapper">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
                            </span>
                            <span className="google-btn-text">Continue with Google</span>
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <form onSubmit={handleEmailAuth}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    className="styled-input"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    className="styled-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot Password?</a>
                            </div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    {/* Demo Button */}
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => loginAsDemo()}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                marginBottom: '1rem'
                            }}
                        >
                            <span>🎮</span> Try Demo Mode
                        </button>
                    </div>

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
