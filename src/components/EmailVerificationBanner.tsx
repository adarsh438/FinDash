import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, RefreshCw, X } from 'lucide-react';
import './EmailVerificationBanner.css';

const EmailVerificationBanner: React.FC = () => {
    const { currentUser, isDemo, resendVerificationEmail } = useAuth();
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Only display if user is logged in, not in demo mode, email is not verified, and banner not dismissed
    if (!currentUser || isDemo || currentUser.emailVerified || dismissed) {
        return null;
    }

    const handleResend = async () => {
        setSending(true);
        try {
            await resendVerificationEmail();
            showToast('Verification email sent! Check your inbox.', 'success');
        } catch (err: any) {
            const msg = err?.code === 'auth/too-many-requests'
                ? 'Too many requests. Please wait a moment before trying again.'
                : 'Failed to send verification email. Try again later.';
            showToast(msg, 'error');
        } finally {
            setSending(false);
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
                    disabled={sending}
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
