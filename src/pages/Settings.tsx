import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Globe,
    User as UserIcon,
    Bell,
    Shield,
    ChevronRight,
    Camera,
    Download,
    Trash2,
    Lock,
    X,
    CheckCircle,
    Edit3
} from 'lucide-react';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteUser
} from 'firebase/auth';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { sanitizeInput, validatePassword } from '../utils/security';
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

const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
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
    const { currentUser, userProfile, logout, isDemo } = useAuth();
    const { showToast } = useToast();

    // Preferences state
    const [billNotifications, setBillNotifications] = useState(
        userProfile?.preferences?.billNotifications ?? true
    );
    const [emailDigest, setEmailDigest] = useState(
        userProfile?.preferences?.emailDigest ?? false
    );
    const [budgetAlerts, setBudgetAlerts] = useState(
        userProfile?.preferences?.budgetAlerts ?? true
    );

    // Sync preferences state when userProfile loads
    useEffect(() => {
        if (userProfile?.preferences) {
            if (userProfile.preferences.billNotifications !== undefined) {
                setBillNotifications(userProfile.preferences.billNotifications);
            }
            if (userProfile.preferences.emailDigest !== undefined) {
                setEmailDigest(userProfile.preferences.emailDigest);
            }
            if (userProfile.preferences.budgetAlerts !== undefined) {
                setBudgetAlerts(userProfile.preferences.budgetAlerts);
            }
            if (userProfile.preferences.currency) {
                setCurrency(userProfile.preferences.currency as any);
            }
        }
    }, [userProfile, setCurrency]);

    // Modal states
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [changePwModalOpen, setChangePwModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Edit Profile form
    const [nameInput, setNameInput] = useState(userProfile?.displayName || currentUser?.displayName || '');
    const [bioInput, setBioInput] = useState(userProfile?.bio || '');
    const [phoneInput, setPhoneInput] = useState(userProfile?.phoneNumber || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Avatar form
    const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.photoURL || '');
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');

    // Change Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    // Delete Account form
    const [deletePassword, setDeletePassword] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const email = currentUser?.email || '—';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    // Toggle Preferences Handler
    const handlePreferenceToggle = async (key: 'billNotifications' | 'emailDigest' | 'budgetAlerts', currentValue: boolean) => {
        const newValue = !currentValue;
        if (key === 'billNotifications') setBillNotifications(newValue);
        if (key === 'emailDigest') setEmailDigest(newValue);
        if (key === 'budgetAlerts') setBudgetAlerts(newValue);

        if (currentUser && !isDemo) {
            try {
                await userService.updatePreferences(currentUser.uid, { [key]: newValue });
                showToast('Preferences updated', 'success');
            } catch {
                showToast('Failed to save preference', 'error');
            }
        }
    };

    // Currency Handler
    const handleCurrencyChange = async (newCurr: string) => {
        setCurrency(newCurr as any);
        if (currentUser && !isDemo) {
            try {
                await userService.updatePreferences(currentUser.uid, { currency: newCurr as any });
                showToast(`Currency changed to ${newCurr}`, 'success');
            } catch {
                showToast('Failed to save currency setting', 'error');
            }
        }
    };

    // Save Edit Profile
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = sanitizeInput(nameInput);
        const cleanBio = sanitizeInput(bioInput);
        const cleanPhone = sanitizeInput(phoneInput);

        if (!cleanName) {
            showToast('Name cannot be empty', 'error');
            return;
        }

        setSavingProfile(true);
        try {
            if (currentUser && !isDemo) {
                await userService.updateUserProfile(currentUser.uid, {
                    displayName: cleanName,
                    bio: cleanBio,
                    phoneNumber: cleanPhone
                });
                showToast('Profile updated successfully!', 'success');
            } else if (isDemo) {
                showToast('Demo profile updated locally!', 'success');
            }
            setEditProfileOpen(false);
        } catch {
            showToast('Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    // Save Avatar
    const handleSaveAvatar = async (urlToSave: string) => {
        if (!currentUser) return;
        try {
            if (!isDemo) {
                await userService.updateUserProfile(currentUser.uid, { photoURL: urlToSave });
            }
            showToast('Avatar updated!', 'success');
            setAvatarModalOpen(false);
            setCustomAvatarUrl('');
        } catch {
            showToast('Failed to update avatar', 'error');
        }
    };

    // Export Data
    const handleExportData = async () => {
        if (!currentUser) return;
        try {
            showToast('Preparing your data export...', 'info');
            const data = await userService.exportUserData(currentUser.uid);
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, 2)
            )}`;
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', jsonString);
            downloadAnchor.setAttribute('download', `findash-export-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Data export error:', error);
            showToast('Failed to export data', 'error');
        }
    };

    // Change Password Handler
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDemo) {
            showToast('Password change disabled in demo mode.', 'info');
            setChangePwModalOpen(false);
            return;
        }

        const pwValidation = validatePassword(newPassword);
        if (!pwValidation.isValid) {
            showToast(pwValidation.error || 'Invalid password', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setChangingPw(true);
        try {
            if (currentUser && currentUser.email) {
                const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
                await updatePassword(currentUser, newPassword);
                showToast('Password changed successfully!', 'success');
                setChangePwModalOpen(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            const msg = err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential'
                ? 'Current password is incorrect.'
                : 'Failed to update password. Please try again.';
            showToast(msg, 'error');
        } finally {
            setChangingPw(false);
        }
    };

    // Delete Account Handler
    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDemo) {
            showToast('Account deletion disabled in demo mode.', 'info');
            setDeleteModalOpen(false);
            return;
        }

        setDeletingAccount(true);
        try {
            if (currentUser && currentUser.email) {
                const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
                await reauthenticateWithCredential(currentUser, credential);

                // 1. Wipe Firestore data
                await userService.deleteUserData(currentUser.uid);

                // 2. Delete auth user
                await deleteUser(currentUser);
                showToast('Account deleted. Goodbye!', 'info');
                await logout();
            }
        } catch (err: any) {
            const msg = err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential'
                ? 'Incorrect password.'
                : 'Failed to delete account. Please try again.';
            showToast(msg, 'error');
        } finally {
            setDeletingAccount(false);
        }
    };

    return (
        <div className="settings-page animate-fade-in">
            <PageHeader
                title="Settings"
                subtitle="Manage your profile, security, and application preferences."
                icon={<SettingsIcon size={22} />}
            />

            <div className="settings-grid">
                {/* Profile Card */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <UserIcon size={16} />
                        <h2>Profile</h2>
                    </div>
                    <div className="profile-card-inner">
                        <div className="avatar-wrapper" onClick={() => setAvatarModalOpen(true)}>
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt={displayName} className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-large">{initials}</div>
                            )}
                            <div className="avatar-overlay">
                                <Camera size={14} />
                            </div>
                        </div>
                        <div className="profile-details">
                            <p className="profile-name">{displayName}</p>
                            <p className="profile-email">{email}</p>
                            {userProfile?.bio && <p className="profile-bio">{userProfile.bio}</p>}
                            <div className="profile-badges">
                                <span className={`profile-plan-badge ${userProfile?.isPremium ? 'premium' : ''}`}>
                                    {userProfile?.isPremium ? '✦ Premium Member' : 'Free Plan'}
                                </span>
                            </div>
                        </div>
                        <button
                            className="edit-profile-btn"
                            onClick={() => {
                                setNameInput(displayName);
                                setBioInput(userProfile?.bio || '');
                                setPhoneInput(userProfile?.phoneNumber || '');
                                setEditProfileOpen(true);
                            }}
                        >
                            <Edit3 size={15} /> Edit Profile
                        </button>
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
                            <p className="settings-row-desc">Used for all balance displays and calculations</p>
                        </div>
                        <select
                            className="glass-input settings-select"
                            value={currency}
                            onChange={e => handleCurrencyChange(e.target.value)}
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
                            <p className="settings-row-desc">Get alerted before upcoming bill due dates</p>
                        </div>
                        <Toggle
                            id="bill-notifications"
                            checked={billNotifications}
                            onChange={() => handlePreferenceToggle('billNotifications', billNotifications)}
                        />
                    </div>

                    <div className="settings-row">
                        <div>
                            <p className="settings-row-label">Budget Warnings</p>
                            <p className="settings-row-desc">Alert when spending nears or exceeds monthly budget</p>
                        </div>
                        <Toggle
                            id="budget-alerts"
                            checked={budgetAlerts}
                            onChange={() => handlePreferenceToggle('budgetAlerts', budgetAlerts)}
                        />
                    </div>

                    <div className="settings-row">
                        <div>
                            <p className="settings-row-label">Weekly Email Digest</p>
                            <p className="settings-row-desc">Receive a summary report of your weekly finances</p>
                        </div>
                        <Toggle
                            id="email-digest"
                            checked={emailDigest}
                            onChange={() => handlePreferenceToggle('emailDigest', emailDigest)}
                        />
                    </div>
                </Card>

                {/* Account & Security */}
                <Card className="flat settings-section">
                    <div className="settings-section-header">
                        <Shield size={16} />
                        <h2>Account & Security</h2>
                    </div>
                    <div className="settings-link-list">
                        <button className="settings-link-item" onClick={() => setChangePwModalOpen(true)}>
                            <div className="link-item-left">
                                <Lock size={16} />
                                <span>Change Password</span>
                            </div>
                            <ChevronRight size={16} />
                        </button>
                        <button className="settings-link-item" onClick={handleExportData}>
                            <div className="link-item-left">
                                <Download size={16} />
                                <span>Export My Data (JSON)</span>
                            </div>
                            <ChevronRight size={16} />
                        </button>
                        <button className="settings-link-item danger" onClick={() => setDeleteModalOpen(true)}>
                            <div className="link-item-left">
                                <Trash2 size={16} />
                                <span>Delete Account</span>
                            </div>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </Card>

                {/* About */}
                <div className="settings-about">
                    <p>FinDash SaaS v2.0 · Production Edition · <a href="#">Terms</a> · <a href="#">Privacy</a></p>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {editProfileOpen && (
                <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
                    <div className="settings-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <h3>Edit Profile</h3>
                            <button onClick={() => setEditProfileOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="settings-modal-body">
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    type="text"
                                    className="styled-input"
                                    value={nameInput}
                                    onChange={e => setNameInput(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Bio / Headline</label>
                                <input
                                    type="text"
                                    className="styled-input"
                                    placeholder="e.g. Software Engineer, Tech Enthusiast"
                                    value={bioInput}
                                    onChange={e => setBioInput(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="styled-input"
                                    placeholder="+1 (555) 000-0000"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                />
                            </div>
                            <div className="settings-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setEditProfileOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={savingProfile}>
                                    {savingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Avatar Picker Modal */}
            {avatarModalOpen && (
                <div className="modal-overlay" onClick={() => setAvatarModalOpen(false)}>
                    <div className="settings-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <h3>Choose Avatar</h3>
                            <button onClick={() => setAvatarModalOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="settings-modal-body">
                            <p className="modal-subtext">Select a preset avatar or provide an image URL.</p>

                            <div className="preset-avatars-grid">
                                {PRESET_AVATARS.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className={`preset-avatar-item ${selectedAvatar === url ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedAvatar(url);
                                            handleSaveAvatar(url);
                                        }}
                                    >
                                        <img src={url} alt={`Avatar ${idx + 1}`} />
                                        {selectedAvatar === url && <CheckCircle size={16} className="avatar-check" />}
                                    </div>
                                ))}
                            </div>

                            <div className="auth-divider"><span>OR CUSTOM URL</span></div>

                            <div className="input-group">
                                <label className="input-label">Image URL</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="url"
                                        className="styled-input"
                                        placeholder="https://example.com/avatar.jpg"
                                        value={customAvatarUrl}
                                        onChange={e => setCustomAvatarUrl(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn-save"
                                        onClick={() => {
                                            if (customAvatarUrl.trim()) {
                                                handleSaveAvatar(customAvatarUrl.trim());
                                            }
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {changePwModalOpen && (
                <div className="modal-overlay" onClick={() => setChangePwModalOpen(false)}>
                    <div className="settings-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <h3>Change Password</h3>
                            <button onClick={() => setChangePwModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="settings-modal-body">
                            <div className="input-group">
                                <label className="input-label">Current Password</label>
                                <input
                                    type="password"
                                    className="styled-input"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    className="styled-input"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="styled-input"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="settings-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setChangePwModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={changingPw}>
                                    {changingPw ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="settings-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="settings-modal-header danger-header">
                            <h3>Delete Account</h3>
                            <button onClick={() => setDeleteModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleDeleteAccount} className="settings-modal-body">
                            <p className="danger-warning-text">
                                ⚠️ <strong>Warning:</strong> This action is permanent and will completely erase your profile, expenses, budgets, and all financial data.
                            </p>
                            <div className="input-group">
                                <label className="input-label">Enter Password to Confirm</label>
                                <input
                                    type="password"
                                    className="styled-input"
                                    placeholder="••••••••"
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="settings-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-danger-confirm" disabled={deletingAccount}>
                                    {deletingAccount ? 'Deleting...' : 'Permanently Delete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
