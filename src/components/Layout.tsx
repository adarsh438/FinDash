import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import FloatingAddButton from './FloatingAddButton';
import ExpenseModal from './expense/ExpenseModal';
import EmailVerificationBanner from './EmailVerificationBanner';
import NotificationCenter from './NotificationCenter';
import GlobalSearchModal from './GlobalSearchModal';
import OfflineBanner from './OfflineBanner';
import './Layout.css';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global keyboard listener for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="app-layout">
            <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
            />
            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
                <EmailVerificationBanner />

                {/* Top Desktop & Mobile Header Controls */}
                <div className="top-global-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
                            <Menu size={22} />
                        </button>
                        <span className="mobile-brand">FinDash</span>
                        <button className="global-search-trigger" onClick={() => setIsSearchOpen(true)}>
                            <Search size={15} />
                            <span>Search transactions, goals, bills...</span>
                            <kbd className="search-shortcut">⌘K</kbd>
                        </button>
                    </div>

                    <div className="header-right">
                        <NotificationCenter />
                    </div>
                </div>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>

            {/* Global Floating Add Button + Modals & Banners */}
            <FloatingAddButton onClick={() => setIsExpenseModalOpen(true)} />
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
            />
            <GlobalSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
            <OfflineBanner />
        </div>
    );
};

export default Layout;
