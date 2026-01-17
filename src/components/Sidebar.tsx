import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Settings, CreditCard, Bot, Calendar, Target, Crown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const isPremium = userProfile?.isPremium;

    return (
        <aside className="sidebar">
            <div className="brand">
                <Wallet className="brand-icon" size={32} />
                <span>FinDash</span>
            </div>

            <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CreditCard />
                    <span>Expenses</span>
                </NavLink>
                <NavLink to="/coach" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Bot />
                    <span>AI Coach</span>
                </NavLink>
                <NavLink to="/bills" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Calendar />
                    <span>Bills</span>
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Target />
                    <span>Goals</span>
                </NavLink>
                <NavLink to="/premium" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ color: 'var(--accent-secondary)' }}>
                    <Crown />
                    <span>Go Premium</span>
                </NavLink>

                <div style={{ height: '1px', background: 'var(--border-light)', margin: '1rem 0' }}></div>

                <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PieChart />
                    <span>Analytics</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className="user-profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div className="avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h4>{displayName}</h4>
                        <p style={{ color: isPremium ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}>
                            {isPremium ? 'Premium Member' : 'Free Plan'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                    }}
                    title="Log Out"
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-danger)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
