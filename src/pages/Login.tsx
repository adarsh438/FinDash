import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, KeyRound, ArrowLeft, Mail } from 'lucide-react';
import './Login.css';

const IS_DEV = import.meta.env.DEV;

function getAuthErrorMessage(error: any): { message: string; type: 'error' | 'info' } | null {
    const code = error?.code as string | undefined;

    if (IS_DEV) {
        console.error('[Auth] Raw error:', { code, message: error?.message, fullError: error });
    }

    switch (code) {
        case 'auth/popup-closed-by-user':
            return { message: 'Sign in cancelled.', type: 'info' };
        case 'auth/cancelled-popup-request':
            return null;
        case 'auth/popup-blocked':
            return { message: 'Popup was blocked by your browser. Please allow popups or try again.', type: 'error' };
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return { message: 'Invalid email or password. Please check your credentials.', type: 'error' };
        case 'auth/email-already-in-use':
            return { message: 'An account already exists with this email address.', type: 'error' };
        case 'auth/weak-password':
            return { message: 'Password should be at least 6 characters long.', type: 'error' };
        case 'auth/too-many-requests':
            return { message: 'Access blocked due to many failed attempts. Try resetting your password or wait a bit.', type: 'error' };
        case 'auth/invalid-email':
            return { message: 'Please enter a valid email address.', type: 'error' };
        case 'auth/user-disabled':
            return { message: 'This account has been disabled. Please contact support.', type: 'error' };
        case 'auth/unauthorized-domain':
            return { message: 'This domain is not authorized for sign-in.', type: 'error' };
        case 'auth/operation-not-allowed':
            return { message: 'This authentication method is not enabled. Please contact support.', type: 'error' };
        case 'auth/account-exists-with-different-credential':
            return { message: 'An account already exists with this email using a different sign-in method.', type: 'error' };
        default:
            return {
                message: error?.message || 'Authentication failed. Please try again.',
                type: 'error'
            };
    }
}

const Login = () => {
    const {
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        sendPasswordReset,
        setRememberMe,
        currentUser,
        loginAsDemo
    } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMeState] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Password reset modal states
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (currentUser) navigate('/');
    }, [currentUser, navigate]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setRememberMe(rememberMe);

            if (isLogin) {
                await loginWithEmail(email.trim(), password);
                showToast('Welcome back!', 'success');
            } else {
                if (!name.trim()) {
                    showToast('Please enter your name.', 'error');
                    setLoading(false);
                    return;
                }
                await signupWithEmail(email.trim(), password, name.trim());
                showToast('Account created successfully! Check your inbox for a verification email.', 'success');
            }
        } catch (err: any) {
            const errInfo = getAuthErrorMessage(err);
            if (errInfo) {
                showToast(errInfo.message, errInfo.type);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await setRememberMe(rememberMe);
            await loginWithGoogle();
            showToast('Signed in with Google!', 'success');
        } catch (err: any) {
            const errorInfo = getAuthErrorMessage(err);
            if (errorInfo) {
                showToast(errorInfo.message, errorInfo.type);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail.trim()) {
            showToast('Please enter your registered email address.', 'error');
            return;
        }

        setResetLoading(true);
        try {
            await sendPasswordReset(resetEmail.trim());
            showToast('Password reset link sent to your email!', 'success');
            setIsResetOpen(false);
            setResetEmail('');
        } catch (err: any) {
            const errorInfo = getAuthErrorMessage(err);
            if (errorInfo) {
                showToast(errorInfo.message, errorInfo.type);
            }
        } finally {
            setResetLoading(false);
        }
    };

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
                        <span className="brand-tag-sub">AI-Powered SaaS Finance</span>
                    </div>
                </div>

                {/* Right — Login Card */}
                <div className="login-card">
                    {isResetOpen ? (
                        /* Password Reset Flow */
                        <div className="reset-password-flow animate-fade-in">
                            <button
                                className="back-to-login-btn"
                                onClick={() => setIsResetOpen(false)}
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>

                            <div className="card-header" style={{ marginTop: '1rem' }}>
                                <div className="reset-icon-wrapper">
                                    <KeyRound size={24} />
                                </div>
                                <h2>Reset Password</h2>
                                <p>Enter your email address and we'll send you instructions to reset your password.</p>
                            </div>

                            <form onSubmit={handlePasswordResetSubmit} className="auth-form">
                                <div className="input-group">
                                    <label className="input-label">Registered Email</label>
                                    <div className="input-icon-wrap">
                                        <Mail size={16} className="field-icon" />
                                        <input
                                            type="email"
                                            className="styled-input with-icon"
                                            placeholder="name@example.com"
                                            value={resetEmail}
                                            onChange={e => setResetEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="login-btn" disabled={resetLoading}>
                                    {resetLoading ? 'Sending link...' : 'Send Reset Link'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Main Sign In / Sign Up Flow */
                        <>
                            <div className="card-header">
                                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                                <p>{isLogin ? 'Sign in to access your financial dashboard.' : 'Start managing your finances like a pro.'}</p>
                            </div>

                            <div className="google-login-section">
                                <button
                                    className="google-btn"
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading}
                                    type="button"
                                >
                                    {googleLoading ? (
                                        <span className="google-icon-wrapper">
                                            <span className="btn-spinner" />
                                        </span>
                                    ) : (
                                        <span className="google-icon-wrapper">
                                            <img
                                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                                alt="Google"
                                                width={18}
                                                height={18}
                                            />
                                        </span>
                                    )}
                                    <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                                </button>
                            </div>

                            <div className="auth-divider"><span>OR</span></div>

                            <form onSubmit={handleEmailAuth} className="auth-form">
                                {!isLogin && (
                                    <div className="input-group">
                                        <label className="input-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="styled-input"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="styled-input"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
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
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="pw-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-options">
                                    <label className="remember-me-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={e => setRememberMeState(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>

                                    {isLogin && (
                                        <button
                                            type="button"
                                            className="forgot-link-btn"
                                            onClick={() => {
                                                setResetEmail(email);
                                                setIsResetOpen(true);
                                            }}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>

                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="btn-spinner" />
                                    ) : (
                                        isLogin ? 'Sign In' : 'Create Account'
                                    )}
                                </button>
                            </form>

                            <div className="demo-section">
                                <button type="button" className="demo-btn" onClick={() => loginAsDemo()}>
                                    🎮 Try Demo Mode
                                </button>
                            </div>

                            <div className="auth-switch">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    className="auth-switch-btn"
                                    onClick={() => setIsLogin(!isLogin)}
                                    type="button"
                                >
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
