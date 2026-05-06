import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, User, Bell, Shield, ChevronRight } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const CURRENCIES = [
    { value: 'USD', label: 'USD ($) — US Dollar' },
    { value: 'EUR', label: 'EUR (€) — Euro' },
    { value: 'GBP', label: 'GBP (£) — British Pound' },
    { value: 'INR', label: 'INR (₹) — Indian Rupee' },
    { value: 'JPY', label: 'JPY (¥) — Japanese Yen' },
    { value: 'AUD', label: 'AUD ($) — Australian Dollar' },
    { value: 'CAD', label: 'CAD ($) — Canadian Dollar' },
];

interface ToggleProps {
    checked: boolean;
    onChange: () => void;
    id: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, id }) => (
    <label className="toggle-label" htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="toggle-input" />
        <span className="toggle-track">
            <span className="toggle-thumb" />
        </span>
    </label>
);

const Settings = () => {
    const { currency, setCurrency } = useCurrency();
    const { currentUser, userProfile } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [emailDigest, setEmailDigest] = useState(false);

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const email = currentUser?.email || '—';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="settings-page animate-fade-in">
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences."
                icon={<SettingsIcon size={22} />}
            />

            <div className="settings-grid">
                {/* Profile */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <User size={16} />
                        <h2>Profile</h2>
                    </div>
                    <div className="profile-card-inner">
                        <div className="profile-avatar-large">{initials}</div>
                        <div>
                            <p className="profile-name">{displayName}</p>
                            <p className="profile-email">{email}</p>
                            <span className={`profile-plan-badge ${userProfile?.isPremium ? 'premium' : ''}`}>
                                {userProfile?.isPremium ? '✦ Premium Member' : 'Free Plan'}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Preferences */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <Globe size={16} />
                        <h2>Preferences</h2>
                    </div>

                    <div className="settings-row">
                        <div>
                            <p className="settings-row-label">Base Currency</p>
                            <p className="settings-row-desc">Used for all balance displays</p>
                        </div>
                        <select
                            className="glass-input settings-select"
                            value={currency}
                            onChange={e => setCurrency(e.target.value as any)}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <Bell size={16} />
                        <h2>Notifications</h2>
                    </div>

                    <div className="settings-row">
                        <div>
                            <p className="settings-row-label">Bill Reminders</p>
                            <p className="settings-row-desc">Get notified before bills are due</p>
                        </div>
                        <Toggle
                            id="bill-notifications"
                            checked={notifications}
                            onChange={() => setNotifications(!notifications)}
                        />
                    </div>

                    <div className="settings-row">
                        <div>
                            <p className="settings-row-label">Weekly Email Digest</p>
                            <p className="settings-row-desc">Summary of your spending each week</p>
                        </div>
                        <Toggle
                            id="email-digest"
                            checked={emailDigest}
                            onChange={() => setEmailDigest(!emailDigest)}
                        />
                    </div>
                </Card>

                {/* Account */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <Shield size={16} />
                        <h2>Account</h2>
                    </div>
                    <div className="settings-link-list">
                        <button className="settings-link-item">
                            <span>Change Password</span>
                            <ChevronRight size={16} />
                        </button>
                        <button className="settings-link-item">
                            <span>Export My Data</span>
                            <ChevronRight size={16} />
                        </button>
                        <button className="settings-link-item danger">
                            <span>Delete Account</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </Card>

                {/* About */}
                <div className="settings-about">
                    <p>FinDash v1.0 · Built with ❤️ · <a href="#">Privacy Policy</a></p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
