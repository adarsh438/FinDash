import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Settings, CreditCard, Bot, Calendar, Target, Crown } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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
                <div className="avatar">JD</div>
                <div className="user-info">
                    <h4>John Doe</h4>
                    <p>Premium Member</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
