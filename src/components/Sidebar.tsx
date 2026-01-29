import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Settings, CreditCard, Bot, Calendar, Target, Crown, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const Sidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const isPremium = userProfile?.isPremium;

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button className="collapse-btn" onClick={toggleCollapse}>
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className="brand">
                <Wallet className="brand-icon" size={32} />
                {!isCollapsed && <span>FinDash</span>}
            </div>

            <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
                    <LayoutDashboard />
                    {!isCollapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Expenses" : ""}>
                    <CreditCard />
                    {!isCollapsed && <span>Expenses</span>}
                </NavLink>
                <NavLink to="/coach" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "AI Coach" : ""}>
                    <Bot />
                    {!isCollapsed && <span>AI Coach</span>}
                </NavLink>
                <NavLink to="/bills" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Bills" : ""}>
                    <Calendar />
                    {!isCollapsed && <span>Bills</span>}
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Goals" : ""}>
                    <Target />
                    {!isCollapsed && <span>Goals</span>}
                </NavLink>
                <NavLink to="/premium" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ color: 'var(--accent-secondary)' }} title={isCollapsed ? "Go Premium" : ""}>
                    <Crown />
                    {!isCollapsed && <span>Go Premium</span>}
                </NavLink>

                <div style={{ height: '1px', background: 'var(--border-light)', margin: '1rem 0' }}></div>

                <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Analytics" : ""}>
                    <PieChart />
                    {!isCollapsed && <span>Analytics</span>}
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Settings" : ""}>
                    <Settings />
                    {!isCollapsed && <span>Settings</span>}
                </NavLink>
            </nav>

            <div className="user-profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                    <div className="avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <h4>{displayName}</h4>
                            <p style={{ color: isPremium ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}>
                                {isPremium ? 'Premium Member' : 'Free Plan'}
                            </p>
                        </div>
                    )}
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
                        transition: 'color 0.2s',
                        borderRadius: '8px'
                    }}
                    title={userProfile?.premiumSource === 'demo' ? "Exit Demo Mode" : "Log Out"}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--accent-danger)';
                        e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    <LogOut size={20} />
                    {!isCollapsed && userProfile?.premiumSource === 'demo' && <span style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Exit</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
