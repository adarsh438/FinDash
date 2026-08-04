import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import FloatingAddButton from './FloatingAddButton';
import ExpenseModal from './expense/ExpenseModal';
import './Layout.css';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
            />
            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Mobile header */}
                <div className="mobile-header">
                    <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <span className="mobile-brand">FinDash</span>
                </div>
                <div className="page-content">
                    <Outlet />
                </div>
            </main>

            {/* Global Floating Add Button + Expense Modal */}
            <FloatingAddButton onClick={() => setIsExpenseModalOpen(true)} />
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
