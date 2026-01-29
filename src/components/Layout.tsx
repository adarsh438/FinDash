import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
