import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Wallet, PieChart, Settings, CreditCard,
    Bot, Calendar, Target, Crown, LogOut, ChevronLeft, ChevronRight,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    toggleMobile: () => void;
}

const NAV_ITEMS = [
    { to: '/',            icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/expenses',    icon: CreditCard,      label: 'Expenses'   },
    { to: '/groups',      icon: Users,           label: 'Groups'     },
    { to: '/coach',       icon: Bot,             label: 'AI Coach'   },
    { to: '/bills',       icon: Calendar,        label: 'Bills'      },
    { to: '/goals',       icon: Target,          label: 'Goals'      },
];

const BOTTOM_ITEMS = [
    { to: '/analytics', icon: PieChart,  label: 'Analytics' },
    { to: '/settings',  icon: Settings,  label: 'Settings'  },
];

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, toggleMobile }: SidebarProps) => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const isPremium = userProfile?.isPremium;

    const isExact = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div className="sidebar-overlay" onClick={toggleMobile} />
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Collapse toggle — desktop only */}
                <button className="collapse-btn" onClick={toggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <Wallet size={20} />
                    </div>
                    {!isCollapsed && <span className="brand-name">FinDash</span>}
                </div>

                {/* Main nav */}
                <nav className="nav-section">
                    {!isCollapsed && <span className="nav-section-label">Main</span>}
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={`nav-item ${isExact(to) ? 'active' : ''}`}
                            title={isCollapsed ? label : ''}
                            onClick={() => isMobileOpen && toggleMobile()}
                        >
                            <Icon size={18} />
                            {!isCollapsed && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Premium CTA */}
                {!isPremium && (
                    <NavLink
                        to="/premium"
                        className={`nav-item premium-cta ${isExact('/premium') ? 'active' : ''}`}
                        title={isCollapsed ? 'Go Premium' : ''}
                        onClick={() => isMobileOpen && toggleMobile()}
                    >
                        <Crown size={18} />
                        {!isCollapsed && <span>Go Premium</span>}
                    </NavLink>
                )}

                <div className="nav-divider" />

                {/* Bottom nav */}
                <nav className="nav-section">
                    {!isCollapsed && <span className="nav-section-label">More</span>}
                    {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={`nav-item ${isExact(to) ? 'active' : ''}`}
                            title={isCollapsed ? label : ''}
                            onClick={() => isMobileOpen && toggleMobile()}
                        >
                            <Icon size={18} />
                            {!isCollapsed && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User profile */}
                <div className={`user-profile ${isCollapsed ? 'collapsed' : ''}`}>
                    <div className="avatar" title={displayName}>
                        {initials}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <h4 className="user-name">{displayName}</h4>
                            <p className="user-plan" style={{ color: isPremium ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                                {isPremium ? '✦ Premium' : 'Free Plan'}
                            </p>
                        </div>
                    )}
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title={userProfile?.premiumSource === 'demo' ? 'Exit Demo' : 'Log Out'}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
