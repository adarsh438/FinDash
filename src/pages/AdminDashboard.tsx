import React, { useState } from 'react';
import { ShieldAlert, Users, DollarSign, Flag, Megaphone, Search, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { showToast } = useToast();

    // Feature Flags state
    const [flags, setFlags] = useState({
        aiCoach: true,
        groupSplits: true,
        billPredictions: true,
        dataExport: true
    });

    // Announcement state
    const [announcementText, setAnnouncementText] = useState('');
    const [activeAnnouncement, setActiveAnnouncement] = useState('FinDash v2.0 Production Release is live!');

    // User Search
    const [userQuery, setUserQuery] = useState('');

    const MOCK_USERS = [
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'premium', status: 'Active' },
        { id: '2', name: 'Sarah Miller', email: 'sarah@company.io', role: 'free', status: 'Active' },
        { id: '3', name: 'David Chen', email: 'david@tech.com', role: 'premium', status: 'Active' },
    ];

    const toggleFlag = (key: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [key]: !prev[key] }));
        showToast(`Feature flag '${key}' updated`, 'info');
    };

    const handleSaveAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementText.trim()) return;
        setActiveAnnouncement(announcementText.trim());
        showToast('System announcement published!', 'success');
        setAnnouncementText('');
    };

    const filteredUsers = MOCK_USERS.filter(u =>
        u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userQuery.toLowerCase())
    );

    return (
        <div className="admin-dashboard-page animate-fade-in">
            <PageHeader
                title="Admin Control Panel"
                subtitle="Commercial platform management, revenue metrics, and feature flags."
                icon={<ShieldAlert size={22} />}
            />

            {/* Platform Metrics */}
            <div className="admin-stats-grid">
                <Card className="flat admin-stat-card">
                    <Users className="stat-icon" size={20} />
                    <div className="stat-value">1,482</div>
                    <div className="stat-label">Total Registered Users</div>
                </Card>
                <Card className="flat admin-stat-card">
                    <DollarSign className="stat-icon" size={20} />
                    <div className="stat-value">$12,450</div>
                    <div className="stat-label">Monthly Recurring Revenue</div>
                </Card>
                <Card className="flat admin-stat-card">
                    <CheckCircle className="stat-icon" size={20} />
                    <div className="stat-value">99.98%</div>
                    <div className="stat-label">System Uptime SLA</div>
                </Card>
            </div>

            <div className="admin-sections-grid">
                {/* User Management */}
                <Card className="flat">
                    <h3 className="section-heading">User Directory Management</h3>
                    <div className="search-bar" style={{ marginBottom: '1rem' }}>
                        <Search size={16} />
                        <input
                            className="search-input"
                            placeholder="Search user by name or email..."
                            value={userQuery}
                            onChange={e => setUserQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-user-list">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="admin-user-row">
                                <div>
                                    <div className="user-row-name">{u.name}</div>
                                    <div className="user-row-email">{u.email}</div>
                                </div>
                                <span className={`profile-plan-badge ${u.role === 'premium' ? 'premium' : ''}`}>
                                    {u.role.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Feature Flags & System Banner */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Card className="flat">
                        <h3 className="section-heading"><Flag size={16} /> Feature Flags & Toggles</h3>
                        <div className="flag-row">
                            <span>AI Finance Coach Module</span>
                            <button onClick={() => toggleFlag('aiCoach')} className="flag-toggle-btn">
                                {flags.aiCoach ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#64748b" />}
                            </button>
                        </div>
                        <div className="flag-row">
                            <span>Group Bill Split Engine</span>
                            <button onClick={() => toggleFlag('groupSplits')} className="flag-toggle-btn">
                                {flags.groupSplits ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#64748b" />}
                            </button>
                        </div>
                        <div className="flag-row">
                            <span>Predictive Bill Engine</span>
                            <button onClick={() => toggleFlag('billPredictions')} className="flag-toggle-btn">
                                {flags.billPredictions ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#64748b" />}
                            </button>
                        </div>
                    </Card>

                    <Card className="flat">
                        <h3 className="section-heading"><Megaphone size={16} /> Global System Announcement</h3>
                        <p className="announcement-current">
                            Current: <strong>"{activeAnnouncement}"</strong>
                        </p>
                        <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="styled-input"
                                placeholder="Enter announcement text..."
                                value={announcementText}
                                onChange={e => setAnnouncementText(e.target.value)}
                            />
                            <Button type="submit">Publish</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
