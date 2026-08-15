import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth } from '../services/firebase';
import { Mail, RefreshCw, CheckCircle, X } from 'lucide-react';
import './EmailVerificationBanner.css';

const EmailVerificationBanner: React.FC = () => {
    const { currentUser, isDemo, resendVerificationEmail } = useAuth();
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Only display if user is logged in, not in demo mode, email is not verified, and banner not dismissed
    if (!currentUser || isDemo || currentUser.emailVerified || dismissed) {
        return null;
    }

    const handleResend = async () => {
        setSending(true);
        try {
            await resendVerificationEmail();
            showToast('Verification email sent! Please check your inbox and spam folder.', 'success');
        } catch (err: any) {
            console.error('[Auth] Resend verification email failed:', err);
            const msg = err?.code === 'auth/too-many-requests'
                ? 'Too many requests. Please wait a few minutes before trying again.'
                : (err?.message || 'Failed to send verification email. Try again later.');
            showToast(msg, 'error');
        } finally {
            setSending(false);
        }
    };

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    showToast('Email verified successfully! 🎉', 'success');
                    window.location.reload();
                } else {
                    showToast('Email is not verified yet. Please check your inbox or click Resend Email.', 'info');
                }
            }
        } catch (err: any) {
            console.error('[Auth] Check verification status error:', err);
            showToast('Could not check status. Please try again.', 'error');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="email-verify-banner animate-fade-in">
            <div className="email-verify-content">
                <Mail size={16} className="email-verify-icon" />
                <span>
                    Please verify your email address (<strong>{currentUser.email}</strong>) to secure your account.
                </span>
            </div>
            <div className="email-verify-actions">
                <button
                    className="email-resend-btn"
                    onClick={handleResend}
                    disabled={sending || checking}
                >
                    {sending ? (
                        <>
                            <RefreshCw size={13} className="spin-icon" /> Sending...
                        </>
                    ) : (
                        'Resend Email'
                    )}
                </button>
                <button
                    className="email-resend-btn verify-check-btn"
                    onClick={handleCheckStatus}
                    disabled={sending || checking}
                    title="Check if you have already clicked the link in your email"
                >
                    {checking ? (
                        <>
                            <RefreshCw size={13} className="spin-icon" /> Checking...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={13} /> I've Verified
                        </>
                    )}
                </button>
                <button
                    className="email-dismiss-btn"
                    onClick={() => setDismissed(true)}
                    title="Dismiss notification"
                    aria-label="Dismiss banner"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;
