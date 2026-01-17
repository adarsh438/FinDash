import React from 'react';
import { Settings as SettingsIcon, Globe } from 'lucide-react';
import Card from '../components/Card';
import { useCurrency } from '../context/CurrencyContext';

const Settings = () => {
    const { currency, setCurrency } = useCurrency();

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrency(e.target.value as any);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Settings</h1>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <Globe size={20} color="var(--accent-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Preferences</h2>
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>
                            Base Currency
                        </label>
                        <select
                            className="glass-input"
                            value={currency}
                            onChange={handleCurrencyChange}
                            style={{ width: '100%', maxWidth: '300px' }}
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="JPY">JPY (¥)</option>
                        </select>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                            This currency will be used throughout the application.
                        </p>
                    </div>
                </Card>

                {/* Placeholder for other settings */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <SettingsIcon size={20} color="var(--text-secondary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>App Settings</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>More settings coming soon...</p>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
